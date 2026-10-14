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
  AlertOctagon,
  Clock,
  Layers,
  Code,
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

  return (
    <div className="space-y-8 animate-slideIn">
      {/* Top Banner / Hero */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-surface-900 via-surface-900 to-brand-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-brand-500/20 text-brand-300">
              <RefreshCw className="w-4 h-4 text-brand-400" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              WooCommerce Synchronisation Centre
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Dispatch product catalogue updates, monitor HTTP request payloads, and review live audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
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
              size="md"
              onClick={syncAllPendingProducts}
              isLoading={isSyncing}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Sync All ({queueProducts.length})
            </Button>
          )}
        </div>
      </div>

      {/* Sync Queue Card */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Synchronisation Queue ({queueProducts.length} pending)
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
          <div className="p-8 rounded-xl bg-surface-950/60 border border-slate-800 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">Queue Empty: Catalogue is Up to Date</h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-sm">
              All catalogue items are synchronised with the WooCommerce remote store. Edits or new products will queue here automatically.
            </p>
          </div>
        ) : (
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-surface-950/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-surface-900/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 pl-4 pr-2 w-8">#</th>
                    <th className="py-3 px-3">Product</th>
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 pr-4 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {queueProducts.map((p) => {
                    const isSyncingRow = activeSyncProductIds.includes(p.id);
                    const isSelected = selectedProductIds.includes(p.id);

                    return (
                      <tr key={p.id} className="hover:bg-surface-800/40 transition-colors">
                        <td className="py-3 pl-4 pr-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectProduct(p.id)}
                            className="rounded border-slate-700 text-brand-600 focus:ring-brand-500 bg-surface-950 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-white">{p.name}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">{p.sku}</td>
                        <td className="py-3 px-3 text-slate-400">{p.category}</td>
                        <td className="py-3 px-3">
                          <SyncStatusBadge
                            status={isSyncingRow ? 'syncing' : p.syncStatus}
                            wooCommerceId={p.wooCommerceId}
                            size="sm"
                          />
                        </td>
                        <td className="py-3 pr-4 pl-3 text-right">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => syncSingleProduct(p.id)}
                            isLoading={isSyncingRow}
                            icon={<RefreshCw className="w-3 h-3" />}
                            className="text-xs py-1 px-2.5"
                          >
                            Sync Now
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Sync History & Audit Log */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Audit Trail & Synchronisation History
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Filter Buttons */}
            <div className="flex items-center bg-surface-950/80 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setLogFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  logFilter === 'all' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({syncLogs.length})
              </button>
              <button
                onClick={() => setLogFilter('success')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  logFilter === 'success' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Success
              </button>
              <button
                onClick={() => setLogFilter('failed')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  logFilter === 'failed' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Failed
              </button>
            </div>

            {syncLogs.length > 0 && (
              <button
                onClick={onOpenClearLogsConfirm}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-surface-800 transition-colors"
                title="Clear audit history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No logs matching selected filter.</p>
        ) : (
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-surface-950/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-surface-900/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 pl-4 pr-3">Timestamp</th>
                    <th className="py-3 px-3">Action</th>
                    <th className="py-3 px-3">Products Involved</th>
                    <th className="py-3 px-3">HTTP Status</th>
                    <th className="py-3 px-3">Duration</th>
                    <th className="py-3 px-3">Result</th>
                    <th className="py-3 pr-4 pl-3 text-right">Inspection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLogs.map((log) => {
                    const isSuccess = log.status === 'success';

                    return (
                      <tr key={log.id} className="hover:bg-surface-800/40 transition-colors">
                        <td className="py-3 pl-4 pr-3 font-mono text-slate-400 text-[11px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-3 font-semibold text-white uppercase text-[11px]">
                          {log.action}
                        </td>
                        <td className="py-3 px-3 text-slate-300 max-w-[220px] truncate" title={log.productNames.join(', ')}>
                          {log.productNames.join(', ')}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold">
                          <span
                            className={
                              log.httpStatus >= 200 && log.httpStatus < 300
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }
                          >
                            HTTP {log.httpStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">{log.durationMs}ms</td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              isSuccess
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}
                          >
                            {isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <AlertOctagon className="w-3 h-3" />}
                            <span>{log.status.toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="py-3 pr-4 pl-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onInspectLog(log)}
                            icon={<Code className="w-3 h-3" />}
                            className="text-xs py-1 px-2.5"
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
