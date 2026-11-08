import React, { useState, useMemo, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { BusinessContextView } from './components/BusinessContextView';
import { DataQualityView } from './components/DataQualityView';
import { ExploratoryAnalysisView } from './components/ExploratoryAnalysisView';
import { ModelingView } from './components/ModelingView';
import { SimulationView } from './components/SimulationView';
import { PriceOptimizationView } from './components/PriceOptimizationView';
import { RecommendationsView } from './components/RecommendationsView';
import { 
  BusinessContext, 
  VariableSelection, 
  ModelAlgorithm, 
  ModelResult 
} from './types';
import { PRELOADED_DATASETS, PreloadedDataset } from './utils/datasets';
import { profileDataset } from './utils/dataProcessing';
import { 
  fitOLS, 
  fitRidge, 
  fitLasso, 
  fitElasticNet, 
  fitLogLog, 
  compareAndSelectBestModel, 
  computePriceOptimization,
  RegressionDataset 
} from './utils/econometrics';

export default function App() {
  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('context');

  // Active dataset state (defaults to FMCG Retail dataset)
  const [currentDatasetIndex, setCurrentDatasetIndex] = useState(0);
  const initialPreset = PRELOADED_DATASETS[0];

  const [datasetName, setDatasetName] = useState<string>(initialPreset.name);
  const [headers, setHeaders] = useState<string[]>(initialPreset.headers);
  const [data, setData] = useState<Record<string, string | number>[]>(initialPreset.data);
  const [context, setContext] = useState<BusinessContext>(initialPreset.context);

  // Variable selection state
  const [selection, setSelection] = useState<VariableSelection>({
    dependentVar: initialPreset.suggestedDepVar,
    independentVars: initialPreset.suggestedIndepVars,
    useLogLog: false,
    standardize: false,
    createDummies: false
  });

  // Active model algorithm for simulation & optimization
  const [activeModelId, setActiveModelId] = useState<ModelAlgorithm>('ols');

  // Compute data quality report
  const qualityReport = useMemo(() => {
    return profileDataset(headers, data);
  }, [headers, data]);

  // Numeric headers
  const numericHeaders = useMemo(() => {
    return qualityReport.profiles
      .filter(p => p.type === 'numeric')
      .map(p => p.name);
  }, [qualityReport]);

  // Identify price variable name
  const priceVarName = useMemo(() => {
    const candidates = selection.independentVars.filter(v => 
      v.toLowerCase().includes('precio') || v.toLowerCase().includes('price')
    );
    return candidates[0] || selection.independentVars[0] || 'Precio';
  }, [selection.independentVars]);

  // Load a preloaded dataset
  const handleSelectDataset = (dataset: PreloadedDataset) => {
    setDatasetName(dataset.name);
    setHeaders(dataset.headers);
    setData(dataset.data);
    setContext(dataset.context);
    setSelection({
      dependentVar: dataset.suggestedDepVar,
      independentVars: dataset.suggestedIndepVars,
      useLogLog: false,
      standardize: false,
      createDummies: false
    });
    setActiveTab('data');
  };

  // Update data after file upload or imputation
  const handleUpdateData = (newHeaders: string[], newData: Record<string, string | number>[], newFileName?: string) => {
    setHeaders(newHeaders);
    setData(newData);
    if (newFileName) {
      setDatasetName(newFileName);
    }

    // Auto-detect dependent and independent variables
    const rep = profileDataset(newHeaders, newData);
    const numCols = rep.profiles.filter(p => p.type === 'numeric').map(p => p.name);

    if (numCols.length > 0) {
      const depCandidate = numCols.find(c => 
        c.toLowerCase().includes('demanda') || 
        c.toLowerCase().includes('ventas') || 
        c.toLowerCase().includes('sales') || 
        c.toLowerCase().includes('unidades') ||
        c.toLowerCase().includes('suscripciones')
      ) || numCols[0];

      const indepCandidates = numCols.filter(c => c !== depCandidate);

      setSelection({
        dependentVar: depCandidate,
        independentVars: indepCandidates.length > 0 ? indepCandidates : [numCols[0]],
        useLogLog: false,
        standardize: false,
        createDummies: false
      });
    }
  };

  // Fit and compare econometric models
  const calculatedModels = useMemo<ModelResult[]>(() => {
    const { dependentVar, independentVars } = selection;
    if (!dependentVar || independentVars.length === 0) return [];

    // Filter valid rows where all selected vars are numeric
    const validRows = data.filter(row => {
      const yVal = Number(row[dependentVar]);
      if (isNaN(yVal)) return false;
      return independentVars.every(v => {
        const xVal = Number(row[v]);
        return !isNaN(xVal);
      });
    });

    if (validRows.length < 5) return [];

    const X = validRows.map(row => independentVars.map(v => Number(row[v])));
    const y = validRows.map(row => Number(row[dependentVar]));

    const regDataset: RegressionDataset = {
      X,
      y,
      varNames: independentVars,
      depVarName: dependentVar
    };

    const modelsList: ModelResult[] = [];

    // 1. OLS
    try {
      const ols = fitOLS(regDataset);
      modelsList.push(ols);
    } catch (e) {
      console.warn('OLS fit failed:', e);
    }

    // 2. Ridge
    try {
      const ridge = fitRidge(regDataset, 1.0);
      modelsList.push(ridge);
    } catch (e) {
      console.warn('Ridge fit failed:', e);
    }

    // 3. Lasso
    try {
      const lasso = fitLasso(regDataset, 0.5);
      modelsList.push(lasso);
    } catch (e) {
      console.warn('Lasso fit failed:', e);
    }

    // 4. Elastic Net
    try {
      const elasticNet = fitElasticNet(regDataset, 0.5, 0.5);
      modelsList.push(elasticNet);
    } catch (e) {
      console.warn('Elastic Net fit failed:', e);
    }

    // 5. Log-Log
    try {
      const logLog = fitLogLog(regDataset);
      modelsList.push(logLog);
    } catch (e) {
      console.warn('Log-Log fit skipped (negative/zero values):', e);
    }

    const compared = compareAndSelectBestModel(modelsList);
    return compared;
  }, [selection, data]);

  // Set default active model to best model when calculated
  useEffect(() => {
    const best = calculatedModels.find(m => m.isBest);
    if (best && activeModelId === 'ols' && best.id !== 'ols') {
      setActiveModelId(best.id);
    }
  }, [calculatedModels]);

  const activeModel = useMemo(() => {
    return calculatedModels.find(m => m.id === activeModelId) || calculatedModels[0];
  }, [calculatedModels, activeModelId]);

  // Optimization metrics
  const optimizationResults = useMemo(() => {
    if (!activeModel) return null;
    const baseVals: Record<string, number> = {};
    selection.independentVars.forEach(v => {
      const numbers = data.map(r => Number(r[v]) || 0).filter(n => !isNaN(n));
      baseVals[v] = numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
    });

    return computePriceOptimization(
      activeModel,
      selection.independentVars,
      baseVals,
      priceVarName,
      context.minPrice,
      context.maxPrice,
      context.unitCost,
      context.fixedCost,
      context.currentPrice,
      60
    );
  }, [activeModel, selection.independentVars, priceVarName, context, data]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 antialiased overflow-hidden">
      {/* Top Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectDataset={handleSelectDataset}
        onExportReport={() => setActiveTab('recommendations')}
        datasetName={datasetName}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          context={context}
          dataRowCount={data.length}
          modelsCalculatedCount={calculatedModels.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {activeTab === 'context' && (
            <BusinessContextView
              context={context}
              onUpdateContext={setContext}
              onContinue={() => setActiveTab('data')}
            />
          )}

          {activeTab === 'data' && (
            <DataQualityView
              headers={headers}
              data={data}
              qualityReport={qualityReport}
              fileName={datasetName}
              onUpdateData={handleUpdateData}
              onContinue={() => setActiveTab('eda')}
            />
          )}

          {activeTab === 'eda' && (
            <ExploratoryAnalysisView
              headers={headers}
              data={data}
              qualityReport={qualityReport}
              onContinue={() => setActiveTab('modeling')}
            />
          )}

          {activeTab === 'modeling' && (
            <ModelingView
              numericHeaders={numericHeaders}
              selection={selection}
              models={calculatedModels}
              activeModelId={activeModelId}
              onUpdateSelection={setSelection}
              onSelectActiveModel={setActiveModelId}
              onContinue={() => setActiveTab('simulation')}
            />
          )}

          {activeTab === 'simulation' && activeModel && (
            <SimulationView
              model={activeModel}
              context={context}
              headers={headers}
              data={data}
              independentVars={selection.independentVars}
              priceVarName={priceVarName}
              onContinue={() => setActiveTab('optimization')}
            />
          )}

          {activeTab === 'optimization' && activeModel && (
            <PriceOptimizationView
              model={activeModel}
              context={context}
              headers={headers}
              data={data}
              independentVars={selection.independentVars}
              priceVarName={priceVarName}
              onContinue={() => setActiveTab('recommendations')}
            />
          )}

          {activeTab === 'recommendations' && activeModel && optimizationResults && (
            <RecommendationsView
              model={activeModel}
              context={context}
              optimization={optimizationResults}
              priceVarName={priceVarName}
            />
          )}
        </main>
      </div>
    </div>
  );
}
