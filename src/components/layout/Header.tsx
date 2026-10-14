import React, { useMemo } from 'react';
import {
  RefreshCw,
  Plus,
  RotateCcw,
  LayoutDashboard,
  Package,
  Tags,
  BookOpen,
} from 'lucide-react';
import { Button } from '../common/Button';
import { MerchlineLogo } from '../common/MerchlineLogo';
import { useCatalog } from '../../context/CatalogContext';

export type NavigationTab = 'dashboard' | 'catalogue' | 'attributes' | 'sync';

interface HeaderProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAddModal: () => void;
  onOpenResetConfirm: () => void;
  onOpenDocs: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  onOpenResetConfirm,
  onOpenDocs,
}) => {
  const { products, syncAllPendingProducts, isSyncing } = useCatalog();

  const pendingCount = products.filter(
    (p) => p.syncStatus === 'pending_sync' || p.syncStatus === 'sync_error'
  ).length;

  // Unique attribute keys count
  const attributeKeysCount = useMemo(() => {
    const keys = new Set<string>();
    products.forEach((p) => {
      p.attributes?.forEach((a) => {
        if (a.name?.trim()) keys.add(a.name.trim().toLowerCase());
      });
    });
    return keys.size;
  }, [products]);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Official Merchline Brand Logo & Wordmark */}
          <div className="flex items-center gap-6">
            <div
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => onSelectTab('dashboard')}
              title="Merchline PIM — One catalogue. Every channel."
            >
              <MerchlineLogo size="md" color="#2563EB" withBadge={true} />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-[#0F172A] leading-none">
                    Merchline
                  </span>
                  <span className="text-[10px] font-mono font-semibold uppercase text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    PIM
                  </span>
                </div>
                <span className="text-[11px] text-[#64748B] mt-0.5 hidden sm:block font-normal">
                  One catalogue. Every channel.
                </span>
              </div>
            </div>

            {/* Centre: Main Navigation Segmented Control */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-[#E2E8F0]">
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-2xs'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50 font-medium'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => onSelectTab('catalogue')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                  activeTab === 'catalogue'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-2xs'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50 font-medium'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Products</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[11px] font-mono ${
                    activeTab === 'catalogue'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {products.length}
                </span>
              </button>

              <button
                onClick={() => onSelectTab('attributes')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                  activeTab === 'attributes'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-2xs'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50 font-medium'
                }`}
              >
                <Tags className="w-3.5 h-3.5" />
                <span>Attributes</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[11px] font-mono ${
                    activeTab === 'attributes'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {attributeKeysCount}
                </span>
              </button>

              <button
                onClick={() => onSelectTab('sync')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                  activeTab === 'sync'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-2xs'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50 font-medium'
                }`}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    isSyncing ? 'animate-spin text-blue-600' : ''
                  }`}
                />
                <span>Sync Centre</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-mono font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Right: Header Action Tools */}
          <div className="flex items-center gap-2">
            {/* Help & Specs Modal Trigger */}
            <button
              onClick={onOpenDocs}
              className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] px-2.5 py-1.5 rounded-lg hover:bg-slate-100 border border-[#E2E8F0] transition-colors cursor-pointer"
              title="Documentation, System Overview, and WooCommerce Integration Blueprint"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline font-medium">Help & Specs</span>
            </button>

            {/* Reset Data Confirmation Trigger */}
            <button
              onClick={onOpenResetConfirm}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 border border-[#E2E8F0] transition-colors cursor-pointer"
              title="Reset catalogue to default demo seed data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Sync Pending Trigger Button */}
            {pendingCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={syncAllPendingProducts}
                isLoading={isSyncing}
                icon={<RefreshCw className="w-3.5 h-3.5 text-amber-600" />}
                className="hidden sm:inline-flex border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
              >
                Sync Pending ({pendingCount})
              </Button>
            )}

            {/* Primary Action Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenAddModal}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              New Product
            </Button>
          </div>
        </div>

        {/* Medium and Mobile Navigation Bar */}
        <div className="flex lg:hidden items-center justify-between py-2 border-t border-[#E2E8F0] overflow-x-auto gap-1 text-xs">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                : 'text-[#64748B]'
            }`}
          >
            <LayoutDashboard className="w-3 h-3" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => onSelectTab('catalogue')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium cursor-pointer ${
              activeTab === 'catalogue'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                : 'text-[#64748B]'
            }`}
          >
            <Package className="w-3 h-3" />
            <span>Products ({products.length})</span>
          </button>
          <button
            onClick={() => onSelectTab('attributes')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium cursor-pointer ${
              activeTab === 'attributes'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                : 'text-[#64748B]'
            }`}
          >
            <Tags className="w-3 h-3" />
            <span>Attributes ({attributeKeysCount})</span>
          </button>
          <button
            onClick={() => onSelectTab('sync')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium cursor-pointer ${
              activeTab === 'sync'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                : 'text-[#64748B]'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync ({pendingCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
