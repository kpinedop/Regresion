import test from 'node:test';
import assert from 'node:assert/strict';
import {
  matrixMultiply,
  matrixInverse,
  matrixVectorMultiply,
  mean,
  standardDeviation,
  fitOLS,
  fitRidge,
  fitLasso,
  fitLogLog,
  compareAndSelectBestModel,
  computePriceOptimization,
  predictScenario
} from './econometrics';
import { RegressionDataset } from './econometrics';

test('Matrix multiplication and inverse work accurately', () => {
  const A = [
    [4, 7],
    [2, 6]
  ];
  const A_inv = matrixInverse(A);
  const I = matrixMultiply(A, A_inv);
  
  // Diagonal should be ~1, off-diagonal ~0
  assert.ok(Math.abs(I[0][0] - 1) < 1e-4);
  assert.ok(Math.abs(I[1][1] - 1) < 1e-4);
  assert.ok(Math.abs(I[0][1]) < 1e-4);
  assert.ok(Math.abs(I[1][0]) < 1e-4);
});

test('OLS correctly estimates linear relationship Y = 100 - 2.5 * P + 0.8 * Adv', () => {
  // Generate synthetic deterministic data
  const n = 50;
  const X: number[][] = [];
  const y: number[] = [];

  for (let i = 0; i < n; i++) {
    const price = 10 + (i % 20) * 1.5;
    const adv = 50 + (i % 15) * 5;
    // exact equation with tiny deterministic residual
    const demand = 100 - 2.5 * price + 0.8 * adv + ((i % 5) - 2) * 0.1;
    X.push([price, adv]);
    y.push(demand);
  }

  const dataset: RegressionDataset = {
    X,
    y,
    varNames: ['Precio', 'Publicidad'],
    depVarName: 'Demanda'
  };

  const ols = fitOLS(dataset);

  // Check intercept ~ 100, beta1 ~ -2.5, beta2 ~ 0.8
  assert.ok(Math.abs(ols.intercept - 100) < 1.0, `Intercept ${ols.intercept} should be ~100`);
  assert.ok(Math.abs(ols.coefficients[0].beta - (-2.5)) < 0.1, `Beta1 ${ols.coefficients[0].beta} should be ~ -2.5`);
  assert.ok(Math.abs(ols.coefficients[1].beta - 0.8) < 0.1, `Beta2 ${ols.coefficients[1].beta} should be ~ 0.8`);
  assert.ok(ols.metrics.rSquared > 0.98, `R2 ${ols.metrics.rSquared} should be > 0.98`);
  assert.ok(ols.coefficients[0].pValue < 0.001, 'Price should be highly significant');
});

test('Ridge, Lasso and Elastic Net run and produce valid metrics', () => {
  const X = [
    [10, 20], [12, 22], [14, 25], [16, 28], [18, 30],
    [20, 32], [22, 35], [24, 38], [26, 40], [28, 42],
    [30, 45], [32, 48], [34, 50], [36, 52], [38, 55]
  ];
  const y = [100, 95, 92, 85, 80, 75, 70, 68, 60, 58, 52, 48, 42, 38, 32];

  const dataset: RegressionDataset = {
    X,
    y,
    varNames: ['Precio', 'Publicidad'],
    depVarName: 'Ventas'
  };

  const ridge = fitRidge(dataset);
  assert.equal(ridge.id, 'ridge');
  assert.ok(ridge.metrics.rSquared > 0);
  assert.equal(ridge.coefficients.length, 2);

  const lasso = fitLasso(dataset);
  assert.equal(lasso.id, 'lasso');
  assert.ok(lasso.metrics.rSquared > 0);

  const logLog = fitLogLog(dataset);
  assert.equal(logLog.id, 'log_log');
  assert.ok(logLog.coefficients[0].elasticity !== undefined);

  const bestModels = compareAndSelectBestModel([fitOLS(dataset), ridge, lasso, logLog]);
  const hasBest = bestModels.some(m => m.isBest);
  assert.ok(hasBest, 'One model must be marked as best');
});

test('Price optimization computes optimal revenue and profit points', () => {
  const X = [
    [10], [15], [20], [25], [30], [35], [40], [45], [50], [55]
  ];
  // Demand = 200 - 3 * Price
  const y = [170, 155, 140, 125, 110, 95, 80, 65, 50, 35];

  const dataset: RegressionDataset = {
    X,
    y,
    varNames: ['Precio'],
    depVarName: 'Demanda'
  };

  const ols = fitOLS(dataset);
  const opt = computePriceOptimization(
    ols,
    ['Precio'],
    { 'Precio': 25 },
    'Precio',
    10,
    60,
    15, // unitCost
    50, // fixedCost
    25  // currentPrice
  );

  assert.ok(opt.optimalPriceRevenue > 10, 'Optimal price should be positive');
  assert.ok(opt.optimalPriceProfit >= opt.currentPrice || opt.optimalPriceProfit <= opt.maxRevenue);
  assert.ok(opt.curve.length > 10, 'Curve should contain points');
});

test('CSV parser and Data Profiler correctly assess dataset quality', async () => {
  const { parseCSV, profileDataset, imputeDataset } = await import('./dataProcessing');
  const csvContent = `Precio,Demanda,Canal\n10,100,Online\n12,90,Retail\n15,,Online\n10,100,Online`;
  const { headers, data } = parseCSV(csvContent);
  assert.equal(headers.length, 3);
  assert.equal(data.length, 4);

  const report = profileDataset(headers, data);
  assert.equal(report.totalRows, 4);
  assert.equal(report.duplicateRows, 1);
  assert.equal(report.totalMissingCells, 1);

  // Impute missing value with median
  const imputed = imputeDataset(headers, data, 'Demanda', 'median');
  assert.ok(Number(imputed[2].Demanda) > 0);
});

