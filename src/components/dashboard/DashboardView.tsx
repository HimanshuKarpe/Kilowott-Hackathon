import React, { useState, useMemo } from 'react';
import {
  Package,
  Globe2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Edit2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { calculateCompleteness } from '../../domain/completeness';
import { Button } from '../common/Button';
import { NavigationTab } from '../layout/Header';
import { SyncLogEntry } from '../../types/sync';
import { Product } from '../../types/product';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenSettings: () => void;
  onInspectLog: (log: SyncLogEntry) => void;
  onEditProduct: (product: Product) => void;
}

type AttentionFilter = 'all' | 'errors' | 'incomplete' | 'pending';

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onEditProduct,
  onInspectLog,
}) => {
  const {
    products,
    categories,
    syncLogs,
    setFilters,
    syncAllPendingProducts,
    syncSingleProduct,
    isSyncing,
    activeSyncProductIds,
  } = useCatalog();

  const [attentionFilter, setAttentionFilter] = useState<AttentionFilter>('all');

  // 1. Core 4 Metrics Calculations
  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.publicationStatus === 'published').length;
  const draftProducts = products.filter((p) => p.publicationStatus === 'draft').length;
  const publishedPct = totalProducts > 0 ? Math.round((publishedProducts / totalProducts) * 100) : 0;

  const incompleteProductsList = useMemo(() => {
    return products.filter((p) => !calculateCompleteness(p).isComplete);
  }, [products]);
  const incompleteCount = incompleteProductsList.length;

  const errorList = useMemo(() => {
    return products.filter((p) => p.syncStatus === 'sync_error');
  }, [products]);

  const pendingList = useMemo(() => {
    return products.filter((p) => p.syncStatus === 'pending_sync');
  }, [products]);

  const syncIssuesCount = errorList.length + pendingList.length;

  // Catalogue Average Quality Score
  const avgCompleteness = useMemo(() => {
    if (totalProducts === 0) return 0;
    const sum = products.reduce((acc, p) => acc + calculateCompleteness(p).score, 0);
    return Math.round(sum / totalProducts);
  }, [products, totalProducts]);

  const highQualityCount = products.filter((p) => calculateCompleteness(p).score >= 75).length;
  const lowQualityCount = totalProducts - highQualityCount;

  // 2. Products Requiring Attention Unified List (Prioritising Errors first, then Incomplete, then Pending)
  const attentionItems = useMemo(() => {
    const itemsMap = new Map<
      string,
      {
        product: Product;
        hasError: boolean;
        isIncomplete: boolean;
        isPending: boolean;
        completenessScore: number;
        missingFields: string[];
        errorMessage?: string;
      }
    >();

    // 1st priority: Errors
    errorList.forEach((p) => {
      const comp = calculateCompleteness(p);
      itemsMap.set(p.id, {
        product: p,
        hasError: true,
        isIncomplete: !comp.isComplete,
        isPending: false,
        completenessScore: comp.score,
        missingFields: comp.missingFields,
        errorMessage: p.lastSyncError || 'Synchronisation rejected by WooCommerce API',
      });
    });

    // 2nd priority: Incomplete data
    incompleteProductsList.forEach((p) => {
      if (!itemsMap.has(p.id)) {
        const comp = calculateCompleteness(p);
        itemsMap.set(p.id, {
          product: p,
          hasError: false,
          isIncomplete: true,
          isPending: p.syncStatus === 'pending_sync',
          completenessScore: comp.score,
          missingFields: comp.missingFields,
        });
      }
    });

    // 3rd priority: Pending sync
    pendingList.forEach((p) => {
      if (!itemsMap.has(p.id)) {
        const comp = calculateCompleteness(p);
        itemsMap.set(p.id, {
          product: p,
          hasError: false,
          isIncomplete: !comp.isComplete,
          isPending: true,
          completenessScore: comp.score,
          missingFields: comp.missingFields,
        });
      }
    });

    const all = Array.from(itemsMap.values());

    if (attentionFilter === 'errors') return all.filter((i) => i.hasError);
    if (attentionFilter === 'incomplete') return all.filter((i) => i.isIncomplete);
    if (attentionFilter === 'pending') return all.filter((i) => i.isPending);
    return all;
  }, [errorList, incompleteProductsList, pendingList, attentionFilter]);

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Overview of catalogue completeness health and items requiring immediate attention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {syncIssuesCount > 0 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={syncAllPendingProducts}
              isLoading={isSyncing}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync All Pending ({syncIssuesCount})
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>WooCommerce In Sync</span>
            </div>
          )}
        </div>
      </div>

      {/* 4 Meaningful Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Products */}
        <div
          onClick={() => {
            setFilters({ completeness: 'all', syncStatus: 'all', publicationStatus: 'all' });
            onNavigate('catalogue');
          }}
          className="enterprise-card enterprise-card-hover p-5 cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Total Products</span>
            <div className="p-2 rounded-md bg-slate-100 text-slate-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight">{totalProducts}</span>
            <span className="text-xs text-slate-500">master SKUs</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>{categories.length} categories</span>
            <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:underline">
              <span>View Catalogue</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 2: Published Products */}
        <div
          onClick={() => {
            setFilters({ publicationStatus: 'published', syncStatus: 'all', completeness: 'all' });
            onNavigate('catalogue');
          }}
          className="enterprise-card enterprise-card-hover p-5 cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Published Products</span>
            <div className="p-2 rounded-md bg-emerald-50 text-emerald-600">
              <Globe2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight">{publishedProducts}</span>
            <span className="text-xs text-emerald-700 font-medium font-mono">({publishedPct}% live)</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>{draftProducts} draft review</span>
            <span className="text-blue-600 font-semibold flex items-center gap-1">
              <span>Filter Live</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 3: Incomplete Product Data */}
        <div
          onClick={() => {
            setFilters({ completeness: 'incomplete', syncStatus: 'all', publicationStatus: 'all' });
            onNavigate('catalogue');
          }}
          className="enterprise-card enterprise-card-hover p-5 cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Incomplete Data</span>
            <div className="p-2 rounded-md bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight">{incompleteCount}</span>
            <span className="text-xs text-amber-700 font-medium">needs enrichment</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Quality Index: {avgCompleteness}%</span>
            <span className="text-amber-700 font-semibold flex items-center gap-1">
              <span>Review Data</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 4: Sync Issues */}
        <div
          onClick={() => onNavigate('sync')}
          className="enterprise-card enterprise-card-hover p-5 cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Sync Issues</span>
            <div className="p-2 rounded-md bg-blue-50 text-blue-600">
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900 tracking-tight">{syncIssuesCount}</span>
            <span className="text-xs text-slate-500">queue / errors</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className={errorList.length > 0 ? 'text-rose-600 font-medium' : 'text-slate-500'}>
              {errorList.length > 0 ? `${errorList.length} failed` : '0 failures'}
            </span>
            <span className="text-blue-600 font-semibold flex items-center gap-1">
              <span>Sync Centre</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Primary Section: Products Requiring Attention */}
      <div className="enterprise-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Products Requiring Attention
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-semibold border border-slate-200">
                {attentionItems.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Items prioritized by failed WooCommerce updates and incomplete catalogue data.
            </p>
          </div>

          {/* Quick Segment Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setAttentionFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                attentionFilter === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items
            </button>
            {errorList.length > 0 && (
              <button
                onClick={() => setAttentionFilter('errors')}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  attentionFilter === 'errors'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200 font-semibold shadow-xs'
                    : 'text-rose-700 hover:bg-rose-50/50'
                }`}
              >
                <span>Failures ({errorList.length})</span>
              </button>
            )}
            <button
              onClick={() => setAttentionFilter('incomplete')}
              className={`px-3 py-1 rounded-md transition-colors ${
                attentionFilter === 'incomplete'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Incomplete ({incompleteCount})
            </button>
            <button
              onClick={() => setAttentionFilter('pending')}
              className={`px-3 py-1 rounded-md transition-colors ${
                attentionFilter === 'pending'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({pendingList.length})
            </button>
          </div>
        </div>

        {/* Attention List Table or Empty State */}
        {attentionItems.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center bg-slate-50/60 rounded-lg border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">All Catalogue Items Healthy & In Sync</h3>
            <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
              Every product meets required PIM data standards and is fully synchronized with WooCommerce. Newly added products or edits will queue here automatically.
            </p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="enterprise-table-header text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 min-w-[120px]">SKU</th>
                  <th className="py-3 px-4 min-w-[200px]">Product</th>
                  <th className="py-3 px-4">Attention Reason</th>
                  <th className="py-3 px-4 min-w-[120px]">Data Quality</th>
                  <th className="py-3 pr-4 pl-2 text-right min-w-[180px]">Direct Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attentionItems.map((item) => {
                  const isSyncingRow = activeSyncProductIds.includes(item.product.id);

                  return (
                    <tr key={item.product.id} className="enterprise-table-row">
                      {/* SKU */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                          {item.product.sku}
                        </span>
                      </td>

                      {/* Product Name & Category */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block text-xs truncate max-w-[220px]">
                          {item.product.name}
                        </span>
                        <span className="text-[11px] text-slate-500">{item.product.category}</span>
                      </td>

                      {/* Reason Description */}
                      <td className="py-3 px-4">
                        {item.hasError ? (
                          <div className="flex items-center gap-1.5 text-rose-700 font-medium">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                            <span className="truncate max-w-[240px]" title={item.errorMessage}>
                              {item.errorMessage}
                            </span>
                          </div>
                        ) : item.isIncomplete ? (
                          <div className="flex items-center gap-1.5 text-amber-800">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                            <span>
                              Missing:{' '}
                              <strong className="font-medium text-slate-700">
                                {item.missingFields.slice(0, 2).join(', ')}
                              </strong>
                              {item.missingFields.length > 2 && '...'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Pending push to WooCommerce</span>
                          </div>
                        )}
                      </td>

                      {/* Data Quality Score Bar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                item.completenessScore >= 75
                                  ? 'bg-emerald-500'
                                  : item.completenessScore >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${item.completenessScore}%` }}
                            />
                          </div>
                          <span className="font-mono font-semibold text-slate-700 text-xs">
                            {item.completenessScore}%
                          </span>
                        </div>
                      </td>

                      {/* Direct Actions: Edit Product & Retry Sync */}
                      <td className="py-3 pr-4 pl-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEditProduct(item.product)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                            title="Edit product fields"
                          >
                            <Edit2 className="w-3 h-3 text-slate-500" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => syncSingleProduct(item.product.id)}
                            disabled={isSyncingRow}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 shadow-2xs"
                            title="Retry sync to WooCommerce"
                          >
                            <RefreshCw className={`w-3 h-3 ${isSyncingRow ? 'animate-spin' : ''}`} />
                            <span>{item.hasError ? 'Retry Sync' : 'Sync Now'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Catalogue Quality Overview Strip */}
      <div className="enterprise-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Catalogue Data Quality Index</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated dynamically from title, SKU, price, stock, category, description, image, and dynamic attributes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-slate-900">{avgCompleteness}%</span>
              <span className="text-xs text-slate-500 block">Average Quality</span>
            </div>
            <div className="w-36 h-3 bg-slate-200 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(highQualityCount / (totalProducts || 1)) * 100}%` }}
                className="bg-emerald-500"
                title={`${highQualityCount} Complete Items`}
              />
              <div
                style={{ width: `${(lowQualityCount / (totalProducts || 1)) * 100}%` }}
                className="bg-amber-500"
                title={`${lowQualityCount} Incomplete Items`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Synchronisation Activity Summary */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Recent Synchronisation Activity
            </h3>
          </div>
          <button
            onClick={() => onNavigate('sync')}
            className="text-xs text-[#2563EB] hover:text-[#1E40AF] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Open Sync Centre</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {syncLogs.length === 0 ? (
          <p className="text-xs text-[#64748B] py-3">No synchronisation activity recorded yet.</p>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {syncLogs.slice(0, 3).map((log) => {
              const isSuccess = log.status === 'success';
              return (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isSuccess ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#0F172A] uppercase text-[11px] font-mono">
                          {log.action}
                        </span>
                        <span className="text-[#0F172A] truncate max-w-[300px] font-medium">
                          {log.productNames.join(', ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] font-mono mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString()} • {log.durationMs}ms • HTTP {log.httpStatus}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onInspectLog(log)}
                    className="text-xs text-[#0F172A] hover:bg-[#F8FAFC] px-2.5 py-1 rounded-md border border-[#E2E8F0] shadow-2xs transition-colors shrink-0 font-medium cursor-pointer"
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
