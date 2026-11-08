import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Award, 
  Target, 
  ArrowRight, 
  CheckCircle2, 
  Sliders,
  Scale
} from 'lucide-react';
import { ModelResult, BusinessContext, PriceOptimization } from '../types';
import { computePriceOptimization } from '../utils/econometrics';

interface PriceOptimizationViewProps {
  model: ModelResult;
  context: BusinessContext;
  headers: string[];
  data: Record<string, string | number>[];
  independentVars: string[];
  priceVarName: string;
  onContinue: () => void;
}

export const PriceOptimizationView: React.FC<PriceOptimizationViewProps> = ({
  model,
  context,
  headers,
  data,
  independentVars,
  priceVarName,
  onContinue
}) => {
  // Base average values of other covariates
  const baseValues = useMemo(() => {
    const vals: Record<string, number> = {};
    independentVars.forEach(v => {
      const numbers = data.map(r => Number(r[v]) || 0).filter(n => !isNaN(n));
      vals[v] = numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
    });
    return vals;
  }, [independentVars, data]);

  // Compute optimization curves
  const optimization = useMemo<PriceOptimization>(() => {
    return computePriceOptimization(
      model,
      independentVars,
      baseValues,
      priceVarName,
      context.minPrice,
      context.maxPrice,
      context.unitCost,
      context.fixedCost,
      context.currentPrice,
      60
    );
  }, [model, independentVars, baseValues, priceVarName, context]);

  // Active tab for chart: 'profit' | 'revenue' | 'demand'
  const [activeChart, setActiveChart] = useState<'profit' | 'revenue' | 'demand'>('profit');

  // SVG Chart rendering
  const svgWidth = 720;
  const svgHeight = 320;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;

  const chartData = optimization.curve;
  const minP = context.minPrice;
  const maxP = context.maxPrice;

  let minY = 0;
  let maxY = 1;

  if (activeChart === 'profit') {
    const profits = chartData.map(d => d.profit);
    minY = Math.min(0, Math.min(...profits));
    maxY = Math.max(...profits) * 1.1;
  } else if (activeChart === 'revenue') {
    const revenues = chartData.map(d => d.revenue);
    minY = 0;
    maxY = Math.max(...revenues) * 1.1;
  } else {
    const demands = chartData.map(d => d.demand);
    minY = 0;
    maxY = Math.max(...demands) * 1.1;
  }

  const scaleX = (p: number) => {
    return padLeft + ((p - minP) / (maxP - minP || 1)) * (svgWidth - padLeft - padRight);
  };

  const scaleY = (y: number) => {
    return (svgHeight - padBottom) - ((y - minY) / (maxY - minY || 1)) * (svgHeight - padTop - padBottom);
  };

  // Build SVG path
  const curvePath = chartData.reduce((path, pt, i) => {
    const yVal = activeChart === 'profit' ? pt.profit : (activeChart === 'revenue' ? pt.revenue : pt.demand);
    const x = scaleX(pt.price);
    const y = scaleY(yVal);
    return `${path} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }, '');

  // Optimal points
  const optProfitPoint = chartData.find(pt => pt.isOptimalProfit) || chartData[0];
  const optRevPoint = chartData.find(pt => pt.isOptimalRevenue) || chartData[0];
  const currentPoint = chartData.find(pt => pt.isCurrent) || chartData[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Fase 6: Optimización Econométrica de Precios</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Curvas de Beneficio, Ingresos y Demanda
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cálculo analítico del precio que maximiza utilidades (regla de Lerner / margen óptimo) e ingresos totales.
          </p>
        </div>

        <button
          onClick={onContinue}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm shrink-0"
        >
          <span>Ver Recomendaciones</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Optimization Benchmark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Optimal Profit Price */}
        <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-xl p-5 space-y-2 shadow-lg shadow-emerald-950/20">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>Precio Óptimo de Beneficio (P*)</span>
            </span>
            <span className="font-mono text-[11px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Recomendado
            </span>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
              ${optimization.optimalPriceProfit.toFixed(2)}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-medium">
              +{optimization.potentialProfitGainPct}% ganancia
            </span>
          </div>
          <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Utilidad Máxima Proyectada:</span>
              <strong className="text-emerald-400 font-mono">${Math.round(optimization.maxProfit).toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Índice de Lerner ((P-MC)/P):</span>
              <strong className="text-slate-200 font-mono">{optimization.lernerIndex}</strong>
            </div>
          </div>
        </div>

        {/* Optimal Revenue Price */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Target className="w-4 h-4" />
              <span>Precio Óptimo de Ingresos</span>
            </span>
            <span className="font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
              Elasticidad = -1.0
            </span>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-extrabold font-mono text-slate-200 tabular-nums">
              ${optimization.optimalPriceRevenue.toFixed(2)}
            </span>
            <span className="text-xs text-indigo-400 font-mono font-medium">
              +{optimization.potentialRevenueGainPct}% facturación
            </span>
          </div>
          <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Ingreso Máximo Proyectado:</span>
              <strong className="text-indigo-300 font-mono">${Math.round(optimization.maxRevenue).toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Enfoque:</span>
              <span className="text-slate-300 text-[11px]">Volumen y escala comercial</span>
            </div>
          </div>
        </div>

        {/* Current Position */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Posición Comercial Actual</span>
            <span className="font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Status Quo
            </span>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-extrabold font-mono text-slate-300 tabular-nums">
              ${optimization.currentPrice.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">precio actual</span>
          </div>
          <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Utilidad Actual:</span>
              <strong className="text-slate-200 font-mono">${Math.round(optimization.currentProfit).toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ingresos Actuales:</span>
              <strong className="text-slate-200 font-mono">${Math.round(optimization.currentRevenue).toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Economic Curves Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Curvas Microeconómicas Continuas (P_mín a P_máx)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Identificación de los puntos de tangencia donde el ingreso marginal iguala al costo marginal.
            </p>
          </div>

          {/* Curve switcher tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveChart('profit')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeChart === 'profit'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Curva de Beneficio (Utilidad)
            </button>
            <button
              onClick={() => setActiveChart('revenue')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeChart === 'revenue'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Curva de Ingresos
            </button>
            <button
              onClick={() => setActiveChart('demand')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeChart === 'demand'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Curva de Demanda Q(P)
            </button>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 overflow-hidden flex flex-col items-center">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto max-h-80">
            {/* Grid & Axis */}
            <line x1={padLeft} y1={padTop} x2={padLeft} y2={svgHeight - padBottom} stroke="#334155" strokeWidth="1" />
            <line x1={padLeft} y1={svgHeight - padBottom} x2={svgWidth - padRight} y2={svgHeight - padBottom} stroke="#334155" strokeWidth="1" />

            {/* Zero profit horizontal guide if minY < 0 */}
            {minY < 0 && (
              <line
                x1={padLeft}
                y1={scaleY(0)}
                x2={svgWidth - padRight}
                y2={scaleY(0)}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            )}

            {/* Continuous curve path */}
            <path
              d={curvePath}
              fill="none"
              stroke={activeChart === 'profit' ? '#10b981' : (activeChart === 'revenue' ? '#6366f1' : '#38bdf8')}
              strokeWidth="2.5"
            />

            {/* Optimal Profit Marker */}
            {activeChart === 'profit' && optProfitPoint && (
              <g>
                <line
                  x1={scaleX(optProfitPoint.price)}
                  y1={padTop}
                  x2={scaleX(optProfitPoint.price)}
                  y2={svgHeight - padBottom}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <circle
                  cx={scaleX(optProfitPoint.price)}
                  cy={scaleY(optProfitPoint.profit)}
                  r="6"
                  fill="#10b981"
                  stroke="#ecfdf5"
                  strokeWidth="2"
                />
                <text
                  x={scaleX(optProfitPoint.price)}
                  y={scaleY(optProfitPoint.profit) - 12}
                  fill="#10b981"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  P* = ${optProfitPoint.price.toFixed(2)}
                </text>
              </g>
            )}

            {/* Optimal Revenue Marker */}
            {activeChart === 'revenue' && optRevPoint && (
              <g>
                <line
                  x1={scaleX(optRevPoint.price)}
                  y1={padTop}
                  x2={scaleX(optRevPoint.price)}
                  y2={svgHeight - padBottom}
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <circle
                  cx={scaleX(optRevPoint.price)}
                  cy={scaleY(optRevPoint.revenue)}
                  r="6"
                  fill="#6366f1"
                  stroke="#e0e7ff"
                  strokeWidth="2"
                />
                <text
                  x={scaleX(optRevPoint.price)}
                  y={scaleY(optRevPoint.revenue) - 12}
                  fill="#818cf8"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  P_rev = ${optRevPoint.price.toFixed(2)}
                </text>
              </g>
            )}

            {/* Current Price Marker */}
            {currentPoint && (
              <g>
                <circle
                  cx={scaleX(currentPoint.price)}
                  cy={scaleY(activeChart === 'profit' ? currentPoint.profit : (activeChart === 'revenue' ? currentPoint.revenue : currentPoint.demand))}
                  r="5"
                  fill="#f59e0b"
                  stroke="#fef3c7"
                  strokeWidth="2"
                />
                <text
                  x={scaleX(currentPoint.price)}
                  y={svgHeight - padBottom + 18}
                  fill="#f59e0b"
                  fontSize="10"
                  textAnchor="middle"
                >
                  Actual (${currentPoint.price.toFixed(2)})
                </text>
              </g>
            )}

            {/* Axis labels */}
            <text x={svgWidth / 2} y={svgHeight - 10} fill="#94a3b8" fontSize="11" textAnchor="middle">
              Precio Unitario ($)
            </text>
            <text x={18} y={svgHeight / 2} fill="#94a3b8" fontSize="11" textAnchor="middle" transform={`rotate(-90 18 ${svgHeight / 2})`}>
              {activeChart === 'profit' ? 'Utilidad Neta ($)' : (activeChart === 'revenue' ? 'Ingresos ($)' : 'Demanda (unidades)')}
            </text>
          </svg>
        </div>
      </div>

      {/* Sensitivity Table by Price Steps */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">
          Tabla de Sensibilidad y Elasticidad Puntual por Rango de Precios
        </h2>

        <div className="overflow-x-auto border border-slate-800 rounded-lg max-h-64">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0">
              <tr>
                <th className="px-3.5 py-2 font-medium">Precio ($)</th>
                <th className="px-3.5 py-2 font-medium text-right">Demanda Proyectada</th>
                <th className="px-3.5 py-2 font-medium text-right">Ingresos Proyectados</th>
                <th className="px-3.5 py-2 font-medium text-right">Costo Total</th>
                <th className="px-3.5 py-2 font-medium text-right">Utilidad Neta</th>
                <th className="px-3.5 py-2 font-medium text-right">Margen (%)</th>
                <th className="px-3.5 py-2 font-medium text-right">Elasticidad Puntual (ε)</th>
                <th className="px-3.5 py-2 font-medium text-center">Clasificación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {chartData.filter((_, idx) => idx % 4 === 0).map(pt => {
                const isOptProfit = pt.isOptimalProfit;
                const isCurrent = pt.isCurrent;
                return (
                  <tr
                    key={pt.price}
                    className={`transition-colors ${
                      isOptProfit ? 'bg-emerald-950/40 text-emerald-300 font-semibold' : (isCurrent ? 'bg-amber-950/30' : 'hover:bg-slate-800/30')
                    }`}
                  >
                    <td className="px-3.5 py-2 tabular-nums">
                      ${pt.price.toFixed(2)}
                      {isOptProfit && <span className="ml-1.5 text-[10px] text-emerald-400">★ Óptimo</span>}
                      {isCurrent && <span className="ml-1.5 text-[10px] text-amber-400">● Actual</span>}
                    </td>
                    <td className="px-3.5 py-2 text-right tabular-nums">{pt.demand.toLocaleString()} un.</td>
                    <td className="px-3.5 py-2 text-right tabular-nums">${pt.revenue.toLocaleString()}</td>
                    <td className="px-3.5 py-2 text-right tabular-nums text-slate-400">${pt.cost.toLocaleString()}</td>
                    <td className="px-3.5 py-2 text-right tabular-nums">
                      <span className={pt.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        ${pt.profit.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3.5 py-2 text-right tabular-nums">{pt.marginPct}%</td>
                    <td className="px-3.5 py-2 text-right tabular-nums text-indigo-400">{pt.elasticity}</td>
                    <td className="px-3.5 py-2 text-center font-sans text-[11px]">
                      {Math.abs(pt.elasticity) > 1.2 ? (
                        <span className="text-amber-400">Demanda Elástica</span>
                      ) : Math.abs(pt.elasticity) < 0.8 ? (
                        <span className="text-emerald-400">Demanda Inelástica</span>
                      ) : (
                        <span className="text-indigo-400">Elasticidad Unitaria</span>
                      )}
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
