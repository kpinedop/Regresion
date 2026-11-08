import React from 'react';
import { 
  Briefcase, 
  Database, 
  BarChart3, 
  Layers, 
  Sliders, 
  TrendingUp, 
  Award,
  DollarSign
} from 'lucide-react';
import { BusinessContext } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  context: BusinessContext;
  dataRowCount: number;
  modelsCalculatedCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  context,
  dataRowCount,
  modelsCalculatedCount
}) => {
  const navItems = [
    {
      id: 'context',
      label: 'Contexto del Negocio',
      icon: Briefcase,
      badge: context.sector ? context.sector.split(' ')[0] : 'Pendiente'
    },
    {
      id: 'data',
      label: 'Carga & Calidad',
      icon: Database,
      badge: `${dataRowCount} filas`
    },
    {
      id: 'eda',
      label: 'Exploración EDA',
      icon: BarChart3,
      badge: 'Correlaciones'
    },
    {
      id: 'modeling',
      label: 'Modelos de Regresión',
      icon: Layers,
      badge: `${modelsCalculatedCount} modelos`
    },
    {
      id: 'simulation',
      label: 'Simulación Escenarios',
      icon: Sliders,
      badge: 'Monte Carlo'
    },
    {
      id: 'optimization',
      label: 'Optimización de Precios',
      icon: TrendingUp,
      badge: 'Curvas P-Q'
    },
    {
      id: 'recommendations',
      label: 'Recomendaciones',
      icon: Award,
      badge: 'Estrategia'
    }
  ];

  const goalLabels: Record<string, string> = {
    maximize_profit: 'Maximizar Beneficio',
    maximize_revenue: 'Maximizar Ingresos',
    market_share: 'Cuota de Mercado',
    penetration: 'Penetración de Mercado'
  };

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
      <div className="p-4 border-b border-slate-800/80">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Módulos de Análisis
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/50'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                <span className={`text-[10px] tabular-nums px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-indigo-700/80 text-indigo-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Business context mini summary card */}
      <div className="p-4 border-b border-slate-800/60 flex-1 flex flex-col justify-end">
        <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-medium text-[11px] text-slate-300">Target Comercial</span>
            <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div>
            <div className="text-slate-200 font-semibold truncate">{context.product || 'Sin producto'}</div>
            <div className="text-[11px] text-indigo-400">{goalLabels[context.businessGoal] || context.businessGoal}</div>
          </div>
          <div className="pt-1.5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">P. Actual</span>
              <span className="font-mono text-slate-200 tabular-nums">${context.currentPrice.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Costo Unit.</span>
              <span className="font-mono text-slate-200 tabular-nums">${context.unitCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Econometric footnote */}
      <div className="p-3 text-[11px] text-slate-400 bg-slate-950/50 border-t border-slate-800 text-center">
        <span>Asociación estadística ≠ Causalidad</span>
      </div>
    </aside>
  );
};
