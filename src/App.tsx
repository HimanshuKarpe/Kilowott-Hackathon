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
import { AttributesView } from './components/attributes/AttributesView';
import { ProductModal } from './components/product-modal/ProductModal';
import { SyncCentreView } from './components/sync/SyncCentreView';
import { PayloadInspectModal } from './components/sync/PayloadInspectModal';
import { SimulationConfigModal } from './components/sync/SimulationConfigModal';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { Modal } from './components/common/Modal';
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
    setFilters,
  } = useCatalog();

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isSimulationSettingsOpen, setIsSimulationSettingsOpen] = useState(false);
  const [logToInspect, setLogToInspect] = useState<SyncLogEntry | null>(null);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

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

  const handleNavigateToProductsWithFilter = (query: string) => {
    setFilters({ searchQuery: query });
    setActiveTab('catalogue');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Slim WooCommerce Simulator Status Bar */}
      <DemoBanner onOpenSettings={() => setIsSimulationSettingsOpen(true)} />

      {/* Main Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddModal={handleOpenAdd}
        onOpenResetConfirm={() => setIsResetConfirmOpen(true)}
        onOpenDocs={() => setIsDocsModalOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* WORKSPACE 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={setActiveTab}
            onOpenSettings={() => setIsSimulationSettingsOpen(true)}
            onInspectLog={(log) => setLogToInspect(log)}
            onEditProduct={handleOpenEdit}
          />
        )}

        {/* WORKSPACE 2: PRODUCTS CATALOGUE */}
        {activeTab === 'catalogue' && (
          <div className="space-y-4">
            {/* Filter Toolbar */}
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

        {/* WORKSPACE 3: ATTRIBUTES OVERVIEW */}
        {activeTab === 'attributes' && (
          <AttributesView
            onEditProduct={handleOpenEdit}
            onNavigateToProductsWithFilter={handleNavigateToProductsWithFilter}
          />
        )}

        {/* WORKSPACE 4: SYNCHRONISATION */}
        {activeTab === 'sync' && (
          <SyncCentreView
            onOpenSettings={() => setIsSimulationSettingsOpen(true)}
            onInspectLog={(log) => setLogToInspect(log)}
            onOpenClearLogsConfirm={() => setIsClearLogsConfirmOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white py-4 mt-12 text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-[#0F172A]">Merchline · Product Information Management</span>
          <span className="font-mono text-[11px] text-[#64748B]">
            One catalogue. Every channel. • TypeScript • Vitest • LocalStorage Persistence
          </span>
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

      {/* Secondary Utility: Documentation & Architecture Modal */}
      <Modal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
        title="Merchline Documentation & Architecture"
        subtitle="System blueprint, layered structure, and WooCommerce REST API v3 mapping"
        maxWidth="4xl"
      >
        <DocsView />
      </Modal>

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
