import React, { useState } from 'react';
import { Briefcase, Target, HelpCircle, DollarSign, ArrowRight, Check } from 'lucide-react';
import { BusinessContext, BusinessGoal } from '../types';

interface BusinessContextViewProps {
  context: BusinessContext;
  onUpdateContext: (updated: BusinessContext) => void;
  onContinue: () => void;
}

export const BusinessContextView: React.FC<BusinessContextViewProps> = ({
  context,
  onUpdateContext,
  onContinue
}) => {
  const [formData, setFormData] = useState<BusinessContext>({ ...context });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof BusinessContext, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateContext(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
          <Briefcase className="w-4 h-4" />
          <span>Fase 1: Enmarcamiento Estratégico</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Contexto del Negocio y Restricciones de Pricing
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          El análisis econométrico debe responder a una necesidad comercial concreta. Define el producto, el objetivo estratégico y los parámetros de costos para calibrar la optimización de precios.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Sector / Industria
            </label>
            <input
              type="text"
              value={formData.sector}
              onChange={(e) => handleChange('sector', e.target.value)}
              placeholder="Ej. Alimentos y Bebidas (FMCG), SaaS B2B, Retail..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          {/* Producto */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Producto o Línea Analizada
            </label>
            <input
              type="text"
              value={formData.product}
              onChange={(e) => handleChange('product', e.target.value)}
              placeholder="Ej. Bebida Isotónica 500ml, Suscripción Cloud Pro..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          {/* Objetivo comercial */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>Objetivo Comercial Primario</span>
            </label>
            <select
              value={formData.businessGoal}
              onChange={(e) => handleChange('businessGoal', e.target.value as BusinessGoal)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="maximize_profit">Maximizar Utilidad Neta / Beneficio (Margen total)</option>
              <option value="maximize_revenue">Maximizar Ingresos Brutos (Facturación total)</option>
              <option value="market_share">Maximizar Cuota de Mercado (Volumen de ventas)</option>
              <option value="penetration">Estrategia de Penetración (Precio agresivo competitivo)</option>
            </select>
          </div>

          {/* Pregunta estratégica */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Pregunta Estratégica Clave</span>
            </label>
            <input
              type="text"
              value={formData.strategicQuestion}
              onChange={(e) => handleChange('strategicQuestion', e.target.value)}
              placeholder="Ej. ¿Hasta qué precio podemos subir sin erosionar el margen neto?"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Financial & Pricing Constraints Section */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">
              Parámetros Financieros y Restricciones de Precios
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Precio Actual */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Precio Actual ($)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={formData.currentPrice}
                onChange={(e) => handleChange('currentPrice', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent font-mono text-base font-semibold text-white focus:outline-none"
                required
              />
            </div>

            {/* Precio Mínimo */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Precio Mínimo ($)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={formData.minPrice}
                onChange={(e) => handleChange('minPrice', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent font-mono text-base font-semibold text-white focus:outline-none"
                required
              />
            </div>

            {/* Precio Máximo */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Precio Máximo ($)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={formData.maxPrice}
                onChange={(e) => handleChange('maxPrice', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent font-mono text-base font-semibold text-white focus:outline-none"
                required
              />
            </div>

            {/* Costo Variable Unitario */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Costo Unitario ($)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={formData.unitCost}
                onChange={(e) => handleChange('unitCost', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent font-mono text-base font-semibold text-white focus:outline-none"
                required
              />
            </div>

            {/* Costos Fijos */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 col-span-2 md:col-span-1">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Costos Fijos ($)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={formData.fixedCost}
                onChange={(e) => handleChange('fixedCost', parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent font-mono text-base font-semibold text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div className="pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <Check className="w-4 h-4" /> Parámetros guardados con éxito
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
            >
              Guardar Cambios
            </button>
            <button
              type="button"
              onClick={() => {
                onUpdateContext(formData);
                onContinue();
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
            >
              <span>Continuar a Carga de Datos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
