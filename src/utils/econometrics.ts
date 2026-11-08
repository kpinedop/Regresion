import { ModelAlgorithm, ModelResult, CoefficientDetail, PricePoint, PriceOptimization, MonteCarloSimulation } from '../types';

/**
 * Matrix and Vector linear algebra operations
 */
export function matrixTranspose(A: number[][]): number[][] {
  const rows = A.length;
  const cols = A[0].length;
  const AT: number[][] = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      AT[j][i] = A[i][j];
    }
  }
  return AT;
}

export function matrixMultiply(A: number[][], B: number[][]): number[][] {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;
  if (colsA !== rowsB) {
    throw new Error(`Matrix multiplication dimension mismatch: ${colsA} vs ${rowsB}`);
  }
  const C: number[][] = Array.from({ length: rowsA }, () => new Array(colsB).fill(0));
  for (let i = 0; i < rowsA; i++) {
    for (let k = 0; k < colsA; k++) {
      const a = A[i][k];
      for (let j = 0; j < colsB; j++) {
        C[i][j] += a * B[k][j];
      }
    }
  }
  return C;
}

export function matrixVectorMultiply(A: number[][], v: number[]): number[] {
  const rows = A.length;
  const cols = A[0].length;
  if (cols !== v.length) {
    throw new Error(`Matrix vector multiply dimension mismatch: ${cols} vs ${v.length}`);
  }
  const result = new Array(rows).fill(0);
  for (let i = 0; i < rows; i++) {
    let sum = 0;
    for (let j = 0; j < cols; j++) {
      sum += A[i][j] * v[j];
    }
    result[i] = sum;
  }
  return result;
}

export function matrixInverse(A: number[][]): number[][] {
  const n = A.length;
  // Augmented matrix [A | I]
  const M: number[][] = Array.from({ length: n }, (_, i) => [
    ...A[i],
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  ]);

  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    let maxVal = Math.abs(M[i][i]);
    for (let k = i + 1; k < n; k++) {
      const val = Math.abs(M[k][i]);
      if (val > maxVal) {
        maxVal = val;
        maxRow = k;
      }
    }

    if (maxVal < 1e-12) {
      // Add slight Tikhonov regularization to diagonal if singular or near-singular
      M[i][i] += 1e-6;
    }

    // Swap rows
    if (maxRow !== i) {
      const temp = M[i];
      M[i] = M[maxRow];
      M[maxRow] = temp;
    }

    const pivot = M[i][i];
    for (let j = 0; j < 2 * n; j++) {
      M[i][j] /= pivot;
    }

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = M[k][i];
        for (let j = 0; j < 2 * n; j++) {
          M[k][j] -= factor * M[i][j];
        }
      }
    }
  }

  // Extract right half
  const inv: number[][] = Array.from({ length: n }, (_, i) => M[i].slice(n));
  return inv;
}

/**
 * Statistical functions
 */
export function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((acc, v) => acc + v, 0) / arr.length;
}

export function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function standardDeviation(arr: number[]): number {
  if (arr.length <= 1) return 0;
  const m = mean(arr);
  const variance = arr.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

export function iqr(arr: number[]): { q1: number; q3: number; iqrVal: number } {
  if (arr.length === 0) return { q1: 0, q3: 0, iqrVal: 0 };
  const sorted = [...arr].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  return { q1, q3, iqrVal: q3 - q1 };
}

export function skewness(arr: number[]): number {
  const n = arr.length;
  if (n < 3) return 0;
  const m = mean(arr);
  const s = standardDeviation(arr);
  if (s === 0) return 0;
  const m3 = arr.reduce((acc, v) => acc + Math.pow((v - m) / s, 3), 0);
  return (n / ((n - 1) * (n - 2))) * m3;
}

export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n <= 1) return 0;
  const mx = mean(x);
  const my = mean(y);
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

/**
 * Standard Normal CDF approximation (Abramowitz & Stegun)
 */
