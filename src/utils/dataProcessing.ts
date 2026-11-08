import * as XLSX from 'xlsx';
import { ColumnProfile, DataQualityReport, ImputationMethod, VariableType } from '../types';
import { mean, median, standardDeviation, iqr, skewness } from './econometrics';

/**
 * Parses CSV/TXT string into array of objects and headers
 */
export function parseCSV(content: string): { headers: string[]; data: Record<string, string | number>[] } {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return { headers: [], data: [] };

  // Detect delimiter: comma, semicolon or tab
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes(';') && (firstLine.split(';').length > firstLine.split(',').length)) {
    delimiter = ';';
  } else if (firstLine.includes('\t') && (firstLine.split('\t').length > firstLine.split(',').length)) {
    delimiter = '\t';
  }

  const rawHeaders = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
  // clean duplicate or empty headers
  const headers = rawHeaders.map((h, i) => h || `Col_${i + 1}`);

  const data: Record<string, string | number>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
    if (values.length === headers.length || values.some(v => v !== '')) {
      const row: Record<string, string | number> = {};
      headers.forEach((h, idx) => {
        const rawVal = values[idx];
        if (rawVal === undefined || rawVal === '' || rawVal.toLowerCase() === 'nan' || rawVal.toLowerCase() === 'null') {
          row[h] = '';
        } else {
          // Normalize decimals if using comma
          const numCandidate = rawVal.replace(',', '.');
          const num = Number(numCandidate);
          row[h] = isNaN(num) ? rawVal : num;
        }
      });
      data.push(row);
    }
  }

  return { headers, data };
}

/**
 * Parses ArrayBuffer from XLSX or XLS file using SheetJS
 */
export function parseExcel(buffer: ArrayBuffer): { headers: string[]; data: Record<string, string | number>[] } {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { header: 1 }) as any[][];

  if (!rawRows || rawRows.length === 0) return { headers: [], data: [] };

  const rawHeaders = (rawRows[0] || []).map((h: any, idx: number) => String(h || `Col_${idx + 1}`).trim());
  const data: Record<string, string | number>[] = [];

  for (let r = 1; r < rawRows.length; r++) {
    const rowValues = rawRows[r];
    if (!rowValues || rowValues.length === 0) continue;
    const row: Record<string, string | number> = {};
    rawHeaders.forEach((h: string, idx: number) => {
      const val = rowValues[idx];
      if (val === undefined || val === null || val === '') {
        row[h] = '';
      } else {
        const num = Number(val);
        row[h] = !isNaN(num) && typeof val !== 'boolean' ? num : String(val).trim();
      }
    });
    data.push(row);
  }

  return { headers: rawHeaders, data };
}

/**
 * Profile each column to determine types, distributions and data quality
 */
export function profileDataset(headers: string[], data: Record<string, string | number>[]): DataQualityReport {
  const totalRows = data.length;
  const totalCols = headers.length;
  let totalMissingCells = 0;
  let duplicateRows = 0;

  // Check duplicate rows via row hash string
  const seenRows = new Set<string>();
  data.forEach(row => {
    const rowKey = JSON.stringify(row);
    if (seenRows.has(rowKey)) {
      duplicateRows++;
    } else {
      seenRows.add(rowKey);
    }
  });

  const profiles: ColumnProfile[] = headers.map(name => {
    const values = data.map(r => r[name]);
    const missingValues = values.filter(v => v === '' || v === null || v === undefined || (typeof v === 'number' && isNaN(v)));
    const missingCount = missingValues.length;
    totalMissingCells += missingCount;

    const nonMissing = values.filter(v => v !== '' && v !== null && v !== undefined && !(typeof v === 'number' && isNaN(v)));
    const numericValues = nonMissing.map(v => Number(v)).filter(v => !isNaN(v));

    // Determine type
    let type: VariableType = 'categorical';
    if (numericValues.length / (nonMissing.length || 1) > 0.8) {
      type = 'numeric';
    } else if (nonMissing.some(v => typeof v === 'string' && !isNaN(Date.parse(v)) && v.includes('-'))) {
      type = 'datetime';
    }

    const uniqueSet = new Set(nonMissing);
    const uniqueCount = uniqueSet.size;

    let colMean: number | undefined;
    let colMedian: number | undefined;
    let colStd: number | undefined;
    let colMin: number | undefined;
    let colMax: number | undefined;
    let colIqr: number | undefined;
    let colSkew: number | undefined;
    let outliersCount = 0;

    if (type === 'numeric' && numericValues.length > 0) {
      colMean = Math.round(mean(numericValues) * 100) / 100;
      colMedian = Math.round(median(numericValues) * 100) / 100;
      colStd = Math.round(standardDeviation(numericValues) * 100) / 100;
      colMin = Math.min(...numericValues);
      colMax = Math.max(...numericValues);
      const iqrObj = iqr(numericValues);
      colIqr = iqrObj.iqrVal;
      colSkew = Math.round(skewness(numericValues) * 100) / 100;

      // Detect outliers: values outside [Q1 - 1.5 IQR, Q3 + 1.5 IQR]
      const lowerBound = iqrObj.q1 - 1.5 * iqrObj.iqrVal;
      const upperBound = iqrObj.q3 + 1.5 * iqrObj.iqrVal;
      outliersCount = numericValues.filter(v => v < lowerBound || v > upperBound).length;
    }

    return {
      name,
      type,
      missingCount,
      missingPct: totalRows > 0 ? Math.round((missingCount / totalRows) * 1000) / 10 : 0,
      uniqueCount,
      mean: colMean,
      median: colMedian,
      stdDev: colStd,
      min: colMin,
      max: colMax,
      iqr: colIqr,
      outliersCount,
      skewness: colSkew,
      sampleValues: nonMissing.slice(0, 5)
    };
  });

  const totalCells = totalRows * totalCols;
  const missingCellsPct = totalCells > 0 ? Math.round((totalMissingCells / totalCells) * 1000) / 10 : 0;
  const columnsWithOutliers = profiles.filter(p => p.outliersCount > 0).length;

  // Data health score: 100 - penalties
  let healthScore = 100;
  healthScore -= Math.min(40, missingCellsPct * 2);
  healthScore -= Math.min(20, (duplicateRows / (totalRows || 1)) * 100);
  healthScore -= Math.min(20, columnsWithOutliers * 4);
  healthScore = Math.max(10, Math.round(healthScore));

  return {
    totalRows,
    totalCols,
    duplicateRows,
    totalMissingCells,
    missingCellsPct,
    columnsWithOutliers,
    healthScore,
    profiles
  };
}

