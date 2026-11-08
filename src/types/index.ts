export type BusinessGoal = 
  | 'maximize_revenue' 
  | 'maximize_profit' 
  | 'market_share' 
  | 'penetration';

export interface BusinessContext {
  sector: string;
  product: string;
  businessGoal: BusinessGoal;
  strategicQuestion: string;
  minPrice: number;
  maxPrice: number;
  unitCost: number;
  fixedCost: number;
  currentPrice: number;
}

export type VariableType = 'numeric' | 'categorical' | 'datetime';

export interface ColumnProfile {
  name: string;
  type: VariableType;
  missingCount: number;
  missingPct: number;
  uniqueCount: number;
  mean?: number;
  median?: number;
  stdDev?: number;
  min?: number;
  max?: number;
  iqr?: number;
  outliersCount: number;
  skewness?: number;
  sampleValues: (string | number)[];
}

export interface DataQualityReport {
  totalRows: number;
  totalCols: number;
  duplicateRows: number;
  totalMissingCells: number;
  missingCellsPct: number;
  columnsWithOutliers: number;
  healthScore: number;
  profiles: ColumnProfile[];
}

export type ImputationMethod = 'mean' | 'median' | 'mode' | 'forward_fill' | 'drop_row';

export interface VariableSelection {
  dependentVar: string;
  independentVars: string[];
  useLogLog: boolean;
  standardize: boolean;
  createDummies: boolean;
}

export interface CoefficientDetail {
  variable: string;
  beta: number;
  stdError: number;
  tStat: number;
  pValue: number;
  ciLower: number;
  ciUpper: number;
  vif: number;
  elasticity?: number;
  significance: '***' | '**' | '*' | '.' | 'ns';
  interpretation: string;
  commercialImpact: string;
}

export type ModelAlgorithm = 'ols' | 'ridge' | 'lasso' | 'elastic_net' | 'log_log';

export interface ModelMetrics {
  rSquared: number;
  rSquaredAdj: number;
  rmse: number;
  mae: number;
  fStat?: number;
  fPValue?: number;
  aic: number;
  bic: number;
  trainR2: number;
  testR2: number;
  durbinWatson: number;
}

export interface ModelResult {
  id: ModelAlgorithm;
  name: string;
  description: string;
  metrics: ModelMetrics;
  intercept: number;
  coefficients: CoefficientDetail[];
  equation: string;
  formulaLatex: string;
  vifWarning: boolean;
  bestModelScore: number;
  isBest: boolean;
  selectionReasons: string[];
  warnings: string[];
}

export interface SimulationScenario {
  name: string;
  description: string;
  values: Record<string, number>;
  predictedDemand: number;
  predictedRevenue: number;
  predictedCost: number;
  predictedProfit: number;
  marginPct: number;
  elasticity: number;
}

export interface MonteCarloSimulation {
  iterations: number;
  price: number;
  meanDemand: number;
  meanRevenue: number;
  meanProfit: number;
  ci95LowerProfit: number;
  ci95UpperProfit: number;
  probabilityProfitable: number;
  distribution: {
    demandBuckets: { bin: string; count: number }[];
    profitBuckets: { bin: string; count: number }[];
  };
}

export interface PricePoint {
  price: number;
  demand: number;
  revenue: number;
  cost: number;
  profit: number;
  marginPct: number;
  elasticity: number;
  isOptimalRevenue?: boolean;
  isOptimalProfit?: boolean;
  isCurrent?: boolean;
}

export interface PriceOptimization {
  optimalPriceRevenue: number;
  maxRevenue: number;
  optimalPriceProfit: number;
  maxProfit: number;
  currentPrice: number;
  currentRevenue: number;
  currentProfit: number;
  potentialRevenueGainPct: number;
  potentialProfitGainPct: number;
  curve: PricePoint[];
  lernerIndex: number;
}

export interface StrategicRecommendation {
  summary: string;
  pricingStatus: 'underpriced' | 'overpriced' | 'optimal' | 'margin_compressed';
  actionableSteps: string[];
  risksAndMitigations: { risk: string; mitigation: string }[];
  econometricCaution: string;
}
