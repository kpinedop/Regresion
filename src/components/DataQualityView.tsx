import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Wrench, 
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { DataQualityReport, ImputationMethod } from '../types';
import { parseCSV, parseExcel, imputeDataset, removeDuplicates, createDummyVariables } from '../utils/dataProcessing';
import { PRELOADED_DATASETS, PreloadedDataset } from '../utils/datasets';

interface DataQualityViewProps {
  headers: string[];
  data: Record<string, string | number>[];
  qualityReport: DataQualityReport;
  fileName: string;
  onUpdateData: (newHeaders: string[], newData: Record<string, string | number>[], newFileName?: string) => void;
  onContinue: () => void;
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({
  headers,
  data,
  qualityReport,
  fileName,
  onUpdateData,
  onContinue
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedColForImpute, setSelectedColForImpute] = useState<string>(headers[0] || '');
  const [selectedImputeMethod, setSelectedImputeMethod] = useState<ImputationMethod>('median');
  const [imputeSuccessMsg, setImputeSuccessMsg] = useState<string | null>(null);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();

    if (ext === 'xlsx' || ext === 'xls') {
      reader.onload = (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        if (buffer) {
          const { headers: parsedHeaders, data: parsedData } = parseExcel(buffer);
          onUpdateData(parsedHeaders, parsedData, file.name);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const { headers: parsedHeaders, data: parsedData } = parseCSV(text);
          onUpdateData(parsedHeaders, parsedData, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  // Imputation handler
  const handleRunImputation = () => {
    if (!selectedColForImpute) return;
    const imputed = imputeDataset(headers, data, selectedColForImpute, selectedImputeMethod);
    onUpdateData(headers, imputed, fileName);
    setImputeSuccessMsg(`Imputación completada con éxito en '${selectedColForImpute}' usando '${selectedImputeMethod}'.`);
    setTimeout(() => setImputeSuccessMsg(null), 3000);
  };

  // Remove duplicates handler
  const handleRemoveDuplicates = () => {
    const cleaned = removeDuplicates(data);
    onUpdateData(headers, cleaned, fileName);
    setImputeSuccessMsg(`Se eliminaron ${data.length - cleaned.length} filas duplicadas.`);
    setTimeout(() => setImputeSuccessMsg(null), 3000);
  };

  // Dummy variable handler
  const handleCreateDummies = (colName: string) => {
    const { updatedHeaders, updatedData } = createDummyVariables(headers, data, colName);
    onUpdateData(updatedHeaders, updatedData, fileName);
    setImputeSuccessMsg(`Se crearon variables dummy para '${colName}'.`);
    setTimeout(() => setImputeSuccessMsg(null), 3000);
  };

  // Color for health score
  const getHealthBadge = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-950/40 border-emerald-800';
    if (score >= 65) return 'text-amber-400 bg-amber-950/40 border-amber-800';
    return 'text-rose-400 bg-rose-950/40 border-rose-800';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Upload & Overview Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Fase 2: Diagnóstico y Preparación de Datos</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Dataset Activo: {fileName}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Dimensiones: <span className="font-mono text-slate-200">{qualityReport.totalRows} filas</span> × <span className="font-mono text-slate-200">{qualityReport.totalCols} variables</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".csv,.txt,.xlsx,.xls" 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Archivo (CSV/Excel)</span>
            </button>
            <button
              onClick={onContinue}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
            >
              <span>Exploración EDA</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Health Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Score de Salud de Datos</span>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold font-mono px-2 py-0.5 rounded border ${getHealthBadge(qualityReport.healthScore)}`}>
                {qualityReport.healthScore}/100
              </span>
              <span className="text-[11px] text-slate-400">
                {qualityReport.healthScore >= 80 ? 'Óptimo para modelar' : 'Requiere limpieza'}
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Valores Faltantes (NaN)</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-mono text-slate-200">{qualityReport.totalMissingCells}</span>
              <span className="text-[11px] text-slate-400">({qualityReport.missingCellsPct}% celdas)</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] text-slate-400">Filas Duplicadas</span>
              {qualityReport.duplicateRows > 0 && (
                <button
                  onClick={handleRemoveDuplicates}
                  className="text-[10px] text-rose-400 hover:text-rose-300 underline"
                >
                  Eliminar
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-mono text-slate-200">{qualityReport.duplicateRows}</span>
              <span className="text-[11px] text-slate-400">registros idénticos</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">Columnas con Atípicos (IQR)</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-mono text-slate-200">{qualityReport.columnsWithOutliers}</span>
              <span className="text-[11px] text-slate-400">con valores extremos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Imputation & Preprocessing Tool */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">
              Herramienta de Imputación y Transformación de Variables
            </h2>
          </div>
          {imputeSuccessMsg && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> {imputeSuccessMsg}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Variable a Tratar
            </label>
            <select
              value={selectedColForImpute}
              onChange={(e) => setSelectedColForImpute(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {headers.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Método de Imputación
            </label>
            <select
              value={selectedImputeMethod}
              onChange={(e) => setSelectedImputeMethod(e.target.value as ImputationMethod)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="median">Mediana (Recomendada para datos con asimetría)</option>
              <option value="mean">Media aritmética (Distribuciones normales)</option>
              <option value="mode">Moda (Frecuencia más común / Categóricas)</option>
              <option value="forward_fill">Forward Fill (Series temporales)</option>
              <option value="drop_row">Eliminar filas con valor faltante</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunImputation}
              className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ejecutar Imputación</span>
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => handleCreateDummies(selectedColForImpute)}
              className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Crear Variables Dummy</span>
            </button>
          </div>
        </div>
      </div>

      {/* First 5 rows table preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            Vista Previa de Datos (Primeras 5 Filas)
          </h2>
          <span className="text-xs text-slate-400">
            Formato tabular verificado
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-3.5 py-2.5 font-medium text-slate-500 w-12 text-center">#</th>
                {headers.map(h => {
                  const prof = qualityReport.profiles.find(p => p.name === h);
                  return (
                    <th key={h} className="px-3.5 py-2.5 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-200">{h}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono px-1 py-0.5 bg-slate-900 rounded">
                          {prof?.type || 'var'}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {data.slice(0, 5).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-3.5 py-2 text-slate-500 text-center">{idx + 1}</td>
                  {headers.map(h => (
                    <td key={h} className="px-3.5 py-2 whitespace-nowrap tabular-nums">
                      {row[h] !== '' && row[h] !== undefined ? String(row[h]) : <span className="text-rose-400 italic">null</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Column Quality & Profiling Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">
          Perfil de Calidad por Variable
        </h2>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-3.5 py-2.5 font-medium">Variable</th>
                <th className="px-3.5 py-2.5 font-medium">Tipo</th>
                <th className="px-3.5 py-2.5 font-medium text-right">Faltantes (%)</th>
                <th className="px-3.5 py-2.5 font-medium text-right">Media</th>
                <th className="px-3.5 py-2.5 font-medium text-right">Mediana</th>
                <th className="px-3.5 py-2.5 font-medium text-right">Desv. Est.</th>
                <th className="px-3.5 py-2.5 font-medium text-right">Mín - Máx</th>
                <th className="px-3.5 py-2.5 font-medium text-right">Atípicos (IQR)</th>
                <th className="px-3.5 py-2.5 font-medium">Sugerencia Imputación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {qualityReport.profiles.map(prof => {
                const isNumeric = prof.type === 'numeric';
                const hasMissing = prof.missingCount > 0;
                let suggestion = 'Ninguna requerida';
                if (hasMissing) {
                  if (prof.type === 'categorical') suggestion = 'Moda / Valor más frecuente';
                  else if (Math.abs(prof.skewness || 0) > 1) suggestion = 'Mediana (alta asimetría)';
                  else suggestion = 'Media aritmética';
                }

                return (
                  <tr key={prof.name} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-3.5 py-2.5 font-medium text-slate-200">{prof.name}</td>
                    <td className="px-3.5 py-2.5">
                      <span className="font-mono text-[11px] text-indigo-400 uppercase">
                        {prof.type}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono tabular-nums">
                      {prof.missingCount > 0 ? (
                        <span className="text-rose-400 font-semibold">{prof.missingPct}% ({prof.missingCount})</span>
                      ) : (
                        <span className="text-slate-400">0%</span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono tabular-nums text-slate-300">
                      {isNumeric && prof.mean !== undefined ? prof.mean : '-'}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono tabular-nums text-slate-300">
                      {isNumeric && prof.median !== undefined ? prof.median : '-'}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono tabular-nums text-slate-300">
                      {isNumeric && prof.stdDev !== undefined ? prof.stdDev : '-'}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono tabular-nums text-slate-400">
                      {isNumeric && prof.min !== undefined ? `${prof.min} - ${prof.max}` : '-'}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono tabular-nums">
                      {prof.outliersCount > 0 ? (
                        <span className="text-amber-400 font-medium">{prof.outliersCount} filas</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-400">
                      {suggestion}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
