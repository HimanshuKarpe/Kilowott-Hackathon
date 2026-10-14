import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { CatalogProvider, useCatalog } from './context/CatalogContext';
import { Header, NavigationTab } from './components/layout/Header';
import { DemoBanner } from './components/layout/DemoBanner';
import { DashboardView } from './components/dashboard/DashboardView';
import { FilterToolbar } from './components/catalogue/FilterToolbar';
import { BatchActionToolbar } from './components/catalogue/BatchActionToolbar';
import { ProductTable } from './components/catalogue/ProductTable';
import { ProductGrid } from './components/catalogue/ProductGrid';
import { EmptyState } from './components/catalogue/EmptyState';
import { ProductModal } from './components/product-modal/ProductModal';
import { SyncCentreView } from './components/sync/SyncCentreView';
import { PayloadInspectModal } from './components/sync/PayloadInspectModal';
import { SimulationConfigModal } from './components/sync/SimulationConfigModal';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { DocsView } from './components/docs/DocsView';
import { Product } from './types/product';
import { SyncLogEntry } from './types/sync';

const MainLayout: React.FC = () => {
  const {
    filteredProducts,
    deleteProduct,
    batchDeleteProducts,
    selectedProductIds,
    resetAllDataToDefaults,
    clearSyncLogs,
    resetFilters,
  } = useCatalog();

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isSimulationSettingsOpen, setIsSimulationSettingsOpen] = useState(false);
  const [logToInspect, setLogToInspect] = useState<SyncLogEntry | null>(null);

  // Confirm Dialog States
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isBatchDeleteConfirmOpen, setIsBatchDeleteConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearLogsConfirmOpen, setIsClearLogsConfirmOpen] = useState(false);

  // Handlers
  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setProductToEdit(p);
    setIsProductModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
      {/* Demo Sandbox Top Indicator Banner */}
      <DemoBanner onOpenSettings={() => setIsSimulationSettingsOpen(true)} />

      {/* Main Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddModal={handleOpenAdd}
        onOpenResetConfirm={() => setIsResetConfirmOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={setActiveTab}
            onOpenSettings={() => setIsSimulationSettingsOpen(true)}
            onInspectLog={(log) => setLogToInspect(log)}
          />
        )}

        {/* TAB 2: PRODUCT CATALOGUE */}
        {activeTab === 'catalogue' && (
          <div className="space-y-6 animate-slideIn">
            {/* Filter & Search Toolbar */}
            <FilterToolbar viewMode={viewMode} onToggleViewMode={setViewMode} />

            {/* Batch Selection Action Floating Bar */}
            <BatchActionToolbar
              onOpenBatchDeleteConfirm={() => setIsBatchDeleteConfirmOpen(true)}
            />

            {/* Catalogue Content or Empty State */}
            {filteredProducts.length === 0 ? (
              <EmptyState
                onResetFilters={resetFilters}
                onAddProduct={handleOpenAdd}
              />
            ) : viewMode === 'table' ? (
              <ProductTable
                products={filteredProducts}
                onEditProduct={handleOpenEdit}
                onDeleteProduct={(p) => setDeleteTarget(p)}
              />
            ) : (
              <ProductGrid
                products={filteredProducts}
                onEditProduct={handleOpenEdit}
                onDeleteProduct={(p) => setDeleteTarget(p)}
              />
            )}
          </div>
        )}

        {/* TAB 3: SYNC CENTRE */}
        {activeTab === 'sync' && (
          <SyncCentreView
            onOpenSettings={() => setIsSimulationSettingsOpen(true)}
            onInspectLog={(log) => setLogToInspect(log)}
            onOpenClearLogsConfirm={() => setIsClearLogsConfirmOpen(true)}
          />
        )}

        {/* TAB 4: ARCHITECTURE & DOCS */}
        {activeTab === 'docs' && <DocsView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-surface-950/40 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CatalogSync PIM • Built for WooCommerce Integration</span>
          <span className="font-mono text-[11px]">Strict TypeScript • Vitest Verified • Responsive Tailwind</span>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />

      <SimulationConfigModal
        isOpen={isSimulationSettingsOpen}
        onClose={() => setIsSimulationSettingsOpen(false)}
      />

      <PayloadInspectModal
        isOpen={Boolean(logToInspect)}
        onClose={() => setLogToInspect(null)}
        log={logToInspect}
      />

      {/* Confirm Single Delete */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteProduct(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}" (${deleteTarget?.sku})? This action cannot be undone.`}
        confirmLabel="Delete Product"
        variant="danger"
      />

      {/* Confirm Batch Delete */}
      <ConfirmDialog
        isOpen={isBatchDeleteConfirmOpen}
        onClose={() => setIsBatchDeleteConfirmOpen(false)}
        onConfirm={() => {
          batchDeleteProducts(selectedProductIds);
          setIsBatchDeleteConfirmOpen(false);
        }}
        title="Batch Delete Products"
        message={`Are you sure you want to permanently delete all ${selectedProductIds.length} selected products?`}
        confirmLabel="Delete Selected"
        variant="danger"
      />

      {/* Confirm Reset Data */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          resetAllDataToDefaults();
          setIsResetConfirmOpen(false);
        }}
        title="Reset Demo Data"
        message="This will reset all products, dynamic attributes, and sync audit logs back to the default demo state. Any custom items you created will be replaced."
        confirmLabel="Reset Everything"
        variant="danger"
      />

      {/* Confirm Clear Logs */}
      <ConfirmDialog
        isOpen={isClearLogsConfirmOpen}
        onClose={() => setIsClearLogsConfirmOpen(false)}
        onConfirm={() => {
          clearSyncLogs();
          setIsClearLogsConfirmOpen(false);
        }}
        title="Clear Sync History"
        message="Are you sure you want to clear all sync audit history logs? Past request/response inspection records will be cleared."
        confirmLabel="Clear Logs"
        variant="danger"
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <CatalogProvider>
        <MainLayout />
      </CatalogProvider>
    </ToastProvider>
  );
}
