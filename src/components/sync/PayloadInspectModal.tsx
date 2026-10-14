import React, { useState } from 'react';
import { SyncLogEntry } from '../../types/sync';
import { Modal } from '../common/Modal';
import { Copy, Check, Code, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface PayloadInspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: SyncLogEntry | null;
}

export const PayloadInspectModal: React.FC<PayloadInspectModalProps> = ({
  isOpen,
  onClose,
  log,
}) => {
  const [copiedSection, setCopiedSection] = useState<'request' | 'response' | null>(null);

  if (!log) return null;

  const copyToClipboard = (text: string, section: 'request' | 'response') => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const requestJson = JSON.stringify(log.requestPayload || {}, null, 2);
  const responseJson = JSON.stringify(log.responsePayload || {}, null, 2);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Audit Inspection: ${log.action.toUpperCase()}`}
      subtitle={`Endpoint: ${log.endpoint} • HTTP ${log.httpStatus} • ${log.durationMs}ms`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Event Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-surface-950 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Status</span>
            <span
              className={`font-semibold ${
                log.status === 'success' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {log.status.toUpperCase()} (HTTP {log.httpStatus})
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Duration</span>
            <span className="text-slate-200 font-mono">{log.durationMs} ms</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Timestamp</span>
            <span className="text-slate-200 font-mono text-[11px]">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Products</span>
            <span className="text-slate-200 truncate block" title={log.productNames.join(', ')}>
              {log.productNames.join(', ')}
            </span>
          </div>
        </div>

        {log.errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
            <strong className="font-semibold block mb-0.5">Failure Reason:</strong>
            {log.errorMessage}
          </div>
        )}

        {/* Request & Response Side by Side / Stacked */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Outgoing Request Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <ArrowUpRight className="w-3.5 h-3.5 text-brand-400" />
                <span>Simulated Request Payload (Outgoing)</span>
              </div>
              <button
                onClick={() => copyToClipboard(requestJson, 'request')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-surface-950 hover:bg-slate-800 transition-colors"
              >
                {copiedSection === 'request' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-surface-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[300px] leading-relaxed">
              <code>{requestJson}</code>
            </pre>
          </div>

          {/* Incoming Response Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                <span>WooCommerce Response (Simulated)</span>
              </div>
              <button
                onClick={() => copyToClipboard(responseJson, 'response')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-surface-950 hover:bg-slate-800 transition-colors"
              >
                {copiedSection === 'response' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-surface-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[300px] leading-relaxed">
              <code>{responseJson}</code>
            </pre>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-800">
          <Code className="w-3.5 h-3.5" />
          <span>Complies with WooCommerce REST API v3 `/wp-json/wc/v3/products` specification.</span>
        </div>
      </div>
    </Modal>
  );
};
