import React, { useState, useMemo } from 'react';
import { BarChart3, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, Info, ArrowRight } from 'lucide-react';
import { ColumnProfile, DataQualityReport } from '../types';
import { pearsonCorrelation, mean } from '../utils/econometrics';

interface ExploratoryAnalysisViewProps {
  headers: string[];
  data: Record<string, string | number>[];
  qualityReport: DataQualityReport;
  onContinue: () => void;
}

export const ExploratoryAnalysisView: React.FC<ExploratoryAnalysisViewProps> = ({
  headers,
  data,
  qualityReport,
  onContinue
}) => {
  // Only numeric columns can be used in correlation and scatter
  const numericCols = useMemo(() => {
    return qualityReport.profiles
      .filter(p => p.type === 'numeric')
      .map(p => p.name);
  }, [qualityReport]);

  const [varX, setVarX] = useState<string>(() => {
    return numericCols.find(c => c.toLowerCase().includes('precio') || c.toLowerCase().includes('price')) || numericCols[0] || '';
  });

  const [varY, setVarY] = useState<string>(() => {
    return numericCols.find(c => c.toLowerCase().includes('demanda') || c.toLowerCase().includes('ventas') || c.toLowerCase().includes('sales')) || numericCols[1] || '';
  });

  // Calculate correlation matrix
  const correlationMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    numericCols.forEach(col1 => {
      matrix[col1] = {};
      const vals1 = data.map(r => Number(r[col1]) || 0);
      numericCols.forEach(col2 => {
        const vals2 = data.map(r => Number(r[col2]) || 0);
        matrix[col1][col2] = Math.round(pearsonCorrelation(vals1, vals2) * 100) / 100;
      });
    });
    return matrix;
  }, [numericCols, data]);

  // Scatter points and regression trendline
  const scatterData = useMemo(() => {
    if (!varX || !varY) return { points: [], slope: 0, intercept: 0, r2: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 };
    
    const validPairs = data
      .map(r => ({ x: Number(r[varX]), y: Number(r[varY]) }))
      .filter(p => !isNaN(p.x) && !isNaN(p.y));

    if (validPairs.length === 0) return { points: [], slope: 0, intercept: 0, r2: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 };

    const xs = validPairs.map(p => p.x);
    const ys = validPairs.map(p => p.y);
    const mx = mean(xs);
    const my = mean(ys);

    let num = 0;
    let den = 0;
    for (let i = 0; i < validPairs.length; i++) {
      num += (xs[i] - mx) * (ys[i] - my);
      den += Math.pow(xs[i] - mx, 2);
    }

    const slope = den !== 0 ? num / den : 0;
    const intercept = my - slope * mx;
    const corr = pearsonCorrelation(xs, ys);
    const r2 = Math.round(Math.pow(corr, 2) * 100) / 100;

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return { points: validPairs, slope, intercept, r2, minX, maxX, minY, maxY };
  }, [varX, varY, data]);

  // Business rule validation for Price vs Demand
  const businessRuleValidation = useMemo(() => {
    const isPriceX = varX.toLowerCase().includes('precio') || varX.toLowerCase().includes('price');
    const isDemandY = varY.toLowerCase().includes('demanda') || varY.toLowerCase().includes('ventas') || varY.toLowerCase().includes('sales');

    if (isPriceX && isDemandY) {
      if (scatterData.slope < 0) {
        return {
          status: 'compliant',
          message: 'Relación consistente con la Ley de la Demanda: Pendiente negativa verificada. Al incrementar el precio, la cantidad demandada se reduce.',
          type: 'success'
        };
      } else {
        return {
          status: 'warning',
          message: 'Alerta econométrica: Se detectó una pendiente positiva entre precio y volumen. En la práctica comercial esto suele reflejar Sesgo de Variable Omitida (Endogeneidad: precios más altos coincidieron con campañas publicitarias intensas o picos de temporada alta). Es imprescindible controlar estas covariables en el modelo multivariado.',
          type: 'warning'
        };
      }
    }
    return null;
  }, [varX, varY, scatterData]);

  // SVG dimensions for scatter plot
  const svgWidth = 600;
  const svgHeight = 280;
  const pad = 40;

  const scaleX = (x: number) => {
    const range = (scatterData.maxX - scatterData.minX) || 1;
    return pad + ((x - scatterData.minX) / range) * (svgWidth - 2 * pad);
  };

  const scaleY = (y: number) => {
    const range = (scatterData.maxY - scatterData.minY) || 1;
    return (svgHeight - pad) - ((y - scatterData.minY) / range) * (svgHeight - 2 * pad);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Fase 3: Análisis Exploratorio de Datos (EDA)</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Estadísticas Descriptivas, Correlaciones y Ley de la Demanda
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspección de dispersiones, colinealidades previas y coherencia con la microeconomía antes de entrenar modelos.
          </p>
        </div>

        <button
          onClick={onContinue}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm shrink-0"
        >
          <span>Ir a Modelamiento</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scatter plot & Business Validation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scatter View */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-white">
              Diagrama de Dispersión Bivariado con Línea de Tendencia
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-slate-400">X:</span>
                <select
                  value={varX}
                  onChange={(e) => setVarX(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none"
                >
                  {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Y:</span>
                <select
                  value={varY}
                  onChange={(e) => setVarY(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none"
                >
                  {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* SVG Plot */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 overflow-hidden flex flex-col items-center">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto max-h-72">
              {/* Grid lines */}
              <line x1={pad} y1={pad} x2={pad} y2={svgHeight - pad} stroke="#334155" strokeWidth="1" />
              <line x1={pad} y1={svgHeight - pad} x2={svgWidth - pad} y2={svgHeight - pad} stroke="#334155" strokeWidth="1" />
              
              {/* Trendline */}
              {scatterData.points.length > 1 && (
                <line
                  x1={scaleX(scatterData.minX)}
                  y1={scaleY(scatterData.slope * scatterData.minX + scatterData.intercept)}
                  x2={scaleX(scatterData.maxX)}
                  y2={scaleY(scatterData.slope * scatterData.maxX + scatterData.intercept)}
                  stroke="#818cf8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              )}

              {/* Data points */}
              {scatterData.points.map((pt, i) => (
                <circle
                  key={i}
                  cx={scaleX(pt.x)}
                  cy={scaleY(pt.y)}
                  r="4"
                  fill="#6366f1"
                  fillOpacity="0.8"
                  stroke="#c7d2fe"
                  strokeWidth="1"
                />
              ))}

              {/* Labels */}
              <text x={svgWidth / 2} y={svgHeight - 10} fill="#94a3b8" fontSize="11" textAnchor="middle">
                {varX}
              </text>
              <text x={14} y={svgHeight / 2} fill="#94a3b8" fontSize="11" textAnchor="middle" transform={`rotate(-90 14 ${svgHeight / 2})`}>
                {varY}
              </text>
            </svg>

            <div className="w-full flex items-center justify-between text-xs text-slate-400 font-mono px-3 pt-2 border-t border-slate-800/80">
              <span>Pendiente: <strong className="text-slate-200">{scatterData.slope.toFixed(4)}</strong></span>
              <span>Intersección: <strong className="text-slate-200">{scatterData.intercept.toFixed(2)}</strong></span>
              <span>R² bivariado: <strong className="text-indigo-400">{scatterData.r2}</strong></span>
            </div>
          </div>

          {/* Validation note */}
          {businessRuleValidation && (
            <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
              businessRuleValidation.type === 'success' 
                ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
                : 'bg-amber-950/30 border-amber-800/80 text-amber-300'
            }`}>
              {businessRuleValidation.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-semibold block mb-0.5">Validación de Regla de Negocio:</span>
                <span>{businessRuleValidation.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Correlation Heatmap */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              Matriz de Correlación de Pearson
            </h2>
            <span className="text-[11px] text-slate-400">Escala de -1.0 a +1.0</span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-xs text-center">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-2 py-2 text-left font-medium"></th>
                  {numericCols.map(c => (
                    <th key={c} className="px-2 py-2 font-mono text-[11px] truncate max-w-[80px]" title={c}>
                      {c.substring(0, 8)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {numericCols.map(r => (
                  <tr key={r}>
                    <td className="px-2 py-1.5 text-left font-medium text-slate-300 truncate max-w-[100px]" title={r}>
                      {r.substring(0, 10)}
                    </td>
                    {numericCols.map(c => {
                      const val = correlationMatrix[r]?.[c] ?? 0;
                      // Color mapping
                      let bgClass = 'bg-slate-900 text-slate-300';
                      if (r === c) {
                        bgClass = 'bg-slate-800 text-slate-400';
                      } else if (val > 0.6) {
                        bgClass = 'bg-indigo-900/60 text-indigo-200 font-semibold';
                      } else if (val > 0.2) {
                        bgClass = 'bg-indigo-950/40 text-indigo-300';
                      } else if (val < -0.6) {
                        bgClass = 'bg-rose-900/60 text-rose-200 font-semibold';
                      } else if (val < -0.2) {
                        bgClass = 'bg-rose-950/40 text-rose-300';
                      }

                      return (
                        <td key={c} className={`px-2 py-1.5 tabular-nums ${bgClass}`}>
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
              <span>Correlación Positiva</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              <span>Correlación Negativa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">
          Estadísticas Descriptivas y Momentos Estadísticos
        </h2>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-3.5 py-2.5 font-medium">Variable Numérica</th>
                <th className="px-3.5 py-2.5 font-medium text-right">Media</th>
                <th className="px-3.5 py-2.5 font-medium text-right">Mediana</th>
                <th className="px-3.5 py-2.5 font-medium text-right">Desv. Estándar</th>
                <th className="px-3.5 py-2.5 font-medium text-right">Rango (Mín - Máx)</th>
                <th className="px-3.5 py-2.5 font-medium text-right">IQR (Q3 - Q1)</th>
                <th className="px-3.5 py-2.5 font-medium text-right">Asimetría (Skew)</th>
                <th className="px-3.5 py-2.5 font-medium">Evaluación de Distribución</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {qualityReport.profiles.filter(p => p.type === 'numeric').map(prof => {
                const skew = prof.skewness || 0;
                let distNote = 'Distribución simétrica aproximada';
                if (skew > 1) distNote = 'Sesgo positivo a la derecha (recomendable transformación log)';
                else if (skew < -1) distNote = 'Sesgo negativo a la izquierda';

                return (
                  <tr key={prof.name} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-3.5 py-2.5 font-medium text-slate-200 font-sans">{prof.name}</td>
                    <td className="px-3.5 py-2.5 text-right tabular-nums text-slate-200">{prof.mean?.toFixed(2)}</td>
                    <td className="px-3.5 py-2.5 text-right tabular-nums text-slate-200">{prof.median?.toFixed(2)}</td>
                    <td className="px-3.5 py-2.5 text-right tabular-nums text-slate-400">{prof.stdDev?.toFixed(2)}</td>
                    <td className="px-3.5 py-2.5 text-right tabular-nums text-slate-400">{prof.min} - {prof.max}</td>
                    <td className="px-3.5 py-2.5 text-right tabular-nums text-slate-400">{prof.iqr?.toFixed(2)}</td>
                    <td className="px-3.5 py-2.5 text-right tabular-nums text-slate-300">
                      <span className={Math.abs(skew) > 1 ? 'text-amber-400' : 'text-slate-300'}>
                        {skew.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-sans text-slate-400 text-[11px]">{distNote}</td>
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
