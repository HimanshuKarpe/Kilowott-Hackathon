import React from 'react';
import {
  Package,
  Globe2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Server,
  CheckCircle2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { calculateCompleteness } from '../../domain/completeness';
import { Button } from '../common/Button';
import { NavigationTab } from '../layout/Header';
import { SyncLogEntry } from '../../types/sync';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenSettings: () => void;
  onInspectLog: (log: SyncLogEntry) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenSettings,
  onInspectLog,
}) => {
  const {
    products,
    categories,
    syncLogs,
    simulationConfig,
    setFilters,
    syncAllPendingProducts,
    isSyncing,
  } = useCatalog();

  // Metrics calculations
  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.publicationStatus === 'published').length;
  const draftProducts = products.filter((p) => p.publicationStatus === 'draft').length;
  const publishedPct = totalProducts > 0 ? Math.round((publishedProducts / totalProducts) * 100) : 0;

  const incompleteProductsList = products.filter((p) => !calculateCompleteness(p).isComplete);
  const incompleteCount = incompleteProductsList.length;

  const pendingSyncList = products.filter(
    (p) => p.syncStatus === 'pending_sync' || p.syncStatus === 'sync_error'
  );
  const requiresSyncCount = pendingSyncList.length;

  // Average completeness score across all products
  const avgCompleteness =
    totalProducts > 0
      ? Math.round(
          products.reduce((acc, p) => acc + calculateCompleteness(p).score, 0) / totalProducts
        )
      : 0;

  const highQualityCount = products.filter((p) => calculateCompleteness(p).score >= 80).length;
  const moderateQualityCount = products.filter(
    (p) => calculateCompleteness(p).score >= 50 && calculateCompleteness(p).score < 80
  ).length;
  const lowQualityCount = products.filter((p) => calculateCompleteness(p).score < 50).length;

  return (
    <div className="space-y-8 animate-slideIn">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-surface-900 via-surface-900 to-brand-950/40 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-brand-500/20 text-brand-300">
              <Sparkles className="w-4 h-4 text-brand-400" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              PIM Overview & WooCommerce Sync
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Centralised catalogue master data management with bidirectional WooCommerce REST API v3 simulation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {requiresSyncCount > 0 ? (
            <Button
              variant="primary"
              size="md"
              onClick={syncAllPendingProducts}
              isLoading={isSyncing}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Sync All Pending ({requiresSyncCount})
            </Button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>WooCommerce Store Synchronised</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Products */}
        <div
          onClick={() => {
            setFilters({ completeness: 'all', syncStatus: 'all', publicationStatus: 'all' });
            onNavigate('catalogue');
          }}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Products
            </span>
            <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{totalProducts}</span>
            <span className="text-xs text-slate-400">across {categories.length} categories</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-brand-400 font-medium">
            <span>View Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Published Products */}
        <div
          onClick={() => {
            setFilters({ publicationStatus: 'published', syncStatus: 'all', completeness: 'all' });
            onNavigate('catalogue');
          }}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Published Products
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <Globe2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{publishedProducts}</span>
            <span className="text-xs text-emerald-400 font-medium">({publishedPct}% live)</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>{draftProducts} in draft / review</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-emerald-400" />
          </div>
        </div>

        {/* Card 3: Incomplete Products */}
        <div
          onClick={() => {
            setFilters({ completeness: 'incomplete', syncStatus: 'all', publicationStatus: 'all' });
            onNavigate('catalogue');
          }}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Incomplete Data
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{incompleteCount}</span>
            <span className="text-xs text-amber-400 font-medium">needs enrichment</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-amber-400 font-medium">
            <span>Filter Incomplete</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Requires Synchronisation */}
        <div
          onClick={() => onNavigate('sync')}
          className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Requires Sync
            </span>
            <div
              className={`p-2.5 rounded-xl border group-hover:scale-110 transition-transform ${
                requiresSyncCount > 0
                  ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{requiresSyncCount}</span>
            <span className="text-xs text-slate-400">pending WooCommerce push</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-brand-400 font-medium">
            <span>Open Sync Centre</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Two Column Grid: Data Quality / Completeness & WooCommerce Remote Store Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completeness Health & Distribution (2 Cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Catalogue Completeness & Quality Index
              </h2>
            </div>
            <span className="text-xs font-mono font-medium text-slate-400">
              Avg Score: <strong className="text-white">{avgCompleteness}%</strong>
            </span>
          </div>

          {/* Progress Bar Breakdown */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-surface-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
              <div
                style={{ width: `${(highQualityCount / totalProducts) * 100}%` }}
                className="bg-emerald-500 rounded-l-full transition-all duration-500"
                title={`High Quality (>=80%): ${highQualityCount} products`}
              />
              <div
                style={{ width: `${(moderateQualityCount / totalProducts) * 100}%` }}
                className="bg-amber-500 transition-all duration-500"
                title={`Moderate (50-79%): ${moderateQualityCount} products`}
              />
              <div
                style={{ width: `${(lowQualityCount / totalProducts) * 100}%` }}
                className="bg-rose-500 rounded-r-full transition-all duration-500"
                title={`Needs Work (<50%): ${lowQualityCount} products`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Complete / Ready ({highQualityCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Needs Minor Enrichment ({moderateQualityCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Incomplete ({lowQualityCount})</span>
              </div>
            </div>
          </div>

          {/* Incomplete items preview */}
          {incompleteCount > 0 ? (
            <div className="border border-slate-800/80 rounded-xl p-4 bg-surface-950/40">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Needs Attention Before Synchronisation
                </span>
                <button
                  onClick={() => {
                    setFilters({ completeness: 'incomplete' });
                    onNavigate('catalogue');
                  }}
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium"
                >
                  View All ({incompleteCount})
                </button>
              </div>
              <div className="divide-y divide-slate-800/60">
                {incompleteProductsList.slice(0, 3).map((item) => {
                  const comp = calculateCompleteness(item);
                  return (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                        <p className="text-[11px] text-rose-400/90 truncate">
                          Missing: {comp.missingFields.join(', ')}
                        </p>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 shrink-0">
                        {comp.score}% Complete
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>All products satisfy required PIM completeness parameters!</span>
            </div>
          )}
        </div>

        {/* Remote Store Simulator Status Card (1 Col) */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-brand-400" />
                <h2 className="text-base font-bold text-white tracking-tight">WooCommerce Adapter</h2>
              </div>
              <button
                onClick={onOpenSettings}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Configure Simulator"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-950/60 border border-slate-800">
                <span className="text-slate-400">Adapter Type:</span>
                <span className="text-brand-300 font-semibold">In-Browser Demo REST v3</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-950/60 border border-slate-800">
                <span className="text-slate-400">Simulated Latency:</span>
                <span className="text-slate-200 font-mono">{simulationConfig.latencyMs} ms</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-950/60 border border-slate-800">
                <span className="text-slate-400">Injected Error Rate:</span>
                <span
                  className={`font-mono font-medium ${
                    simulationConfig.failureRate > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {Math.round(simulationConfig.failureRate * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-950/60 border border-slate-800">
                <span className="text-slate-400">Endpoint Target:</span>
                <span className="text-slate-300 font-mono text-[11px] truncate max-w-[150px]">
                  {simulationConfig.mockEndpointUrl}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSettings}
              className="w-full text-xs"
              icon={<Sliders className="w-3.5 h-3.5" />}
            >
              Configure Simulator & Errors
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Sync Audit Stream */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Recent Synchronisation Events</h2>
          </div>
          <button
            onClick={() => onNavigate('sync')}
            className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
          >
            <span>View Full Sync Centre</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {syncLogs.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No sync operations executed yet.</p>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {syncLogs.slice(0, 4).map((log) => {
              const isSuccess = log.status === 'success';
              return (
                <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isSuccess ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white uppercase text-[11px] tracking-wider">
                          {log.action}
                        </span>
                        <span className="text-slate-400 truncate">
                          {log.productNames.join(', ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString()} • {log.durationMs}ms • HTTP{' '}
                        {log.httpStatus}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onInspectLog(log)}
                    className="text-xs text-brand-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                  >
                    Inspect Payload
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
