import React, { useState } from 'react';
import { SyncSimulationConfig } from '../../types/sync';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useCatalog } from '../../context/CatalogContext';
import { ShieldCheck, WifiOff } from 'lucide-react';

interface SimulationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulationConfigModal: React.FC<SimulationConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { simulationConfig, updateSimulationConfig } = useCatalog();

  const [form, setForm] = useState<SyncSimulationConfig>(simulationConfig);

  const handleSave = () => {
    updateSimulationConfig(form);
    onClose();
  };

  const failureRates = [
    { label: '0% (Always Succeed)', value: 0 },
    { label: '25% (Occasional Errors)', value: 0.25 },
    { label: '50% (High Error Rate)', value: 0.5 },
    { label: '100% (Always Fail)', value: 1.0 },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Demo WooCommerce Adapter Configuration"
      subtitle="Tune simulated REST API v3 behaviour, network latency, and error injection"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Notice Box */}
        <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-300 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold block text-white mb-0.5">Isolated In-Browser Simulation</strong>
            This adapter emulates WooCommerce REST v3 responses locally. You can intentionally inject errors (429 Rate Limits, 500 DB Locks, 422 Validations) to test sync resilience.
          </div>
        </div>

        {/* Latency Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-medium text-slate-300">Simulated Network Latency</label>
            <span className="font-mono text-brand-400 font-bold">{form.latencyMs} ms</span>
          </div>
          <input
            type="range"
            min="100"
            max="2500"
            step="50"
            value={form.latencyMs}
            onChange={(e) => setForm({ ...form, latencyMs: Number(e.target.value) })}
            className="w-full accent-brand-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>100ms (Fast)</span>
            <span>700ms (Realistic Cloud)</span>
            <span>2500ms (Slow 3G)</span>
          </div>
        </div>

        {/* Failure Rate Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300 block">
            Simulated Remote Failure Rate
          </label>
          <div className="grid grid-cols-2 gap-2">
            {failureRates.map((fr) => {
              const isSelected = form.failureRate === fr.value;
              return (
                <button
                  key={fr.value}
                  type="button"
                  onClick={() => setForm({ ...form, failureRate: fr.value })}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-500/15 text-white font-semibold shadow-sm'
                      : 'border-slate-800 bg-surface-950 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {fr.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Simulate Network Outage Toggle */}
        <div className="p-3.5 rounded-xl bg-surface-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-rose-400" />
            <div>
              <span className="text-xs font-semibold text-white block">Simulate Complete Offline Outage</span>
              <span className="text-[11px] text-slate-400">Throws simulated ECONNREFUSED network drop</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={form.simulateNetworkError}
            onChange={(e) => setForm({ ...form, simulateNetworkError: e.target.checked })}
            className="w-4 h-4 rounded border-slate-700 bg-surface-900 text-brand-600 focus:ring-brand-500 cursor-pointer"
          />
        </div>

        {/* Mock Endpoint URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">
            Mock WooCommerce Store API Endpoint
          </label>
          <input
            type="text"
            value={form.mockEndpointUrl}
            onChange={(e) => setForm({ ...form, mockEndpointUrl: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-surface-950 font-mono text-xs text-slate-200 border border-slate-700 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Apply Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
};
