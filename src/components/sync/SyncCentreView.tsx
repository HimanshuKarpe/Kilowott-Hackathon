import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { SyncLogEntry } from '../../types/sync';
import { SyncStatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  RefreshCw,
  Sliders,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Code,
  ShieldCheck,
} from 'lucide-react';

interface SyncCentreViewProps {
  onOpenSettings: () => void;
  onInspectLog: (log: SyncLogEntry) => void;
  onOpenClearLogsConfirm: () => void;
}

export const SyncCentreView: React.FC<SyncCentreViewProps> = ({
  onOpenSettings,
  onInspectLog,
  onOpenClearLogsConfirm,
}) => {
  const {
    products,
    syncLogs,
    syncSingleProduct,
    syncAllPendingProducts,
    syncSelectedProducts,
    selectedProductIds,
    toggleSelectProduct,
    isSyncing,
    activeSyncProductIds,
  } = useCatalog();

  const [logFilter, setLogFilter] = useState<'all' | 'success' | 'failed'>('all');

  // Products in queue
  const queueProducts = products.filter(
    (p) => p.syncStatus === 'pending_sync' || p.syncStatus === 'sync_error'
  );

  // Filtered audit logs
  const filteredLogs = syncLogs.filter((log) => {
    if (logFilter === 'all') return true;
    return log.status === logFilter;
  });

  const successLogsCount = syncLogs.filter((l) => l.status === 'success').length;
  const failedLogsCount = syncLogs.filter((l) => l.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#2563EB]" />
            <span>WooCommerce Synchronisation</span>
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Manage pending catalogue updates, retry failures, and audit REST API v3 synchronisation outcomes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            icon={<Sliders className="w-3.5 h-3.5" />}
          >
            Adapter Settings
          </Button>

          {queueProducts.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={syncAllPendingProducts}
              isLoading={isSyncing}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync All Pending ({queueProducts.length})
            </Button>
          )}
        </div>
      </div>

      {/* Simulated Integration Disclosure Banner */}
      <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/90 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-xs text-[#0F172A] leading-relaxed">
          <strong className="text-[#0F172A] font-semibold block mb-0.5">
            Simulation Environment Active
          </strong>
          This workspace dispatches simulated WooCommerce REST API v3 HTTP requests locally in-browser. All payloads conform to the WooCommerce <code className="font-mono text-[#0F172A] bg-white px-1.5 py-0.5 rounded border border-blue-200">/wp-json/wc/v3/products</code> specification. No live store credentials or remote production stores are affected.
        </div>
      </div>

      {/* SECTION 1: Synchronisation Queue (Pending Operations) */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
              Pending Synchronisation Queue ({queueProducts.length})
            </h2>
          </div>

          {selectedProductIds.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={syncSelectedProducts}
              isLoading={isSyncing}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync Selected ({selectedProductIds.length})
            </Button>
          )}
        </div>

        {queueProducts.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] flex flex-col items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-2" />
            <p className="font-semibold text-[#0F172A] text-sm">Queue Clear: All Products Synchronised</p>
            <p className="text-[#64748B] mt-1 max-w-md">
              Any edits to products or newly registered SKUs will automatically queue here until synchronised.
            </p>
          </div>
        ) : (
          <div className="border border-[#E2E8F0] rounded-lg overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 pl-4 pr-2 w-8">#</th>
                  <th className="py-3 px-3 min-w-[120px]">SKU</th>
                  <th className="py-3 px-3 min-w-[200px]">Product Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 min-w-[140px]">Sync State</th>
                  <th className="py-3 px-3 min-w-[180px]">Status Note</th>
                  <th className="py-3 pr-4 pl-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {queueProducts.map((p) => {
                  const isSyncingRow = activeSyncProductIds.includes(p.id);
                  const isSelected = selectedProductIds.includes(p.id);
                  const isError = p.syncStatus === 'sync_error';

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-[#DBEAFE]/30 hover:bg-[#DBEAFE]/50' : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <td className="py-3 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectProduct(p.id)}
                          className="w-4 h-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB] cursor-pointer accent-[#2563EB]"
                        />
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-[#0F172A]">{p.sku}</td>
                      <td className="py-3 px-3 font-semibold text-[#0F172A]">{p.name}</td>
                      <td className="py-3 px-3 text-[#64748B]">{p.category}</td>
                      <td className="py-3 px-3">
                        <SyncStatusBadge
                          status={isSyncingRow ? 'syncing' : p.syncStatus}
                          wooCommerceId={p.wooCommerceId}
                          size="sm"
                        />
                      </td>
                      <td className="py-3 px-3">
                        {isError ? (
                          <span
                            className="text-xs text-rose-700 flex items-center gap-1.5 font-medium truncate max-w-[240px]"
                            title={p.lastSyncError || undefined}
                          >
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                            <span className="truncate">{p.lastSyncError || 'Sync failed'}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-[#64748B]">Awaiting push to remote storefront</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 pl-2 text-right">
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => syncSingleProduct(p.id)}
                          isLoading={isSyncingRow}
                          icon={<RefreshCw className="w-3 h-3" />}
                        >
                          {isError ? 'Retry' : 'Sync Now'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: Audit Log & Synchronisation History */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2563EB]" />
            <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
              Completed Synchronisation History
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] text-xs">
              <button
                onClick={() => setLogFilter('all')}
                className={`px-3 py-1.5 rounded-md transition-all text-xs cursor-pointer ${
                  logFilter === 'all'
                    ? 'bg-white text-[#0F172A] font-semibold shadow-xs border border-[#E2E8F0]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                All ({syncLogs.length})
              </button>
              <button
                onClick={() => setLogFilter('success')}
                className={`px-3 py-1.5 rounded-md transition-all text-xs cursor-pointer ${
                  logFilter === 'success'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs border border-emerald-200'
                    : 'text-[#64748B] hover:text-emerald-700'
                }`}
              >
                Success ({successLogsCount})
              </button>
              <button
                onClick={() => setLogFilter('failed')}
                className={`px-3 py-1.5 rounded-md transition-all text-xs cursor-pointer ${
                  logFilter === 'failed'
                    ? 'bg-rose-50 text-rose-800 font-semibold shadow-xs border border-rose-200'
                    : 'text-[#64748B] hover:text-rose-700'
                }`}
              >
                Failed ({failedLogsCount})
              </button>
            </div>

            {syncLogs.length > 0 && (
              <button
                onClick={onOpenClearLogsConfirm}
                className="p-1.5 text-[#64748B] hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-[#E2E8F0] cursor-pointer"
                title="Clear audit history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
            No audit records matching selected filter.
          </div>
        ) : (
          <div className="border border-[#E2E8F0] rounded-lg overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 pl-4 pr-2">Timestamp</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3 min-w-[200px]">Product(s)</th>
                  <th className="py-3 px-3 min-w-[180px]">Outcome & Explanation</th>
                  <th className="py-3 px-3">Technical HTTP</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 pr-4 pl-2 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredLogs.map((log) => {
                  const isSuccess = log.status === 'success';

                  return (
                    <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 pl-4 pr-2 font-mono text-[#64748B] text-xs whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-[#0F172A] text-xs uppercase">
                        {log.action}
                      </td>
                      <td className="py-3 px-3 text-[#0F172A] font-medium max-w-[240px] truncate" title={log.productNames.join(', ')}>
                        {log.productNames.join(', ')}
                      </td>
                      <td className="py-3 px-3">
                        {isSuccess ? (
                          <span className="text-emerald-700 text-xs font-medium flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Successfully synchronized</span>
                          </span>
                        ) : (
                          <span
                            className="text-rose-700 text-xs font-medium flex items-center gap-1.5 truncate max-w-[240px]"
                            title={log.errorMessage}
                          >
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                            <span className="truncate">{log.errorMessage || 'Operation rejected by endpoint'}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            log.httpStatus >= 200 && log.httpStatus < 300
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : log.httpStatus === 429
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          HTTP {log.httpStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[#64748B] text-xs">
                        {log.durationMs}ms
                      </td>
                      <td className="py-3 pr-4 pl-2 text-right">
                        <button
                          onClick={() => onInspectLog(log)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer"
                          title="Inspect JSON request and response payloads"
                        >
                          <Code className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>JSON</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
