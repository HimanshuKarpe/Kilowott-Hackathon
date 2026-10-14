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
    { label: '0% (Standard Success)', value: 0 },
    { label: '25% (Occasional Errors)', value: 0.25 },
    { label: '50% (High Error Rate)', value: 0.5 },
    { label: '100% (Simulate Outage)', value: 1.0 },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="WooCommerce Adapter Configuration"
      subtitle="Configure simulated REST API v3 latency, error injection, and test parameters"
      maxWidth="md"
    >
      <div className="space-y-5 text-sm text-[#0F172A]">
        {/* Notice Box */}
        <div className="p-3.5 rounded-lg bg-blue-50/80 border border-blue-200 text-[#0F172A] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
          <div className="leading-relaxed text-xs">
            <strong className="text-[#0F172A] block font-semibold mb-0.5">
              Simulated In-Browser Sandbox
            </strong>
            Emulates WooCommerce REST v3 responses locally. You can inject HTTP errors (429 Rate Limits, 500 DB Deadlocks, 422 Validations) to test sync error recovery safely without connecting live credentials.
          </div>
        </div>

        {/* Latency Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-[#0F172A]">
            <span>Simulated Network Latency</span>
            <span className="font-mono text-[#2563EB] font-bold">{form.latencyMs} ms</span>
          </div>
          <input
            type="range"
            min="100"
            max="2500"
            step="50"
            value={form.latencyMs}
            onChange={(e) => setForm({ ...form, latencyMs: Number(e.target.value) })}
            className="w-full accent-[#2563EB] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-[#64748B] font-mono">
            <span>100ms (Fast)</span>
            <span>700ms (Cloud Default)</span>
            <span>2500ms (Slow Network)</span>
          </div>
        </div>

        {/* Failure Rate Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[#0F172A] block">
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
                  className={`p-2.5 rounded-lg border text-xs text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#2563EB] bg-[#DBEAFE]/60 text-[#1E40AF] font-semibold shadow-xs'
                      : 'border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC] hover:border-slate-300'
                  }`}
                >
                  {fr.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Simulate Network Outage Toggle */}
        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-rose-50 border border-rose-200 text-rose-600">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#0F172A] block">Simulate Offline Disconnection</span>
              <span className="text-[11px] text-[#64748B]">Throws simulated ECONNREFUSED network drop</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={form.simulateNetworkError}
            onChange={(e) => setForm({ ...form, simulateNetworkError: e.target.checked })}
            className="w-4 h-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer accent-[#2563EB]"
          />
        </div>

        {/* Mock Endpoint URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#0F172A] block">
            Simulated Endpoint Placeholder (Local Emulation Only)
          </label>
          <input
            type="text"
            value={form.mockEndpointUrl}
            onChange={(e) => setForm({ ...form, mockEndpointUrl: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-white font-mono text-xs text-[#0F172A] border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          />
          <p className="text-[11px] text-[#64748B]">
            Simulated placeholder for demonstration. Requests are emulated locally in-browser and do not transmit over the live internet.
          </p>
        </div>

        {/* Visible Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E2E8F0]">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save Configuration
          </Button>
        </div>
      </div>
    </Modal>
  );
};