/**
 * Execute Imputation on Dataset
 */
export function imputeDataset(
  headers: string[],
  data: Record<string, string | number>[],
  columnName: string,
  method: ImputationMethod
): Record<string, string | number>[] {
  const values = data.map(r => r[columnName]);
  const nonMissing = values.filter(v => v !== '' && v !== null && v !== undefined && !(typeof v === 'number' && isNaN(v)));
  const numericValues = nonMissing.map(v => Number(v)).filter(v => !isNaN(v));

  if (method === 'drop_row') {
    return data.filter(r => {
      const v = r[columnName];
      return v !== '' && v !== null && v !== undefined && !(typeof v === 'number' && isNaN(v));
    });
  }

  let replacementVal: string | number = '';
  if (method === 'mean' && numericValues.length > 0) {
    replacementVal = Math.round(mean(numericValues) * 100) / 100;
  } else if (method === 'median' && numericValues.length > 0) {
    replacementVal = median(numericValues);
  } else if (method === 'mode') {
    // Mode calculation
    const counts = new Map<string | number, number>();
    nonMissing.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
    let topVal = nonMissing[0];
    let topCount = 0;
    counts.forEach((c, v) => {
      if (c > topCount) {
        topCount = c;
        topVal = v;
      }
    });
    replacementVal = topVal;
  }

  let lastValid: string | number = replacementVal;
  return data.map(row => {
    const v = row[columnName];
    const isMissing = v === '' || v === null || v === undefined || (typeof v === 'number' && isNaN(v));

    if (method === 'forward_fill') {
      if (!isMissing) {
        lastValid = v;
        return { ...row };
      } else {
        return { ...row, [columnName]: lastValid };
      }
    }

    if (isMissing) {
      return { ...row, [columnName]: replacementVal };
    }
    return { ...row };
  });
}

/**
 * Remove duplicate rows
 */
export function removeDuplicates(data: Record<string, string | number>[]): Record<string, string | number>[] {
  const seen = new Set<string>();
  return data.filter(row => {
    const key = JSON.stringify(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Automatically create dummy variables (one-hot encoding) for categorical columns
 */
export function createDummyVariables(
  headers: string[],
  data: Record<string, string | number>[],
  targetColumn: string
): { updatedHeaders: string[]; updatedData: Record<string, string | number>[] } {
  const uniqueValues = Array.from(new Set(data.map(r => String(r[targetColumn]))))
    .filter(v => v !== '' && v !== 'undefined');

  // To prevent dummy variable trap, use k-1 dummies
  const dummyCategories = uniqueValues.slice(0, uniqueValues.length - 1);
  const newDummyHeaders = dummyCategories.map(cat => `${targetColumn}_dummy_${cat.replace(/\s+/g, '_')}`);

  const updatedHeaders = [...headers.filter(h => h !== targetColumn), ...newDummyHeaders];
  const updatedData = data.map(row => {
    const newRow = { ...row };
    delete newRow[targetColumn];
    dummyCategories.forEach((cat, idx) => {
      newRow[newDummyHeaders[idx]] = String(row[targetColumn]) === cat ? 1 : 0;
    });
    return newRow;
  });

  return { updatedHeaders, updatedData };
}
