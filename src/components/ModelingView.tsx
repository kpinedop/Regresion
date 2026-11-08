import React, { useState } from 'react';
import { 
  Layers, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  HelpCircle,
  TrendingDown,
  Info
} from 'lucide-react';
import { ModelResult, VariableSelection, ModelAlgorithm } from '../types';

interface ModelingViewProps {
  numericHeaders: string[];
  selection: VariableSelection;
  models: ModelResult[];
  activeModelId: ModelAlgorithm;
  onUpdateSelection: (newSelection: VariableSelection) => void;
  onSelectActiveModel: (id: ModelAlgorithm) => void;
  onContinue: () => void;
}

export const ModelingView: React.FC<ModelingViewProps> = ({
  numericHeaders,
  selection,
  models,
  activeModelId,
  onUpdateSelection,
  onSelectActiveModel,
  onContinue
}) => {
  const activeModel = models.find(m => m.id === activeModelId) || models[0];

  const handleToggleIndepVar = (varName: string) => {
    let updated: string[];
    if (selection.independentVars.includes(varName)) {
      if (selection.independentVars.length <= 1) return; // keep at least 1
      updated = selection.independentVars.filter(v => v !== varName);
    } else {
      updated = [...selection.independentVars, varName];
    }
    onUpdateSelection({ ...selection, independentVars: updated });
  };

  const handleDepVarChange = (newDepVar: string) => {
    const updatedIndeps = selection.independentVars.filter(v => v !== newDepVar);
    onUpdateSelection({
      ...selection,
      dependentVar: newDepVar,
      independentVars: updatedIndeps.length > 0 ? updatedIndeps : numericHeaders.filter(h => h !== newDepVar).slice(0, 2)
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Fase 4: Modelamiento Econométrico y Selección de Modelo</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Estimación de Ecuaciones de Demanda y Regularización
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparamos MCO (OLS clásico), regularización Ridge (L2), Lasso (L1), Elastic Net y Log-Log isoelástico con validación fuera de muestra.
          </p>
        </div>

        <button
          onClick={onContinue}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm shrink-0"
        >
          <span>Simular Escenarios</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Variable Selection Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">
          Definición de Variables del Modelo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dependent Variable */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Variable Dependiente (Y)
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Volumen de demanda, ventas o suscripciones.
            </p>
            <select
              value={selection.dependentVar}
              onChange={(e) => handleDepVarChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-indigo-400 focus:outline-none focus:border-indigo-500"
            >
              {numericHeaders.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Independent Variables */}
          <div className="md:col-span-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-200">
                Variables Independientes (X)
              </label>
              <span className="text-[11px] text-indigo-400 font-mono">
                {selection.independentVars.length} seleccionadas
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Precio propio, precios competidores, publicidad, descuentos y controles.
            </p>
            
            <div className="flex flex-wrap gap-2 pt-1">
              {numericHeaders
                .filter(h => h !== selection.dependentVar)
                .map(varName => {
                  const isChecked = selection.independentVars.includes(varName);
                  return (
                    <button
                      key={varName}
                      type="button"
                      onClick={() => handleToggleIndepVar(varName)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-indigo-900/50 border-indigo-500 text-indigo-200 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-indigo-400' : 'bg-slate-600'}`}></span>
                      <span>{varName}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Model Comparison Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Cuadro Comparativo de Modelos Estimados
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Haz clic en cualquier modelo para seleccionarlo como motor de predicción y optimización.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-3.5 py-2.5 font-medium">Modelo Estimado</th>
                <th className="px-3.5 py-2.5 font-medium text-right">R² Ajustado</th>
                <th className="px-3.5 py-2.5 font-medium text-right">R² Test (Holdout)</th>
                <th className="px-3.5 py-2.5 font-medium text-right">RMSE</th>
                <th className="px-3.5 py-2.5 font-medium text-right">MAE</th>
                <th className="px-3.5 py-2.5 font-medium text-right">F-Stat (p-val)</th>
                <th className="px-3.5 py-2.5 font-medium text-right">AIC / BIC</th>
                <th className="px-3.5 py-2.5 font-medium text-center">Multicolinealidad</th>
                <th className="px-3.5 py-2.5 font-medium text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {models.map(m => {
                const isSelected = m.id === activeModelId;
                return (
                  <tr
                    key={m.id}
                    onClick={() => onSelectActiveModel(m.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-950/40' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="px-3.5 py-3 font-sans">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-indigo-500' : 'bg-slate-600'}`}></span>
                        <div>
                          <span className={`font-semibold ${isSelected ? 'text-indigo-400' : 'text-slate-200'}`}>
                            {m.name}
                          </span>
                          {m.isBest && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-700 text-emerald-300 font-medium">
                              Mejor Modelo
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 text-right tabular-nums text-slate-200 font-semibold">
                      {(m.metrics.rSquaredAdj * 100).toFixed(1)}%
                    </td>
                    <td className="px-3.5 py-3 text-right tabular-nums text-slate-200">
                      {(m.metrics.testR2 * 100).toFixed(1)}%
                    </td>
                    <td className="px-3.5 py-3 text-right tabular-nums text-slate-300">
                      {m.metrics.rmse.toFixed(2)}
                    </td>
                    <td className="px-3.5 py-3 text-right tabular-nums text-slate-400">
                      {m.metrics.mae.toFixed(2)}
                    </td>
                    <td className="px-3.5 py-3 text-right tabular-nums text-slate-300">
                      {m.metrics.fStat ? `${m.metrics.fStat.toFixed(1)} (${(m.metrics.fPValue || 0) < 0.001 ? '<0.001' : m.metrics.fPValue?.toFixed(3)})` : '-'}
                    </td>
                    <td className="px-3.5 py-3 text-right tabular-nums text-slate-400 text-[11px]">
                      {m.metrics.aic.toFixed(0)} / {m.metrics.bic.toFixed(0)}
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      {m.vifWarning ? (
                        <span className="text-amber-400 font-sans text-[11px] flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> VIF &gt; 5
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-sans text-[11px] flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Estable
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-3 text-center font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectActiveModel(m.id);
                        }}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        {isSelected ? 'Activo' : 'Seleccionar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Best model rationale badge */}
        {activeModel.isBest && (
          <div className="bg-emerald-950/30 border border-emerald-800/80 rounded-lg p-3.5 text-xs text-emerald-300 flex items-start gap-3">
            <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-1">
                Selección Automática del Mejor Modelo: {activeModel.name}
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-200">
                {activeModel.selectionReasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Model Interpretation & Equation */}
      {activeModel && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-white">
                Ecuación Matemática Estimada: {activeModel.name}
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                Intercepto: {activeModel.intercept.toFixed(3)}
              </span>
            </div>

            {/* Latex / Math Box */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-indigo-300 overflow-x-auto">
              {activeModel.equation}
            </div>
          </div>

          {/* Detailed Coefficients Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Desglose de Coeficientes, Significancia Estadística e Impacto Comercial
              </h3>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Significancia:</span>
                <span className="text-emerald-400">*** p&lt;0.001</span>
                <span className="text-indigo-400">** p&lt;0.01</span>
                <span className="text-indigo-300">* p&lt;0.05</span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-3 py-2.5 font-medium">Variable</th>
                    <th className="px-3 py-2.5 font-medium text-right">Coeficiente (β)</th>
                    <th className="px-3 py-2.5 font-medium text-right">Error Est. (SE)</th>
                    <th className="px-3 py-2.5 font-medium text-right">t-Stat</th>
                    <th className="px-3 py-2.5 font-medium text-right">p-Valor</th>
                    <th className="px-3 py-2.5 font-medium text-right">IC 95%</th>
                    <th className="px-3 py-2.5 font-medium text-right">VIF</th>
                    <th className="px-3 py-2.5 font-medium text-right">Elasticidad</th>
                    <th className="px-3 py-2.5 font-medium">Interpretación Comercial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {activeModel.coefficients.map(c => {
                    const isSig = c.pValue < 0.05;
                    return (
                      <tr key={c.variable} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-3 py-2.5 font-sans font-medium text-slate-200">
                          {c.variable}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-slate-200 font-semibold">
                          {c.beta.toFixed(3)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-slate-400">
                          {c.stdError.toFixed(3)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-slate-300">
                          {c.tStat.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          <span className={isSig ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                            {c.pValue < 0.001 ? '<0.001' : c.pValue.toFixed(4)} {c.significance}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-slate-400 text-[11px]">
                          [{c.ciLower.toFixed(2)}, {c.ciUpper.toFixed(2)}]
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          <span className={c.vif > 5 ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                            {c.vif.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-indigo-400 font-semibold">
                          {c.elasticity !== undefined ? c.elasticity.toFixed(2) : '-'}
                        </td>
                        <td className="px-3 py-2.5 font-sans text-slate-300 text-[11px]">
                          {c.commercialImpact}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
