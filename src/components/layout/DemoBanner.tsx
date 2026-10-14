import React from 'react';
import { Sliders, Sparkles, Activity } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';

interface DemoBannerProps {
  onOpenSettings: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onOpenSettings }) => {
  const { simulationConfig } = useCatalog();

  return (
    <div className="bg-gradient-to-r from-brand-950 via-surface-900 to-brand-950 border-b border-brand-500/20 px-4 py-2 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-medium">
            <Sparkles className="w-3 h-3 text-brand-400" />
            Hackathon Demo Sandbox
          </span>
          <span className="hidden md:inline text-slate-400">
            Simulating WooCommerce REST API v3 locally. Safe, isolated, and zero live credentials needed.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Latency: {simulationConfig.latencyMs}ms</span>
            <span className="text-slate-600">|</span>
            <span>Failure Rate: {Math.round(simulationConfig.failureRate * 100)}%</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1 text-brand-300 hover:text-white bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 px-2 py-1 rounded-md transition-colors"
          >
            <Sliders className="w-3 h-3" />
            <span>Configure Adapter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