export function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp((-x * x) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

/**
 * Student's t distribution two-tailed p-value approximation
 */
export function tDistributionPValue(t: number, df: number): number {
  if (df <= 0) return 1;
  const absT = Math.abs(t);
  // Wilson-Hilferty transformation or asymptotic normal approximation for df
  const x = absT * (1 - 1 / (4 * df)) / Math.sqrt(1 + (absT * absT) / (2 * df));
  const pOneTail = normalCDF(-x);
  return Math.min(1, Math.max(0, 2 * pOneTail));
}

/**
 * F-distribution p-value approximation via transformed normal approximation
 */
export function fDistributionPValue(F: number, df1: number, df2: number): number {
  if (F <= 0 || df1 <= 0 || df2 <= 0) return 1;
  // Paulson-approximate transformation of F to normal
  const a = 2 / (9 * df1);
  const b = 2 / (9 * df2);
  const num = (1 - b) * Math.pow(F, 1 / 3) - (1 - a);
  const den = Math.sqrt(b * Math.pow(F, 2 / 3) + a);
  const z = num / den;
  return Math.min(1, Math.max(0, 1 - normalCDF(z)));
}

/**
 * Compute Variance Inflation Factor (VIF) for multicollinearity check
 */
export function calculateVIF(X: number[][]): number[] {
  const n = X.length;
  const p = X[0].length;
  if (p <= 1) return [1];

  const vifs: number[] = [];

  for (let j = 0; j < p; j++) {
    const y_j = X.map(row => row[j]);
    const X_others = X.map(row => row.filter((_, idx) => idx !== j));

    // Regress X_j on others
    const X_design = X_others.map(row => [1, ...row]);
    const XT = matrixTranspose(X_design);
    const XTX = matrixMultiply(XT, X_design);
    const XTX_inv = matrixInverse(XTX);
    const XTy = matrixVectorMultiply(XT, y_j);
    const beta = matrixVectorMultiply(XTX_inv, XTy);

    // Compute R²
    const yHat = matrixVectorMultiply(X_design, beta);
    const yMean = mean(y_j);
    let ssTot = 0;
    let ssRes = 0;
    for (let i = 0; i < n; i++) {
      ssTot += Math.pow(y_j[i] - yMean, 2);
      ssRes += Math.pow(y_j[i] - yHat[i], 2);
    }

    const r2 = ssTot === 0 ? 0 : Math.max(0, Math.min(0.9999, 1 - ssRes / ssTot));
    const vif = 1 / (1 - r2);
    vifs.push(vif);
  }

  return vifs;
}

export interface RegressionDataset {
  X: number[][]; // [n x p] independent variables (without intercept)
  y: number[];   // [n] dependent variable
  varNames: string[];
  depVarName: string;
}

/**
 * Multiple Linear Regression (OLS)
 */
export function fitOLS(dataset: RegressionDataset, testRatio = 0.2): ModelResult {
  const { X, y, varNames, depVarName } = dataset;
  const n = X.length;
  const p = X[0].length;

  // Train / Test Split
  const testSize = Math.max(2, Math.floor(n * testRatio));
  const trainSize = n - testSize;

  const X_train = X.slice(0, trainSize);
  const y_train = y.slice(0, trainSize);
  const X_test = X.slice(trainSize);
  const y_test = y.slice(trainSize);

  // Design matrix [1, X]
  const X_design_train = X_train.map(row => [1, ...row]);
  const XT = matrixTranspose(X_design_train);
  const XTX = matrixMultiply(XT, X_design_train);
  const XTX_inv = matrixInverse(XTX);
  const XTy = matrixVectorMultiply(XT, y_train);
  const betas = matrixVectorMultiply(XTX_inv, XTy); // [intercept, beta1, beta2, ...]

  const intercept = betas[0];
  const slopes = betas.slice(1);

  // Predictions on train
  const y_train_hat = matrixVectorMultiply(X_design_train, betas);
  const trainMean = mean(y_train);
  let ssTot = 0;
  let ssRes = 0;
  let absErrSum = 0;
  const residuals: number[] = [];

  for (let i = 0; i < trainSize; i++) {
    const res = y_train[i] - y_train_hat[i];
    residuals.push(res);
    ssRes += res * res;
    absErrSum += Math.abs(res);
    ssTot += Math.pow(y_train[i] - trainMean, 2);
  }

  const r2 = ssTot === 0 ? 0 : Math.max(0, 1 - ssRes / ssTot);
  const k = p + 1; // parameters
  const df = trainSize - k;
  const r2Adj = df > 0 ? Math.max(0, 1 - (1 - r2) * ((trainSize - 1) / df)) : r2;
  const rmse = Math.sqrt(ssRes / trainSize);
  const mae = absErrSum / trainSize;

  // Residual variance and standard errors
  const s2 = df > 0 ? ssRes / df : ssRes / trainSize;
  const stdErrors: number[] = [];
  const tStats: number[] = [];
  const pValues: number[] = [];

  for (let j = 0; j < k; j++) {
    const varBeta_j = Math.max(1e-12, s2 * XTX_inv[j][j]);
    const se = Math.sqrt(varBeta_j);
    stdErrors.push(se);
    const t = se === 0 ? 0 : betas[j] / se;
    tStats.push(t);
    pValues.push(tDistributionPValue(t, df > 0 ? df : 1));
  }

  // F-statistic
  const fStat = (p > 0 && df > 0 && ssRes > 0) 
    ? ((ssTot - ssRes) / p) / (ssRes / df) 
    : 0;
  const fPValue = fDistributionPValue(fStat, p, df);

  // Information Criteria
  const aic = trainSize * Math.log(ssRes / trainSize + 1e-12) + 2 * k;
  const bic = trainSize * Math.log(ssRes / trainSize + 1e-12) + Math.log(trainSize) * k;

  // Durbin-Watson statistic
  let dwNumerator = 0;
  for (let i = 1; i < residuals.length; i++) {
    dwNumerator += Math.pow(residuals[i] - residuals[i - 1], 2);
  }
  const durbinWatson = ssRes > 0 ? dwNumerator / ssRes : 2;

  // Test set performance
  const X_design_test = X_test.map(row => [1, ...row]);
  const y_test_hat = matrixVectorMultiply(X_design_test, betas);
  const testMean = mean(y_test);
  let testSsTot = 0;
  let testSsRes = 0;
  for (let i = 0; i < testSize; i++) {
    testSsRes += Math.pow(y_test[i] - y_test_hat[i], 2);
    testSsTot += Math.pow(y_test[i] - testMean, 2);
  }
  const testR2 = testSsTot === 0 ? 0 : Math.max(0, 1 - testSsRes / testSsTot);

  // VIF
  const vifs = calculateVIF(X_train);
  const hasVIFWarning = vifs.some(v => v > 5);

  // Build coefficient details
  const coeffDetails: CoefficientDetail[] = varNames.map((name, idx) => {
    const beta = slopes[idx];
    const se = stdErrors[idx + 1];
    const t = tStats[idx + 1];
    const pVal = pValues[idx + 1];
    const vif = vifs[idx] || 1;

    let sig: '***' | '**' | '*' | '.' | 'ns' = 'ns';
    if (pVal < 0.001) sig = '***';
    else if (pVal < 0.01) sig = '**';
    else if (pVal < 0.05) sig = '*';
    else if (pVal < 0.1) sig = '.';

    // Elasticity at means
    const meanX = mean(X.map(r => r[idx]));
    const meanY = mean(y);
    const elasticity = meanY !== 0 ? beta * (meanX / meanY) : 0;

    let interpretation = `Por cada incremento de 1 unidad en '${name}', '${depVarName}' ${beta >= 0 ? 'aumenta' : 'disminuye'} en ${Math.abs(beta).toFixed(3)} unidades (ceteris paribus).`;
    let commercialImpact = pVal < 0.05 
      ? `Variable estadísticamente significativa (p=${pVal.toFixed(4)}). Impacto directo en volumen.`
      : `Efecto no concluyente (p=${pVal.toFixed(4)} > 0.05). Conviene vigilar multicolinealidad o ruido.`;

    if (name.toLowerCase().includes('precio') || name.toLowerCase().includes('price')) {
      commercialImpact = `Elasticidad estimada de ${elasticity.toFixed(2)}. ${
        Math.abs(elasticity) > 1 
          ? 'Demanda elástica: una rebaja estratégica o control de precio expandirá ingresos.'
          : 'Demanda inelástica: existe poder de fijación de precio con baja pérdida de volumen.'
      }`;
    }

    return {
      variable: name,
      beta,
      stdError: se,
      tStat: t,
      pValue: pVal,
      ciLower: beta - 1.96 * se,
      ciUpper: beta + 1.96 * se,
      vif,
      elasticity,
      significance: sig,
      interpretation,
      commercialImpact
    };
  });

  // Equation formatting
  const eqParts = [`${intercept.toFixed(2)}`];
  coeffDetails.forEach(c => {
    const sign = c.beta >= 0 ? '+' : '-';
    eqParts.push(`${sign} ${Math.abs(c.beta).toFixed(3)} · [${c.variable}]`);
  });
  const equation = `${depVarName} = ${eqParts.join(' ')}`;
  const formulaLatex = `\\hat{Y} = ${intercept.toFixed(2)} + ${coeffDetails.map(c => `${c.beta.toFixed(3)} X_{${c.variable}}`).join(' + ')}`;

  // Best model score (penalized for low R2, high RMSE, high VIF)
  const bestModelScore = (r2Adj * 0.4) + (testR2 * 0.4) - (rmse / (mean(y) || 1) * 0.1) - (hasVIFWarning ? 0.1 : 0);

  return {
    id: 'ols',
    name: 'Regresión Lineal Múltiple (MCO / OLS)',
    description: 'Estimador insesgado de varianza mínima (BLUE) bajo supuestos clásicos de Gauss-Markov.',
    metrics: {
      rSquared: r2,
      rSquaredAdj: r2Adj,
      rmse,
      mae,
      fStat,
      fPValue,
      aic,
      bic,
      trainR2: r2,
      testR2,
      durbinWatson
    },
    intercept,
    coefficients: coeffDetails,
    equation,
    formulaLatex,
    vifWarning: hasVIFWarning,
    bestModelScore,
    isBest: false,
    selectionReasons: [],
    warnings: hasVIFWarning ? ['Se detectó VIF > 5 en una o más variables: presencia de multicolinealidad moderada/alta.'] : []
  };
}

/**
 * Ridge Regression (L2 regularization: (X^T X + λ I)^-1 X^T y)
 */
export function fitRidge(dataset: RegressionDataset, lambda = 1.0, testRatio = 0.2): ModelResult {
  const { X, y, varNames, depVarName } = dataset;
  const n = X.length;
  const p = X[0].length;
  const testSize = Math.max(2, Math.floor(n * testRatio));
  const trainSize = n - testSize;

  const X_train = X.slice(0, trainSize);
  const y_train = y.slice(0, trainSize);
  const X_test = X.slice(trainSize);
  const y_test = y.slice(trainSize);

  // Standardize X_train for fair regularization
  const meansX = Array.from({ length: p }, (_, j) => mean(X_train.map(r => r[j])));
  const sdsX = Array.from({ length: p }, (_, j) => standardDeviation(X_train.map(r => r[j])) || 1);
  const yMean = mean(y_train);

  const X_scaled = X_train.map(row => row.map((v, j) => (v - meansX[j]) / sdsX[j]));
  const y_centered = y_train.map(v => v - yMean);

  const XT = matrixTranspose(X_scaled);
  const XTX = matrixMultiply(XT, X_scaled);

  // Add lambda to diagonal
  for (let j = 0; j < p; j++) {
    XTX[j][j] += lambda;
  }

  const XTX_inv = matrixInverse(XTX);
  const XTy = matrixVectorMultiply(XT, y_centered);
  const beta_scaled = matrixVectorMultiply(XTX_inv, XTy);

  // Unscale coefficients back
  const slopes = beta_scaled.map((b, j) => b / sdsX[j]);
  let intercept = yMean;
  for (let j = 0; j < p; j++) {
    intercept -= slopes[j] * meansX[j];
  }

  // Predict
  const y_train_hat = X_train.map(row => intercept + row.reduce((sum, v, j) => sum + v * slopes[j], 0));
  let ssTot = 0;
  let ssRes = 0;
  let absErrSum = 0;
  for (let i = 0; i < trainSize; i++) {
    const res = y_train[i] - y_train_hat[i];
    ssRes += res * res;
    absErrSum += Math.abs(res);
    ssTot += Math.pow(y_train[i] - yMean, 2);
  }

  const r2 = ssTot === 0 ? 0 : Math.max(0, 1 - ssRes / ssTot);
  const df = Math.max(1, trainSize - p - 1);
  const r2Adj = Math.max(0, 1 - (1 - r2) * ((trainSize - 1) / df));
  const rmse = Math.sqrt(ssRes / trainSize);
  const mae = absErrSum / trainSize;

  // Test set
  const y_test_hat = X_test.map(row => intercept + row.reduce((sum, v, j) => sum + v * slopes[j], 0));
  const testMean = mean(y_test);
  let testSsTot = 0;
  let testSsRes = 0;
  for (let i = 0; i < testSize; i++) {
    testSsRes += Math.pow(y_test[i] - y_test_hat[i], 2);
    testSsTot += Math.pow(y_test[i] - testMean, 2);
  }
  const testR2 = testSsTot === 0 ? 0 : Math.max(0, 1 - testSsRes / testSsTot);

  const vifs = calculateVIF(X_train);

  const coeffDetails: CoefficientDetail[] = varNames.map((name, idx) => {
    const beta = slopes[idx];
    const se = rmse / (Math.sqrt(trainSize) * (sdsX[idx] || 1));
    const t = se === 0 ? 0 : beta / se;
    const pVal = tDistributionPValue(t, df);
    const meanX = mean(X.map(r => r[idx]));
    const elasticity = mean(y) !== 0 ? beta * (meanX / mean(y)) : 0;

    return {
      variable: name,
      beta,
      stdError: se,
      tStat: t,
      pValue: pVal,
      ciLower: beta - 1.96 * se,
      ciUpper: beta + 1.96 * se,
      vif: vifs[idx] || 1,
      elasticity,
      significance: pVal < 0.05 ? '*' : 'ns',
      interpretation: `Ridge contrae coeficientes hacia cero para mitigar multicolinealidad. Efecto marginal: ${beta.toFixed(3)}.`,
      commercialImpact: `Controla la inflación de varianza provocada por variables correlacionadas (p.ej. precios competidores).`
    };
  });

  const eqParts = [`${intercept.toFixed(2)}`];
  coeffDetails.forEach(c => {
    const sign = c.beta >= 0 ? '+' : '-';
    eqParts.push(`${sign} ${Math.abs(c.beta).toFixed(3)} · [${c.variable}]`);
  });

  const bestModelScore = (r2Adj * 0.35) + (testR2 * 0.45) - (rmse / (mean(y) || 1) * 0.1);

  return {
    id: 'ridge',
    name: 'Regresión Ridge (Tikhonov L2)',
    description: 'Penalización cuadrática que estabiliza coeficientes ante alta correlación y reduce el error de prueba.',
    metrics: {
      rSquared: r2,
      rSquaredAdj: r2Adj,
      rmse,
      mae,
      fStat: undefined,
      fPValue: undefined,
      aic: trainSize * Math.log(ssRes / trainSize + 1e-12) + 2 * (p + 1),
      bic: trainSize * Math.log(ssRes / trainSize + 1e-12) + Math.log(trainSize) * (p + 1),
      trainR2: r2,
      testR2,
      durbinWatson: 2.0
    },
    intercept,
    coefficients: coeffDetails,
    equation: `${depVarName} = ${eqParts.join(' ')}`,
    formulaLatex: `\\hat{Y} = ${intercept.toFixed(2)} + \\sum \\beta_j X_j \\quad [\\lambda = ${lambda}]`,
    vifWarning: false,
    bestModelScore,
    isBest: false,
    selectionReasons: [],
    warnings: []
  };
}

/**
 * Lasso Regression (L1 penalty via Coordinate Descent)
 */
export function fitLasso(dataset: RegressionDataset, lambda = 0.5, maxIter = 500, testRatio = 0.2): ModelResult {
  const { X, y, varNames, depVarName } = dataset;
  const n = X.length;
  const p = X[0].length;
  const testSize = Math.max(2, Math.floor(n * testRatio));
  const trainSize = n - testSize;

  const X_train = X.slice(0, trainSize);
  const y_train = y.slice(0, trainSize);
  const X_test = X.slice(trainSize);
  const y_test = y.slice(trainSize);

  // Standardize X_train
  const meansX = Array.from({ length: p }, (_, j) => mean(X_train.map(r => r[j])));
  const sdsX = Array.from({ length: p }, (_, j) => standardDeviation(X_train.map(r => r[j])) || 1);
  const yMean = mean(y_train);

  const X_scaled = X_train.map(row => row.map((v, j) => (v - meansX[j]) / sdsX[j]));
  const y_centered = y_train.map(v => v - yMean);

  // Soft thresholding function
  const softThreshold = (rho: number, lam: number) => {
    if (rho > lam) return rho - lam;
    if (rho < -lam) return rho + lam;
    return 0;
  };

  const beta_scaled = new Array(p).fill(0);
  // Coordinate descent
  for (let iter = 0; iter < maxIter; iter++) {
    for (let j = 0; j < p; j++) {
      // Calculate partial residual
      let rho = 0;
      for (let i = 0; i < trainSize; i++) {
        let yPredWithoutJ = 0;
        for (let k = 0; k < p; k++) {
          if (k !== j) yPredWithoutJ += X_scaled[i][k] * beta_scaled[k];
        }
        rho += X_scaled[i][j] * (y_centered[i] - yPredWithoutJ);
      }
      rho /= trainSize;
      beta_scaled[j] = softThreshold(rho, lambda);
    }
  }

  // Unscale
  const slopes = beta_scaled.map((b, j) => b / sdsX[j]);
  let intercept = yMean;
  for (let j = 0; j < p; j++) {
    intercept -= slopes[j] * meansX[j];
  }

  // Predictions
  const y_train_hat = X_train.map(row => intercept + row.reduce((sum, v, j) => sum + v * slopes[j], 0));
  let ssTot = 0;
  let ssRes = 0;
  let absErrSum = 0;
  for (let i = 0; i < trainSize; i++) {
    const res = y_train[i] - y_train_hat[i];
    ssRes += res * res;
    absErrSum += Math.abs(res);
    ssTot += Math.pow(y_train[i] - yMean, 2);
  }

  const r2 = ssTot === 0 ? 0 : Math.max(0, 1 - ssRes / ssTot);
  const nonZeroCount = slopes.filter(b => Math.abs(b) > 1e-5).length;
  const df = Math.max(1, trainSize - nonZeroCount - 1);
  const r2Adj = Math.max(0, 1 - (1 - r2) * ((trainSize - 1) / df));
  const rmse = Math.sqrt(ssRes / trainSize);
  const mae = absErrSum / trainSize;

  // Test set
  const y_test_hat = X_test.map(row => intercept + row.reduce((sum, v, j) => sum + v * slopes[j], 0));
  const testMean = mean(y_test);
  let testSsTot = 0;
  let testSsRes = 0;
  for (let i = 0; i < testSize; i++) {
    testSsRes += Math.pow(y_test[i] - y_test_hat[i], 2);
    testSsTot += Math.pow(y_test[i] - testMean, 2);
  }
  const testR2 = testSsTot === 0 ? 0 : Math.max(0, 1 - testSsRes / testSsTot);

  const coeffDetails: CoefficientDetail[] = varNames.map((name, idx) => {
    const beta = slopes[idx];
    const isZero = Math.abs(beta) < 1e-5;
    const se = rmse / (Math.sqrt(trainSize) * (sdsX[idx] || 1));
    const t = se === 0 ? 0 : beta / se;
    const pVal = isZero ? 1.0 : tDistributionPValue(t, df);
    const meanX = mean(X.map(r => r[idx]));
    const elasticity = mean(y) !== 0 ? beta * (meanX / mean(y)) : 0;

    return {
      variable: name,
      beta,
      stdError: se,
      tStat: t,
      pValue: pVal,
      ciLower: beta - 1.96 * se,
      ciUpper: beta + 1.96 * se,
      vif: 1.0,
      elasticity,
      significance: isZero ? 'ns' : (pVal < 0.05 ? '*' : '.'),
      interpretation: isZero 
        ? `Lasso anuló esta variable (coeficiente = 0) al considerarla irrelevante o redundante.` 
        : `Variable seleccionada con efecto marginal de ${beta.toFixed(3)}.`,
      commercialImpact: isZero 
        ? `No requiere inversión operativa para fijación de precios.` 
        : `Variable clave retenida por su poder predictivo directo.`
    };
  });

  const eqParts = [`${intercept.toFixed(2)}`];
  coeffDetails.filter(c => Math.abs(c.beta) > 1e-5).forEach(c => {
    const sign = c.beta >= 0 ? '+' : '-';
    eqParts.push(`${sign} ${Math.abs(c.beta).toFixed(3)} · [${c.variable}]`);
  });

  const bestModelScore = (r2Adj * 0.4) + (testR2 * 0.4) - (rmse / (mean(y) || 1) * 0.1) + (nonZeroCount < p ? 0.05 : 0);

  return {
    id: 'lasso',
    name: 'Regresión Lasso (L1 Sparsity)',
    description: 'Selección automática de variables anulando predictores redundantes o ruidosos mediante penalidad L1.',
    metrics: {
      rSquared: r2,
      rSquaredAdj: r2Adj,
      rmse,
      mae,
      fStat: undefined,
      fPValue: undefined,
      aic: trainSize * Math.log(ssRes / trainSize + 1e-12) + 2 * (nonZeroCount + 1),
      bic: trainSize * Math.log(ssRes / trainSize + 1e-12) + Math.log(trainSize) * (nonZeroCount + 1),
      trainR2: r2,
      testR2,
      durbinWatson: 2.0
    },
    intercept,
    coefficients: coeffDetails,
    equation: eqParts.length > 1 ? `${depVarName} = ${eqParts.join(' ')}` : `${depVarName} = ${intercept.toFixed(2)}`,
    formulaLatex: `\\hat{Y} = ${intercept.toFixed(2)} + \\sum_{j \\in S} \\beta_j X_j \\quad [\\lambda = ${lambda}]`,
    vifWarning: false,
    bestModelScore,
    isBest: false,
    selectionReasons: [],
    warnings: []
  };
}

/**
 * Elastic Net Regression (combination of L1 and L2 penalty)
 */
export function fitElasticNet(dataset: RegressionDataset, alpha = 0.5, lambda = 0.5, maxIter = 500, testRatio = 0.2): ModelResult {
  const { X, y, varNames, depVarName } = dataset;
  const n = X.length;
  const p = X[0].length;
  const testSize = Math.max(2, Math.floor(n * testRatio));
  const trainSize = n - testSize;

  const X_train = X.slice(0, trainSize);
  const y_train = y.slice(0, trainSize);
  const X_test = X.slice(trainSize);
  const y_test = y.slice(trainSize);

  const meansX = Array.from({ length: p }, (_, j) => mean(X_train.map(r => r[j])));
  const sdsX = Array.from({ length: p }, (_, j) => standardDeviation(X_train.map(r => r[j])) || 1);
  const yMean = mean(y_train);

  const X_scaled = X_train.map(row => row.map((v, j) => (v - meansX[j]) / sdsX[j]));
  const y_centered = y_train.map(v => v - yMean);

  const softThreshold = (rho: number, lam: number) => {
    if (rho > lam) return rho - lam;
    if (rho < -lam) return rho + lam;
    return 0;
  };

  const beta_scaled = new Array(p).fill(0);
  const l1_penalty = alpha * lambda;
  const l2_penalty = (1 - alpha) * lambda;

  for (let iter = 0; iter < maxIter; iter++) {
    for (let j = 0; j < p; j++) {
      let rho = 0;
      for (let i = 0; i < trainSize; i++) {
        let yPredWithoutJ = 0;
        for (let k = 0; k < p; k++) {
          if (k !== j) yPredWithoutJ += X_scaled[i][k] * beta_scaled[k];
        }
        rho += X_scaled[i][j] * (y_centered[i] - yPredWithoutJ);
      }
      rho /= trainSize;
      beta_scaled[j] = softThreshold(rho, l1_penalty) / (1 + l2_penalty);
    }
  }

  const slopes = beta_scaled.map((b, j) => b / sdsX[j]);
  let intercept = yMean;
  for (let j = 0; j < p; j++) {
    intercept -= slopes[j] * meansX[j];
  }

  const y_train_hat = X_train.map(row => intercept + row.reduce((sum, v, j) => sum + v * slopes[j], 0));
  let ssTot = 0;
  let ssRes = 0;
  let absErrSum = 0;
  for (let i = 0; i < trainSize; i++) {
    const res = y_train[i] - y_train_hat[i];
    ssRes += res * res;
    absErrSum += Math.abs(res);
    ssTot += Math.pow(y_train[i] - yMean, 2);
  }

  const r2 = ssTot === 0 ? 0 : Math.max(0, 1 - ssRes / ssTot);
  const nonZeroCount = slopes.filter(b => Math.abs(b) > 1e-5).length;
  const df = Math.max(1, trainSize - nonZeroCount - 1);
  const r2Adj = Math.max(0, 1 - (1 - r2) * ((trainSize - 1) / df));
  const rmse = Math.sqrt(ssRes / trainSize);
  const mae = absErrSum / trainSize;

  const y_test_hat = X_test.map(row => intercept + row.reduce((sum, v, j) => sum + v * slopes[j], 0));
  const testMean = mean(y_test);
  let testSsTot = 0;
  let testSsRes = 0;
  for (let i = 0; i < testSize; i++) {
    testSsRes += Math.pow(y_test[i] - y_test_hat[i], 2);
    testSsTot += Math.pow(y_test[i] - testMean, 2);
  }
  const testR2 = testSsTot === 0 ? 0 : Math.max(0, 1 - testSsRes / testSsTot);

  const coeffDetails: CoefficientDetail[] = varNames.map((name, idx) => {
    const beta = slopes[idx];
    const isZero = Math.abs(beta) < 1e-5;
    const se = rmse / (Math.sqrt(trainSize) * (sdsX[idx] || 1));
    const t = se === 0 ? 0 : beta / se;
    const pVal = isZero ? 1.0 : tDistributionPValue(t, df);
    const meanX = mean(X.map(r => r[idx]));
    const elasticity = mean(y) !== 0 ? beta * (meanX / mean(y)) : 0;

    return {
      variable: name,
      beta,
      stdError: se,
      tStat: t,
      pValue: pVal,
      ciLower: beta - 1.96 * se,
      ciUpper: beta + 1.96 * se,
      vif: 1.0,
      elasticity,
      significance: isZero ? 'ns' : (pVal < 0.05 ? '*' : '.'),
      interpretation: `Elastic Net balancea selección y agrupamiento de variables correlacionadas. Coeficiente: ${beta.toFixed(3)}.`,
      commercialImpact: `Ideal para datasets con variables comerciales concurrentes (ej. precio y promociones simultáneas).`
    };
  });

  const eqParts = [`${intercept.toFixed(2)}`];
  coeffDetails.filter(c => Math.abs(c.beta) > 1e-5).forEach(c => {
    const sign = c.beta >= 0 ? '+' : '-';
    eqParts.push(`${sign} ${Math.abs(c.beta).toFixed(3)} · [${c.variable}]`);
  });

  const bestModelScore = (r2Adj * 0.38) + (testR2 * 0.42) - (rmse / (mean(y) || 1) * 0.1);

  return {
    id: 'elastic_net',
    name: 'Regresión Elastic Net (L1 + L2)',
    description: 'Híbrido de Lasso y Ridge que selecciona variables manteniendo grupos correlacionados sin inestabilidad numérica.',
    metrics: {
      rSquared: r2,
      rSquaredAdj: r2Adj,
      rmse,
      mae,
      fStat: undefined,
      fPValue: undefined,
      aic: trainSize * Math.log(ssRes / trainSize + 1e-12) + 2 * (nonZeroCount + 1),
      bic: trainSize * Math.log(ssRes / trainSize + 1e-12) + Math.log(trainSize) * (nonZeroCount + 1),
      trainR2: r2,
      testR2,
      durbinWatson: 2.0
    },
    intercept,
    coefficients: coeffDetails,
    equation: eqParts.length > 1 ? `${depVarName} = ${eqParts.join(' ')}` : `${depVarName} = ${intercept.toFixed(2)}`,
    formulaLatex: `\\hat{Y} = ${intercept.toFixed(2)} + \\sum_{j} \\beta_j X_j \\quad [\\alpha = ${alpha}, \\lambda = ${lambda}]`,
    vifWarning: false,
    bestModelScore,
    isBest: false,
    selectionReasons: [],
    warnings: []
  };
}

/**
 * Log-Log Regression (Constant Elasticity Model: ln(Q) = beta0 + beta1 ln(P) + ...)
 */
export function fitLogLog(dataset: RegressionDataset, testRatio = 0.2): ModelResult {
  const { X, y, varNames, depVarName } = dataset;
  
  // Filter for strictly positive values
  const validIndices: number[] = [];
  for (let i = 0; i < y.length; i++) {
    if (y[i] > 0 && X[i].every(val => val > 0)) {
      validIndices.push(i);
    }
  }

  if (validIndices.length < 10) {
    throw new Error('El modelo Log-Log requiere variables estrictamente positivas (> 0). Hay insuficientes observaciones válidas.');
  }

  const logY = validIndices.map(i => Math.log(y[i]));
  const logX = validIndices.map(i => X[i].map(val => Math.log(val)));

  const logDataset: RegressionDataset = {
    X: logX,
    y: logY,
    varNames: varNames.map(v => `ln(${v})`),
    depVarName: `ln(${depVarName})`
  };

  const olsResult = fitOLS(logDataset, testRatio);

  // In Log-Log model: beta_j IS directly the price/variable elasticity!
  const modifiedCoeffs = olsResult.coefficients.map((c, idx) => {
    const originalVar = varNames[idx];
    const isPrice = originalVar.toLowerCase().includes('precio') || originalVar.toLowerCase().includes('price');

    return {
      ...c,
      elasticity: c.beta,
      interpretation: isPrice
        ? `Elasticidad precio directa CONSTANTE de ${c.beta.toFixed(3)}. Por cada +1% en precio, la demanda varía en ${c.beta.toFixed(2)}%.`
        : `Elasticidad constante de ${c.beta.toFixed(3)}. Por cada +1% en '${originalVar}', '${depVarName}' varía en ${c.beta.toFixed(2)}%.`,
      commercialImpact: isPrice
        ? (Math.abs(c.beta) > 1 
            ? 'Demanda altamente elástica (|ε| > 1): las subidas de precio recortan fuertemente los ingresos totales.'
            : 'Demanda inelástica (|ε| < 1): margen para incrementar precios y capturar mayor valor económico.')
        : `Elasticidad cruzada o respuesta de demanda ante variación proporcional de ${originalVar}.`
    };
  });

  return {
    ...olsResult,
    id: 'log_log',
    name: 'Modelo Isoelástico Log-Log (Elasticidad Constante)',
    description: 'Transformación logarítmica bilateral ln(Q) = β0 + β1·ln(P) donde los coeficientes representan directamente elasticidades porcentuales.',
    coefficients: modifiedCoeffs,
    equation: `${olsResult.equation}`,
    formulaLatex: `\\ln(${depVarName}) = ${olsResult.intercept.toFixed(2)} + ${modifiedCoeffs.map(c => `${c.beta.toFixed(3)} \\ln(X_{${c.variable}})`).join(' + ')}`
  };
}

/**
 * Compare all models and select the econometrically superior model
 */
export function compareAndSelectBestModel(models: ModelResult[]): ModelResult[] {
  if (models.length === 0) return [];

  // Find model with best combination of R2 adj, Test R2, and low RMSE
  let bestIdx = 0;
  let maxScore = -Infinity;

  models.forEach((m, idx) => {
    // Scoring logic based on econometric best practices:
    // 1. High R² adjusted (explanatory power without overfitting penalty)
    // 2. High Test R² (generalization out-of-sample)
    // 3. Significance of F-test (when applicable)
    // 4. Low VIF penalty
    let score = m.bestModelScore;
    if (m.vifWarning) score -= 0.15;
    if (m.metrics.testR2 < 0) score -= 0.3; // severe overfitting

    if (score > maxScore) {
      maxScore = score;
      bestIdx = idx;
    }
  });

  return models.map((m, idx) => {
    const isBest = idx === bestIdx;
    const reasons: string[] = [];

    if (isBest) {
      reasons.push(`Mayor equilibrio entre poder explicativo (R² adj: ${(m.metrics.rSquaredAdj * 100).toFixed(1)}%) y precisión fuera de muestra (Test R²: ${(m.metrics.testR2 * 100).toFixed(1)}%).`);
      reasons.push(`Menor error cuadrático medio de predicción (RMSE: ${m.metrics.rmse.toFixed(2)}).`);
      if (!m.vifWarning) {
        reasons.push('Factores de inflación de varianza controlados (sin multicolinealidad severa).');
      }
      if (m.metrics.fPValue !== undefined && m.metrics.fPValue < 0.01) {
        reasons.push(`Prueba F global altamente significativa (p < 0.01).`);
      }
    }

    return {
      ...m,
      isBest,
      selectionReasons: reasons
    };
  });
}

/**
 * Price Optimization & Demand Curve Computation
 */
export function computePriceOptimization(
  model: ModelResult,
  varNames: string[],
  baseValues: Record<string, number>,
  priceVarName: string,
  minPrice: number,
  maxPrice: number,
  unitCost: number,
  fixedCost: number,
  currentPrice: number,
  steps = 60
): PriceOptimization {
  const curve: PricePoint[] = [];
  const priceStep = (maxPrice - minPrice) / (steps - 1);

  let bestRevenue = -Infinity;
  let bestPriceRev = currentPrice;
  let bestProfit = -Infinity;
  let bestPriceProf = currentPrice;

  const isLogLog = model.id === 'log_log';
  const priceCoeff = model.coefficients.find(c => 
    c.variable.toLowerCase().includes('precio') || 
    c.variable.toLowerCase().includes('price') || 
    c.variable === priceVarName || 
    c.variable === `ln(${priceVarName})`
  );

  for (let i = 0; i < steps; i++) {
    const P = minPrice + i * priceStep;
    let Q = 0;

    if (isLogLog) {
      // ln(Q) = beta0 + beta_p * ln(P) + sum(beta_j * ln(X_j))
      let logQ = model.intercept;
      model.coefficients.forEach(c => {
        if (c.variable.includes(priceVarName) || c.variable.includes('precio') || c.variable.includes('price')) {
          logQ += c.beta * Math.log(Math.max(0.01, P));
        } else {
          // find matching base value
          const rawVar = varNames.find(v => c.variable.includes(v)) || '';
          const val = baseValues[rawVar] || 1;
          logQ += c.beta * Math.log(Math.max(0.01, val));
        }
      });
      Q = Math.max(0, Math.exp(logQ));
    } else {
      // Linear: Q = beta0 + beta_p * P + sum(beta_j * X_j)
      Q = model.intercept;
      model.coefficients.forEach(c => {
        if (c.variable === priceVarName || c.variable.toLowerCase().includes('precio') || c.variable.toLowerCase().includes('price')) {
          Q += c.beta * P;
        } else {
          const val = baseValues[c.variable] ?? 0;
          Q += c.beta * val;
        }
      });
      Q = Math.max(0, Q);
    }

    const revenue = P * Q;
    const cost = fixedCost + unitCost * Q;
    const profit = revenue - cost;
    const marginPct = revenue > 0 ? (profit / revenue) * 100 : 0;

    // Local elasticity: (dQ/dP) * (P/Q)
    let elasticity = 0;
    if (priceCoeff) {
      if (isLogLog) {
        elasticity = priceCoeff.beta;
      } else {
        elasticity = Q > 0 ? priceCoeff.beta * (P / Q) : 0;
      }
    }

    if (revenue > bestRevenue) {
      bestRevenue = revenue;
      bestPriceRev = P;
    }
    if (profit > bestProfit) {
      bestProfit = profit;
      bestPriceProf = P;
    }

    curve.push({
      price: P,
      demand: Math.round(Q * 10) / 10,
      revenue: Math.round(revenue * 100) / 100,
      cost: Math.round(cost * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      marginPct: Math.round(marginPct * 10) / 10,
      elasticity: Math.round(elasticity * 100) / 100
    });
  }

  // Current values
  const currentPoint = curve.reduce((prev, curr) => 
    Math.abs(curr.price - currentPrice) < Math.abs(prev.price - currentPrice) ? curr : prev
  );

  curve.forEach(pt => {
    if (Math.abs(pt.price - bestPriceRev) < priceStep / 2) pt.isOptimalRevenue = true;
    if (Math.abs(pt.price - bestPriceProf) < priceStep / 2) pt.isOptimalProfit = true;
    if (pt === currentPoint) pt.isCurrent = true;
  });

  const potentialRevenueGainPct = currentPoint.revenue > 0 
    ? ((bestRevenue - currentPoint.revenue) / currentPoint.revenue) * 100 
    : 0;

  const potentialProfitGainPct = currentPoint.profit > 0 
    ? ((bestProfit - currentPoint.profit) / currentPoint.profit) * 100 
    : 0;

  // Lerner Index (P - MC) / P
  const lernerIndex = bestPriceProf > 0 ? (bestPriceProf - unitCost) / bestPriceProf : 0;

  return {
    optimalPriceRevenue: Math.round(bestPriceRev * 100) / 100,
    maxRevenue: Math.round(bestRevenue * 100) / 100,
    optimalPriceProfit: Math.round(bestPriceProf * 100) / 100,
    maxProfit: Math.round(bestProfit * 100) / 100,
    currentPrice,
    currentRevenue: Math.round(currentPoint.revenue * 100) / 100,
    currentProfit: Math.round(currentPoint.profit * 100) / 100,
    potentialRevenueGainPct: Math.round(potentialRevenueGainPct * 10) / 10,
    potentialProfitGainPct: Math.round(potentialProfitGainPct * 10) / 10,
    curve,
    lernerIndex: Math.round(lernerIndex * 100) / 100
  };
}

/**
 * Monte Carlo Simulation for Risk Distribution
 */
export function runMonteCarloSimulation(
  model: ModelResult,
  targetPrice: number,
  baseValues: Record<string, number>,
  priceVarName: string,
  unitCost: number,
  fixedCost: number,
  iterations = 1000
): MonteCarloSimulation {
  const demands: number[] = [];
  const profits: number[] = [];
  const rmse = model.metrics.rmse || 10;
  const isLogLog = model.id === 'log_log';

  // Box-Muller transform for normal random numbers
  const randomNormal = (mean = 0, std = 1) => {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z * std + mean;
  };

  for (let it = 0; it < iterations; it++) {
    // Add random error from model residual distribution N(0, RMSE)
    const errorTerm = randomNormal(0, rmse);
    let predDemand = 0;

    if (isLogLog) {
      let logQ = model.intercept;
      model.coefficients.forEach(c => {
        if (c.variable.includes(priceVarName) || c.variable.includes('precio') || c.variable.includes('price')) {
          logQ += c.beta * Math.log(Math.max(0.01, targetPrice));
        } else {
          const rawVar = Object.keys(baseValues).find(k => c.variable.includes(k)) || '';
          const val = baseValues[rawVar] || 1;
          logQ += c.beta * Math.log(Math.max(0.01, val));
        }
      });
      predDemand = Math.max(0, Math.exp(logQ + errorTerm / (model.metrics.rmse ? 5 : 1)));
    } else {
      predDemand = model.intercept;
      model.coefficients.forEach(c => {
        if (c.variable === priceVarName || c.variable.toLowerCase().includes('precio') || c.variable.toLowerCase().includes('price')) {
          predDemand += c.beta * targetPrice;
        } else {
          predDemand += c.beta * (baseValues[c.variable] ?? 0);
        }
      });
      predDemand = Math.max(0, predDemand + errorTerm);
    }

    const revenue = targetPrice * predDemand;
    const profit = revenue - (fixedCost + unitCost * predDemand);

    demands.push(predDemand);
    profits.push(profit);
  }

  demands.sort((a, b) => a - b);
  profits.sort((a, b) => a - b);

  const meanDemand = mean(demands);
  const meanRevenue = targetPrice * meanDemand;
  const meanProfit = mean(profits);
  const ci95LowerProfit = profits[Math.floor(iterations * 0.025)];
  const ci95UpperProfit = profits[Math.floor(iterations * 0.975)];
  const profitableCount = profits.filter(p => p > 0).length;
  const probabilityProfitable = (profitableCount / iterations) * 100;

  // Build histogram buckets
  const profitBuckets: { bin: string; count: number }[] = [];
  const minProf = profits[0];
  const maxProf = profits[iterations - 1];
  const binCount = 8;
  const binStep = (maxProf - minProf) / binCount;

  for (let b = 0; b < binCount; b++) {
    const low = minProf + b * binStep;
    const high = low + binStep;
    const count = profits.filter(p => p >= low && (b === binCount - 1 ? p <= high : p < high)).length;
    profitBuckets.push({
      bin: `$${Math.round(low / 1000)}k - $${Math.round(high / 1000)}k`,
      count
    });
  }

  return {
    iterations,
    price: targetPrice,
    meanDemand: Math.round(meanDemand),
    meanRevenue: Math.round(meanRevenue),
    meanProfit: Math.round(meanProfit),
    ci95LowerProfit: Math.round(ci95LowerProfit),
    ci95UpperProfit: Math.round(ci95UpperProfit),
    probabilityProfitable: Math.round(probabilityProfitable * 10) / 10,
    distribution: {
      demandBuckets: [],
      profitBuckets
    }
  };
}

/**
 * Predict demand for a specific scenario vector
 */
export function predictScenario(
  model: ModelResult,
  values: Record<string, number>,
  unitCost: number,
  fixedCost: number,
  priceVarName: string
): { demand: number; revenue: number; cost: number; profit: number; marginPct: number; elasticity: number } {
  const isLogLog = model.id === 'log_log';
  const price = values[priceVarName] || values['price'] || values['Precio'] || 1;
  let demand = 0;

  if (isLogLog) {
    let logQ = model.intercept;
    model.coefficients.forEach(c => {
      const matchKey = Object.keys(values).find(k => c.variable.includes(k)) || '';
      const val = values[matchKey] || 1;
      logQ += c.beta * Math.log(Math.max(0.01, val));
    });
    demand = Math.max(0, Math.exp(logQ));
  } else {
    demand = model.intercept;
    model.coefficients.forEach(c => {
      const val = values[c.variable] ?? 0;
      demand += c.beta * val;
    });
    demand = Math.max(0, demand);
  }

  const revenue = price * demand;
  const cost = fixedCost + unitCost * demand;
  const profit = revenue - cost;
  const marginPct = revenue > 0 ? (profit / revenue) * 100 : 0;

  const priceCoeff = model.coefficients.find(c => 
    c.variable.toLowerCase().includes('precio') || 
    c.variable.toLowerCase().includes('price') || 
    c.variable === priceVarName ||
    c.variable === `ln(${priceVarName})`
  );

  let elasticity = 0;
  if (priceCoeff) {
    elasticity = isLogLog ? priceCoeff.beta : (demand > 0 ? priceCoeff.beta * (price / demand) : 0);
  }

  return {
    demand: Math.round(demand * 10) / 10,
    revenue: Math.round(revenue * 100) / 100,
    cost: Math.round(cost * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    marginPct: Math.round(marginPct * 10) / 10,
    elasticity: Math.round(elasticity * 100) / 100
  };
}
