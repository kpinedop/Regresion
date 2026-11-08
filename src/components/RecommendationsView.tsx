import React from 'react';
import { 
  Award, 
  ShieldAlert, 
  CheckCircle2, 
  Download, 
  Printer, 
  AlertTriangle, 
  FileText,
  DollarSign,
  TrendingUp,
  Target
} from 'lucide-react';
import { ModelResult, BusinessContext, PriceOptimization, SimulationScenario } from '../types';

interface RecommendationsViewProps {
  model: ModelResult;
  context: BusinessContext;
  optimization: PriceOptimization;
  priceVarName: string;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  model,
  context,
  optimization,
  priceVarName
}) => {
  const currentP = context.currentPrice;
  const optimalP = optimization.optimalPriceProfit;
  const priceDiffPct = ((optimalP - currentP) / (currentP || 1)) * 100;

  // Elasticity diagnostic
  const priceCoeff = model.coefficients.find(c => 
    c.variable.toLowerCase().includes('precio') || 
    c.variable.toLowerCase().includes('price') || 
    c.variable === priceVarName
  );
  const estElasticity = priceCoeff?.elasticity || -1.2;
  const isElastic = Math.abs(estElasticity) > 1.0;

  let pricingStatus: 'underpriced' | 'overpriced' | 'optimal' = 'optimal';
  let statusHeadline = '';
  let statusSummary = '';

  if (priceDiffPct > 3) {
    pricingStatus = 'underpriced';
    statusHeadline = `Oportunidad de Captura de Margen: Producto Sub-tarificado (Underpriced)`;
    statusSummary = `El precio actual ($${currentP.toFixed(2)}) se encuentra un ${priceDiffPct.toFixed(1)}% por debajo del precio óptimo de beneficio ($${optimalP.toFixed(2)}). La baja sensibilidad relativa de la demanda permite absorber un incremento escalonado para elevar la utilidad neta en un +${optimization.potentialProfitGainPct}% sin riesgo de colapso de ventas.`;
  } else if (priceDiffPct < -3) {
    pricingStatus = 'overpriced';
    statusHeadline = `Riesgo de Destrucción de Volumen: Sobre-tarificación (Overpriced)`;
    statusSummary = `El precio actual ($${currentP.toFixed(2)}) supera el punto óptimo microeconómico ($${optimalP.toFixed(2)}) en un ${Math.abs(priceDiffPct).toFixed(1)}%. La pérdida de demanda marginal excede la ganancia unitaria de margen, erosionando la utilidad total. Un reajuste a la baja o paquete promocional expandiría las ganancias en +${optimization.potentialProfitGainPct}%.`;
  } else {
    pricingStatus = 'optimal';
    statusHeadline = `Precio en Equilibrio Cuasi-Óptimo`;
    statusSummary = `El precio actual ($${currentP.toFixed(2)}) coincide estrechamente con el óptimo de utilidades ($${optimalP.toFixed(2)}). Se recomienda mantener la tarifa base y enfocarse en defender cuota y monitorear al competidor.`;
  }

  // Export handlers
  const handleExportJSON = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      businessContext: context,
      bestModel: {
        id: model.id,
        name: model.name,
        equation: model.equation,
        rSquaredAdj: model.metrics.rSquaredAdj,
        rmse: model.metrics.rmse,
        coefficients: model.coefficients
      },
      optimizationResults: {
        optimalPriceProfit: optimization.optimalPriceProfit,
        maxProfit: optimization.maxProfit,
        potentialProfitGainPct: optimization.potentialProfitGainPct,
        optimalPriceRevenue: optimization.optimalPriceRevenue,
        maxRevenue: optimization.maxRevenue,
        lernerIndex: optimization.lernerIndex,
        currentPrice: optimization.currentPrice,
        currentProfit: optimization.currentProfit
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PriceLab_Report_${context.product.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const rows = [
      ['Precio', 'Demanda_Proyectada', 'Ingresos', 'Costos', 'Utilidad_Neta', 'Margen_Pct', 'Elasticidad'],
      ...optimization.curve.map(pt => [
        pt.price.toFixed(2),
        pt.demand,
        pt.revenue,
        pt.cost,
        pt.profit,
        pt.marginPct,
        pt.elasticity
      ])
    ];

    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PriceLab_Sensitivity_${context.product.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto print:p-0">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Fase 7: Dictamen Estratégico y Hoja de Ruta Comercial</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Recomendaciones Ejecutivas y Plan de Acción
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Conclusiones cuantitativas deducidas de la elasticidad de demanda y la función de beneficio microeconómica.
          </p>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Curva</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Informe</span>
          </button>
        </div>
      </div>

      {/* Main Strategic Verdict Card */}
      <div className={`p-6 rounded-xl border-2 space-y-4 shadow-xl ${
        pricingStatus === 'underpriced'
          ? 'bg-emerald-950/20 border-emerald-500/80'
          : pricingStatus === 'overpriced'
          ? 'bg-amber-950/20 border-amber-500/80'
          : 'bg-indigo-950/20 border-indigo-500/80'
      }`}>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <Target className="w-4 h-4 text-emerald-400" />
          <span className="text-white">Diagnóstico Microeconómico Principal</span>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">
          {statusHeadline}
        </h2>

        <p className="text-sm text-slate-300 leading-relaxed">
          {statusSummary}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Precio Actual</span>
            <span className="text-lg font-bold font-mono text-slate-200 tabular-nums">
              ${currentP.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Precio Óptimo Beneficio</span>
            <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
              ${optimalP.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Ganancia en Beneficio</span>
            <span className="text-lg font-bold font-mono text-indigo-400 tabular-nums">
              +{optimization.potentialProfitGainPct}%
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Elasticidad Estimada (ε)</span>
            <span className="text-lg font-bold font-mono text-slate-200 tabular-nums">
              {estElasticity.toFixed(2)} ({isElastic ? 'Elástica' : 'Inelástica'})
            </span>
          </div>
        </div>
      </div>

      {/* Actionable Steps & Risk Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Actionable Steps */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">
              Hoja de Ruta y Pasos de Implementación Recomendados
            </h3>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div className="text-xs space-y-0.5">
                <strong className="text-slate-200 block">
                  Alineación hacia el Precio Objetivo (${optimalP.toFixed(2)})
                </strong>
                <p className="text-slate-400">
                  {pricingStatus === 'underpriced'
                    ? `Aplicar un incremento escalonado (ej. 2 fases de +$${((optimalP - currentP)/2).toFixed(2)}) para evitar fricción abrupta en clientes sensibles.`
                    : `Implementar una rebaja estructurada o bonificación por volumen para capturar la demanda latente y maximizar el margen bruto.`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <div className="text-xs space-y-0.5">
                <strong className="text-slate-200 block">
                  Monitoreo de Reacción Competitiva
                </strong>
                <p className="text-slate-400">
                  Vigilar el precio de los competidores clave. Si el rival iguala el precio o lanza descuentos agresivos, la elasticidad cruzada modelada indica que debe reajustarse la inversión en factores de diferenciación.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <div className="text-xs space-y-0.5">
                <strong className="text-slate-200 block">
                  A/B Testing de Pricing por Cohortes o Canales
                </strong>
                <p className="text-slate-400">
                  Validar la curva estimada mediante pruebas aleatorizadas en un subconjunto de usuarios o tiendas piloto antes del despliegue masivo al 100% del catálogo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Matrix */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">
              Matriz de Riesgos y Mitigación
            </h3>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-xs space-y-1">
              <div className="flex items-center justify-between text-amber-400 font-semibold">
                <span>Riesgo de Guerra de Precios</span>
                <span className="text-[10px] bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">Medio</span>
              </div>
              <p className="text-slate-400">
                <strong className="text-slate-300">Mitigación:</strong> Destacar atributos no de precio (calidad, SLA, tiempos de entrega) en lugar de competir exclusivamente por tarifa.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-xs space-y-1">
              <div className="flex items-center justify-between text-rose-400 font-semibold">
                <span>Riesgo de Inflación de Costos</span>
                <span className="text-[10px] bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">Alto</span>
              </div>
              <p className="text-slate-400">
                <strong className="text-slate-300">Mitigación:</strong> Un aumento en el costo unitario traslada automáticamente el precio óptimo hacia arriba según la regla de Lerner. Re-ejecutar el simulador periódicamente.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-xs space-y-1">
              <div className="flex items-center justify-between text-indigo-400 font-semibold">
                <span>Erosión de Marca por Descuentos</span>
                <span className="text-[10px] bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800">Controlable</span>
              </div>
              <p className="text-slate-400">
                <strong className="text-slate-300">Mitigación:</strong> Usar cupones dirigidos o paquetes de valor añadido en vez de rebajas visibles universales.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Econometric Caution Banner */}
      <div className="bg-slate-950 border border-amber-900/60 rounded-xl p-5 text-xs text-amber-200/90 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-300 block font-semibold">
            Advertencia Metodológica y Rigor Econométrico:
          </strong>
          <p className="text-slate-300">
            Una asociación o correlación estadística en datos observacionales <strong>no demuestra causalidad estricta</strong>. Los coeficientes estimados representan relaciones empíricas <em>ceteris paribus</em> bajo el supuesto de identificación econométrica. Factores exógenos macroeconómicos, sesgos de endogeneidad o variables omitidas no registradas en el dataset pueden desplazar la curva de demanda real. Utilice estos modelos como una guía analítica y complemente con experimentación de mercado.
          </p>
        </div>
      </div>
    </div>
  );
};
