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
      title={`REST API Inspection: ${log.action.toUpperCase()}`}
      subtitle={`Endpoint: ${log.endpoint} • HTTP ${log.httpStatus} • ${log.durationMs}ms duration`}
      maxWidth="3xl"
    >
      <div className="space-y-4 text-xs">
        {/* Event Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
          <div>
            <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Outcome</span>
            <span
              className={`font-semibold font-mono text-xs ${
                log.status === 'success' ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {log.status.toUpperCase()} (HTTP {log.httpStatus})
            </span>
          </div>

          <div>
            <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Duration</span>
            <span className="text-[#0F172A] font-mono text-xs font-medium">{log.durationMs} ms</span>
          </div>

          <div>
            <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Timestamp</span>
            <span className="text-[#0F172A] font-mono text-xs font-medium">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div>
            <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Target Product(s)</span>
            <span className="text-[#0F172A] truncate block font-sans font-medium text-xs" title={log.productNames.join(', ')}>
              {log.productNames.join(', ')}
            </span>
          </div>
        </div>

        {log.errorMessage && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <strong className="font-semibold block mb-0.5 text-rose-900">Failure Reason:</strong>
            {log.errorMessage}
          </div>
        )}

        {/* Request & Response Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Outgoing Request Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F172A]">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Simulated Request JSON</span>
              </div>
              <button
                onClick={() => copyToClipboard(requestJson, 'request')}
                className="text-xs text-[#0F172A] hover:bg-slate-100 flex items-center gap-1 px-2.5 py-1 rounded bg-[#F8FAFC] border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer"
              >
                {copiedSection === 'request' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-[#64748B]" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 rounded-lg bg-[#0F172A] text-slate-100 font-mono text-xs overflow-x-auto max-h-[300px] leading-relaxed border border-slate-800">
              <code>{requestJson}</code>
            </pre>
          </div>

          {/* Incoming Response Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F172A]">
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                <span>WooCommerce Response JSON</span>
              </div>
              <button
                onClick={() => copyToClipboard(responseJson, 'response')}
                className="text-xs text-[#0F172A] hover:bg-slate-100 flex items-center gap-1 px-2.5 py-1 rounded bg-[#F8FAFC] border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer"
              >
                {copiedSection === 'response' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-[#64748B]" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 rounded-lg bg-[#0F172A] text-slate-100 font-mono text-xs overflow-x-auto max-h-[300px] leading-relaxed border border-slate-800">
              <code>{responseJson}</code>
            </pre>
          </div>
        </div>

        <div className="text-xs text-[#64748B] flex items-center gap-1.5 pt-3 border-t border-[#E2E8F0]">
          <Code className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Complies with WooCommerce REST API v3 <code className="font-mono text-[#0F172A] bg-slate-100 px-1 py-0.5 rounded border border-[#E2E8F0]">/wp-json/wc/v3/products</code> specification.</span>
        </div>
      </div>
    </Modal>
  );
};
