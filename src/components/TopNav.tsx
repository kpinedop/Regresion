import React from 'react';
import { Database, Sparkles, Download, RefreshCw } from 'lucide-react';
import { PreloadedDataset, PRELOADED_DATASETS } from '../utils/datasets';

interface TopNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectDataset: (dataset: PreloadedDataset) => void;
  onExportReport: () => void;
  datasetName: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onSelectDataset,
  onExportReport,
  datasetName
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-slate-100 z-20">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a 
          href="#dashboard" 
          onClick={(e) => { e.preventDefault(); setActiveTab('context'); }}
          className="text-lg font-bold tracking-tight text-white hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-mono font-bold text-base text-white shadow-sm">
            P
          </span>
          <span>PriceLab AI</span>
        </a>
        <div className="hidden lg:flex items-center text-xs text-slate-400 gap-2 border-l border-slate-800 pl-3">
          <span>Econometría & Pricing Analytics</span>
          <span aria-hidden="true">·</span>
          <span className="text-indigo-400 font-medium truncate max-w-xs">{datasetName}</span>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('data')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeTab === 'data' ? 'text-indigo-400 border-indigo-500 font-semibold' : 'border-transparent'
          }`}
        >
          1. Datos & Calidad
        </button>
        <button
          onClick={() => setActiveTab('eda')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeTab === 'eda' ? 'text-indigo-400 border-indigo-500 font-semibold' : 'border-transparent'
          }`}
        >
          2. Exploración EDA
        </button>
        <button
          onClick={() => setActiveTab('modeling')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeTab === 'modeling' ? 'text-indigo-400 border-indigo-500 font-semibold' : 'border-transparent'
          }`}
        >
          3. Modelos & Regresión
        </button>
        <button
          onClick={() => setActiveTab('simulation')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeTab === 'simulation' ? 'text-indigo-400 border-indigo-500 font-semibold' : 'border-transparent'
          }`}
        >
          4. Simulación Escenarios
        </button>
        <button
          onClick={() => setActiveTab('optimization')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeTab === 'optimization' ? 'text-indigo-400 border-indigo-500 font-semibold' : 'border-transparent'
          }`}
        >
          5. Optimización Precios
        </button>
      </nav>

      {/* Zone 3: Quick Action Buttons */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="relative group">
          <button
            aria-label="Cargar dataset de ejemplo"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ejemplos</span>
          </button>
          
          <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-1.5 hidden group-hover:block z-30">
            <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Datasets de Prueba
            </div>
            {PRELOADED_DATASETS.map((ds) => (
              <button
                key={ds.id}
                onClick={() => onSelectDataset(ds)}
                className="w-full text-left px-2.5 py-2 rounded text-xs text-slate-200 hover:bg-slate-800 hover:text-indigo-400 transition-colors flex flex-col gap-0.5"
              >
                <span className="font-medium">{ds.name}</span>
                <span className="text-[11px] text-slate-400">{ds.category}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onExportReport}
          aria-label="Exportar reporte ejecutivo"
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shadow-sm shadow-indigo-900/40"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar</span>
        </button>
      </div>
    </header>
  );
};
