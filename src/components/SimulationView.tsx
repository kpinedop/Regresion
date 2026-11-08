import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  TrendingUp, 
  DollarSign, 
  ShieldAlert, 
  ArrowRight, 
  BarChart, 
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { ModelResult, BusinessContext, SimulationScenario } from '../types';
import { predictScenario, runMonteCarloSimulation } from '../utils/econometrics';

interface SimulationViewProps {
  model: ModelResult;
  context: BusinessContext;
  headers: string[];
  data: Record<string, string | number>[];
  independentVars: string[];
  priceVarName: string;
  onContinue: () => void;
}

export const SimulationView: React.FC<SimulationViewProps> = ({
  model,
  context,
  headers,
  data,
  independentVars,
  priceVarName,
  onContinue
}) => {
  // Compute baseline averages for each independent variable from actual data
  const baseStats = useMemo(() => {
    const stats: Record<string, { mean: number; min: number; max: number; step: number }> = {};
    independentVars.forEach(v => {
      const vals = data.map(r => Number(r[v]) || 0).filter(val => !isNaN(val));
      const m = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const range = max - min;
      const step = range > 100 ? 5 : (range > 10 ? 1 : 0.05);

      stats[v] = {
        mean: Math.round(m * 100) / 100,
        min: Math.floor(min * 0.7 * 10) / 10,
        max: Math.ceil(max * 1.3 * 10) / 10,
        step
      };
    });
    return stats;
  }, [independentVars, data]);

  // Current interactive slider values
  const [sliderValues, setSliderValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    independentVars.forEach(v => {
      initial[v] = baseStats[v]?.mean || 0;
    });
    return initial;
  });

  const handleSliderChange = (varName: string, val: number) => {
    setSliderValues(prev => ({ ...prev, [varName]: val }));
  };

  const handleReset = () => {
    const reset: Record<string, number> = {};
    independentVars.forEach(v => {
      reset[v] = baseStats[v]?.mean || 0;
    });
    setSliderValues(reset);
  };

  // Base values map
  const baseValues = useMemo(() => {
    const b: Record<string, number> = {};
    independentVars.forEach(v => {
      b[v] = baseStats[v]?.mean || 0;
    });
    return b;
  }, [independentVars, baseStats]);

  // Predictions for Base Scenario
  const basePred = useMemo(() => {
    return predictScenario(model, baseValues, context.unitCost, context.fixedCost, priceVarName);
  }, [model, baseValues, context, priceVarName]);

  // Predictions for Custom Scenario (active sliders)
  const customPred = useMemo(() => {
    return predictScenario(model, sliderValues, context.unitCost, context.fixedCost, priceVarName);
  }, [model, sliderValues, context, priceVarName]);

  // Predictions for Optimistic Scenario (+10% in favorable factors, -5% in cost)
  const optimisticPred = useMemo(() => {
    const optValues: Record<string, number> = { ...baseValues };
    independentVars.forEach(v => {
      if (v.toLowerCase().includes('publicidad') || v.toLowerCase().includes('marketing') || v.toLowerCase().includes('features')) {
        optValues[v] = (baseValues[v] || 0) * 1.15;
      } else if (v.toLowerCase().includes('competidor') || v.toLowerCase().includes('rival')) {
        optValues[v] = (baseValues[v] || 0) * 1.10; // competitor raises prices
      }
    });
    return predictScenario(model, optValues, context.unitCost * 0.95, context.fixedCost, priceVarName);
  }, [model, baseValues, context, priceVarName, independentVars]);

  // Predictions for Pessimistic Scenario (competitor discounts, cost inflation)
  const pessimisticPred = useMemo(() => {
    const pessValues: Record<string, number> = { ...baseValues };
    independentVars.forEach(v => {
      if (v.toLowerCase().includes('competidor') || v.toLowerCase().includes('rival')) {
        pessValues[v] = (baseValues[v] || 0) * 0.90; // competitor discounts
      }
    });
    return predictScenario(model, pessValues, context.unitCost * 1.10, context.fixedCost, priceVarName);
  }, [model, baseValues, context, priceVarName, independentVars]);

  // Monte Carlo simulation on the currently simulated custom price
  const activePrice = sliderValues[priceVarName] || context.currentPrice;
  const monteCarlo = useMemo(() => {
    return runMonteCarloSimulation(
      model,
      activePrice,
      sliderValues,
      priceVarName,
      context.unitCost,
      context.fixedCost,
      1000
    );
  }, [model, activePrice, sliderValues, priceVarName, context]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Fase 5: Simulación Interactiva e Inteligencia Econométrica</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Simulador de Escenarios y Análisis de Riesgo Monte Carlo
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Modifica las variables del mercado para proyectar ventas, márgenes y beneficios con recálculo dinámico y distribución empírica de riesgo.
          </p>
        </div>

        <button
          onClick={onContinue}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm shrink-0"
        >
          <span>Curvas de Optimización</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4-Scenario Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Scenario Base */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 pb-2 border-b border-slate-800">
            <span>Escenario Base</span>
            <span className="font-mono text-[11px] text-slate-500">Promedios Históricos</span>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-[11px] text-slate-400 block">Demanda Estimada</span>
              <span className="text-lg font-bold font-mono text-slate-200 tabular-nums">
                {basePred.demand.toLocaleString()} un.
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Ingresos</span>
                <span className="font-mono font-semibold text-slate-300 tabular-nums">${Math.round(basePred.revenue).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Utilidad</span>
                <span className="font-mono font-semibold text-emerald-400 tabular-nums">${Math.round(basePred.profit).toLocaleString()}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Margen: <strong className="text-slate-200 font-mono">{basePred.marginPct}%</strong></span>
              <span>ε: <strong className="text-indigo-400 font-mono">{basePred.elasticity}</strong></span>
            </div>
          </div>
        </div>

        {/* Scenario Optimista */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-400 pb-2 border-b border-slate-800">
            <span>Escenario Optimista</span>
            <span className="font-mono text-[11px] text-emerald-500/80">+15% Expansión</span>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-[11px] text-slate-400 block">Demanda Estimada</span>
              <span className="text-lg font-bold font-mono text-emerald-300 tabular-nums">
                {optimisticPred.demand.toLocaleString()} un.
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Ingresos</span>
                <span className="font-mono font-semibold text-slate-200 tabular-nums">${Math.round(optimisticPred.revenue).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Utilidad</span>
                <span className="font-mono font-semibold text-emerald-400 tabular-nums">${Math.round(optimisticPred.profit).toLocaleString()}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Margen: <strong className="text-emerald-300 font-mono">{optimisticPred.marginPct}%</strong></span>
              <span>ε: <strong className="text-indigo-400 font-mono">{optimisticPred.elasticity}</strong></span>
            </div>
          </div>
        </div>

        {/* Scenario Pesimista */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-rose-400 pb-2 border-b border-slate-800">
            <span>Escenario Pesimista</span>
            <span className="font-mono text-[11px] text-rose-500/80">Competencia Agresiva</span>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-[11px] text-slate-400 block">Demanda Estimada</span>
              <span className="text-lg font-bold font-mono text-rose-300 tabular-nums">
                {pessimisticPred.demand.toLocaleString()} un.
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Ingresos</span>
                <span className="font-mono font-semibold text-slate-300 tabular-nums">${Math.round(pessimisticPred.revenue).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Utilidad</span>
                <span className={`font-mono font-semibold tabular-nums ${pessimisticPred.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${Math.round(pessimisticPred.profit).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Margen: <strong className="text-slate-200 font-mono">{pessimisticPred.marginPct}%</strong></span>
              <span>ε: <strong className="text-indigo-400 font-mono">{pessimisticPred.elasticity}</strong></span>
            </div>
          </div>
        </div>

        {/* Scenario Personalizado (Activo con sliders) */}
        <div className="bg-slate-900 border-2 border-indigo-500/80 rounded-xl p-4 space-y-3 shadow-lg shadow-indigo-950/40">
          <div className="flex items-center justify-between text-xs font-medium text-indigo-400 pb-2 border-b border-slate-800">
            <span>Escenario Personalizado</span>
            <span className="font-mono text-[11px] text-indigo-300">Tiempo Real</span>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-[11px] text-slate-400 block">Demanda Estimada</span>
              <span className="text-lg font-bold font-mono text-white tabular-nums">
                {customPred.demand.toLocaleString()} un.
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Ingresos</span>
                <span className="font-mono font-semibold text-indigo-300 tabular-nums">${Math.round(customPred.revenue).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Utilidad</span>
                <span className={`font-mono font-semibold tabular-nums ${customPred.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${Math.round(customPred.profit).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Margen: <strong className="text-white font-mono">{customPred.marginPct}%</strong></span>
              <span>ε: <strong className="text-indigo-400 font-mono">{customPred.elasticity}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Workspace: Sliders on left, Monte Carlo on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Panel */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Controles de Simulación de Covariables
              </h2>
              <p className="text-xs text-slate-400">
                Ajusta los parámetros para evaluar elasticidades cruzadas y sensibilidad.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-slate-800 border border-slate-700 rounded hover:text-white transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Restablecer</span>
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {independentVars.map(varName => {
              const stat = baseStats[varName] || { min: 0, max: 100, step: 1, mean: 0 };
              const currentVal = sliderValues[varName] ?? stat.mean;
              const isPrice = varName.toLowerCase().includes('precio') || varName.toLowerCase().includes('price');

              return (
                <div key={varName} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/90 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${isPrice ? 'text-indigo-400 font-semibold' : 'text-slate-200'}`}>
                      {varName} {isPrice && '(Variable Clave)'}
                    </span>
                    <span className="font-mono text-sm font-bold text-white tabular-nums">
                      {isPrice ? `$${currentVal.toFixed(2)}` : currentVal.toLocaleString()}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={stat.min}
                    max={stat.max}
                    step={stat.step}
                    value={currentVal}
                    onChange={(e) => handleSliderChange(varName, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Mín: {stat.min}</span>
                    <span>Media: {stat.mean}</span>
                    <span>Máx: {stat.max}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monte Carlo Risk & Uncertainty Panel */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">
                Simulación Monte Carlo (1,000 Iteraciones)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-indigo-400">
              P = ${activePrice.toFixed(2)}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Propagamos el error estocástico residual del modelo para calcular la distribución de probabilidad del beneficio ante shocks aleatorios del mercado.
          </p>

          {/* Monte Carlo KPI metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Beneficio Medio Esperado</span>
              <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                ${monteCarlo.meanProfit.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Probabilidad de Utilidad &gt; $0</span>
              <span className="text-lg font-bold font-mono text-indigo-400 tabular-nums">
                {monteCarlo.probabilityProfitable}%
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 col-span-2">
              <span className="text-[11px] text-slate-400 block mb-0.5">Intervalo de Confianza al 95% para la Utilidad</span>
              <div className="flex items-center justify-between font-mono text-xs text-slate-200 mt-1">
                <span>P2.5%: <strong className="text-slate-100">${monteCarlo.ci95LowerProfit.toLocaleString()}</strong></span>
                <span className="text-slate-400">a</span>
                <span>P97.5%: <strong className="text-slate-100">${monteCarlo.ci95UpperProfit.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          {/* Distribution Histogram */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-medium text-slate-300 block">
              Distribución de Probabilidad del Beneficio
            </span>
            <div className="space-y-1.5">
              {monteCarlo.distribution.profitBuckets.map((bucket, i) => {
                const pct = ((bucket.count / monteCarlo.iterations) * 100).toFixed(1);
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-24 text-[11px] text-slate-400 font-mono truncate">{bucket.bin}</span>
                    <div className="flex-1 bg-slate-950 rounded-full h-3.5 overflow-hidden border border-slate-800">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (bucket.count / 300) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="w-12 text-right font-mono text-[11px] text-slate-300">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
