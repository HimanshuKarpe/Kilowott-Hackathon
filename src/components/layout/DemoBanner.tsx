import React from 'react';
import { Sliders, Activity } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';

interface DemoBannerProps {
  onOpenSettings: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onOpenSettings }) => {
  const { simulationConfig } = useCatalog();

  return (
    <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-1.5 text-xs text-[#64748B]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-medium text-[#0F172A]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
            <span>WooCommerce REST API v3 Simulation Mode</span>
          </span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="hidden sm:inline text-[#64748B]">
            Local sandbox (no live storefront credentials required)
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="flex items-center gap-1 text-[#0F172A]">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>{simulationConfig.latencyMs}ms</span>
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-[#64748B]">
            Error Rate:{' '}
            <strong className={simulationConfig.failureRate > 0 ? 'text-amber-700 font-semibold' : 'text-[#0F172A] font-semibold'}>
              {Math.round(simulationConfig.failureRate * 100)}%
            </strong>
          </span>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-sans hover:underline ml-1 font-medium cursor-pointer"
          >
            <Sliders className="w-3 h-3" />
            <span>Adapter Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
