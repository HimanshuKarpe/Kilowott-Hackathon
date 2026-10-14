import React from 'react';
import { Layers, RefreshCw, Plus, RotateCcw, LayoutDashboard, ShoppingBag, BookOpen } from 'lucide-react';
import { Button } from '../common/Button';
import { useCatalog } from '../../context/CatalogContext';

export type NavigationTab = 'dashboard' | 'catalogue' | 'sync' | 'docs';

interface HeaderProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAddModal: () => void;
  onOpenResetConfirm: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  onOpenResetConfirm,
}) => {
  const { products, syncAllPendingProducts, isSyncing } = useCatalog();

  const pendingCount = products.filter(
    (p) => p.syncStatus === 'pending_sync' || p.syncStatus === 'sync_error'
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-surface-950/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none"
              onClick={() => onSelectTab('dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/20 border border-brand-300/30">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">CatalogSync</span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    PIM
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">WooCommerce Synchronisation</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-surface-900/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => onSelectTab('catalogue')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'catalogue'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Product Catalogue</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
                  {products.length}
                </span>
              </button>

              <button
                onClick={() => onSelectTab('sync')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'sync'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-brand-300' : ''}`} />
                <span>Sync Centre</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectTab('docs')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'docs'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Docs & Specs</span>
              </button>
            </nav>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenResetConfirm}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-surface-800 border border-transparent hover:border-slate-700 text-xs transition-colors"
              title="Reset catalogue & sync logs to default demo data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {pendingCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={syncAllPendingProducts}
                isLoading={isSyncing}
                icon={<RefreshCw className="w-3.5 h-3.5 text-amber-400" />}
                className="hidden sm:inline-flex border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
              >
                Sync Pending ({pendingCount})
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={onOpenAddModal}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Product
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-800/80 overflow-x-auto gap-2 text-xs">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${
              activeTab === 'dashboard' ? 'bg-brand-600 text-white' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-3 h-3" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => onSelectTab('catalogue')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${
              activeTab === 'catalogue' ? 'bg-brand-600 text-white' : 'text-slate-400'
            }`}
          >
            <ShoppingBag className="w-3 h-3" />
            <span>Catalogue ({products.length})</span>
          </button>
          <button
            onClick={() => onSelectTab('sync')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${
              activeTab === 'sync' ? 'bg-brand-600 text-white' : 'text-slate-400'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync ({pendingCount})</span>
          </button>
          <button
            onClick={() => onSelectTab('docs')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${
              activeTab === 'docs' ? 'bg-brand-600 text-white' : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Docs</span>
          </button>
        </div>
      </div>
    </header>
  );
};
