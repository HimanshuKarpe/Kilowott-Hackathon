import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Product, ProductFilters, PublicationStatus } from '../types/product';
import { SyncLogEntry, SyncSimulationConfig } from '../types/sync';
import { localStorageRepo } from '../adapters/storage/localStorageRepo';
import { mockWooCommerceAdapter } from '../adapters/sync/mockWooCommerceAdapter';
import { validateProduct, ProductFormData } from '../domain/validation';
import { filterProducts, sortProducts } from '../domain/filterSort';
import { useToast } from './ToastContext';

interface CatalogContextType {
  products: Product[];
  filteredProducts: Product[];
  filters: ProductFilters;
  categories: string[];
  selectedProductIds: string[];
  syncLogs: SyncLogEntry[];
  simulationConfig: SyncSimulationConfig;
  isSyncing: boolean;
  activeSyncProductIds: string[];

  // Filter & Search Controls
  setFilters: (update: Partial<ProductFilters>) => void;
  resetFilters: () => void;

  // Selection Controls
  toggleSelectProduct: (id: string) => void;
  selectAllFiltered: () => void;
  clearSelection: () => void;

  // CRUD Operations
  createProduct: (data: ProductFormData) => Promise<{ success: boolean; product?: Product; errors?: Record<string, string> }>;
  updateProduct: (id: string, data: ProductFormData) => Promise<{ success: boolean; product?: Product; errors?: Record<string, string> }>;
  deleteProduct: (id: string) => void;
  batchDeleteProducts: (ids: string[]) => void;
  batchUpdatePublicationStatus: (ids: string[], status: PublicationStatus) => void;

  // Sync Operations
  syncSingleProduct: (id: string) => Promise<boolean>;
  syncSelectedProducts: () => Promise<void>;
  syncAllPendingProducts: () => Promise<void>;

  // Settings & Management
  updateSimulationConfig: (config: Partial<SyncSimulationConfig>) => void;
  clearSyncLogs: () => void;
  resetAllDataToDefaults: () => void;
  exportCatalogue: () => void;
  importCatalogue: (fileContent: string) => boolean;
}

const defaultFilters: ProductFilters = {
  searchQuery: '',
  category: 'all',
  publicationStatus: 'all',
  syncStatus: 'all',
  completeness: 'all',
  sortField: 'updatedAt',
  sortDirection: 'desc',
};

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>(() => localStorageRepo.getProducts());
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>(() => localStorageRepo.getSyncLogs());
  const [simulationConfig, setSimulationConfig] = useState<SyncSimulationConfig>(() => localStorageRepo.getSimulationConfig());
  const [filters, setFiltersState] = useState<ProductFilters>(defaultFilters);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activeSyncProductIds, setActiveSyncProductIds] = useState<string[]>([]);

  // Keep repository in sync whenever state changes
  useEffect(() => {
    localStorageRepo.saveProducts(products);
  }, [products]);

  useEffect(() => {
    localStorageRepo.saveSyncLogs(syncLogs);
  }, [syncLogs]);

  useEffect(() => {
    localStorageRepo.saveSimulationConfig(simulationConfig);
  }, [simulationConfig]);

  // Derive unique categories from existing products
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [products]);

  // Computed filtered and sorted products
  const filteredProducts = useMemo(() => {
    const filtered = filterProducts(products, filters);
    return sortProducts(filtered, filters.sortField, filters.sortDirection);
  }, [products, filters]);

  // Filter setters
  const setFilters = useCallback((update: Partial<ProductFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...update }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  // Selection handlers
  const toggleSelectProduct = useCallback((id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  }, []);

  const selectAllFiltered = useCallback(() => {
    const allFilteredIds = filteredProducts.map((p) => p.id);
    setSelectedProductIds(allFilteredIds);
  }, [filteredProducts]);

  const clearSelection = useCallback(() => {
    setSelectedProductIds([]);
  }, []);

  // CRUD Operations
  const createProduct = useCallback(
    async (data: ProductFormData) => {
      const validation = validateProduct(data, products);
      if (!validation.isValid) {
        toast.error('Validation Error', 'Please correct the highlighted fields before saving.');
        return { success: false, errors: validation.errors as Record<string, string> };
      }

      const now = new Date().toISOString();
      const newProduct: Product = {
        id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: data.name.trim(),
        sku: data.sku.trim().toUpperCase(),
        description: data.description.trim(),
        price: Number(data.price),
        regularPrice: data.regularPrice ? Number(data.regularPrice) : Number(data.price),
        salePrice: data.salePrice !== undefined && data.salePrice !== null && data.salePrice !== '' ? Number(data.salePrice) : null,
        stockQuantity: Number(data.stockQuantity),
        category: data.category.trim(),
        publicationStatus: data.publicationStatus,
        syncStatus: 'pending_sync', // New products need to be synced
        attributes: data.attributes.filter((a) => a.name.trim() && a.value.trim()),
        imageUrl: data.imageUrl?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      };

      setProducts((prev) => [newProduct, ...prev]);
      toast.success('Product Created', `"${newProduct.name}" added to catalogue as pending sync.`);
      return { success: true, product: newProduct };
    },
    [products, toast]
  );

  const updateProduct = useCallback(
    async (id: string, data: ProductFormData) => {
      const validation = validateProduct(data, products, id);
      if (!validation.isValid) {
        toast.error('Validation Error', 'Please correct the highlighted fields before updating.');
        return { success: false, errors: validation.errors as Record<string, string> };
      }

      const now = new Date().toISOString();
      let updated: Product | undefined;

      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;

          updated = {
            ...p,
            name: data.name.trim(),
            sku: data.sku.trim().toUpperCase(),
            description: data.description.trim(),
            price: Number(data.price),
            regularPrice: data.regularPrice ? Number(data.regularPrice) : Number(data.price),
            salePrice: data.salePrice !== undefined && data.salePrice !== null && data.salePrice !== '' ? Number(data.salePrice) : null,
            stockQuantity: Number(data.stockQuantity),
            category: data.category.trim(),
            publicationStatus: data.publicationStatus,
            syncStatus: 'pending_sync', // Mark modified product as pending sync
            attributes: data.attributes.filter((a) => a.name.trim() && a.value.trim()),
            imageUrl: data.imageUrl?.trim() || undefined,
            updatedAt: now,
          };
          return updated;
        })
      );

      toast.success('Product Updated', `Saved changes for "${data.name}". Marked for sync.`);
      return { success: true, product: updated };
    },
    [products, toast]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      const target = products.find((p) => p.id === id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSelectedProductIds((prev) => prev.filter((pId) => pId !== id));
      toast.info('Product Deleted', target ? `"${target.name}" removed from catalogue.` : 'Product removed.');
    },
    [products, toast]
  );

  const batchDeleteProducts = useCallback(
    (ids: string[]) => {
      setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
      setSelectedProductIds((prev) => prev.filter((pId) => !ids.includes(pId)));
      toast.info('Batch Deleted', `Removed ${ids.length} products from the catalogue.`);
    },
    [toast]
  );

  const batchUpdatePublicationStatus = useCallback(
    (ids: string[], status: PublicationStatus) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (ids.includes(p.id)) {
            return {
              ...p,
              publicationStatus: status,
              syncStatus: 'pending_sync',
              updatedAt: new Date().toISOString(),
            };
          }
          return p;
        })
      );
      toast.success('Status Updated', `Updated publication status to "${status}" for ${ids.length} products.`);
    },
    [toast]
  );

  // Sync Operations
  const syncSingleProduct = useCallback(
    async (id: string): Promise<boolean> => {
      const product = products.find((p) => p.id === id);
      if (!product) return false;

      setActiveSyncProductIds((prev) => [...prev, id]);

      // Set product temporary status to syncing
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, syncStatus: 'syncing' } : p))
      );

      try {
        const result = await mockWooCommerceAdapter.syncProduct(product, simulationConfig);

        setProducts((prev) =>
          prev.map((p) => (p.id === id ? result.updatedProduct : p))
        );

        setSyncLogs((prev) => [result.log, ...prev].slice(0, 50));

        if (result.success) {
          toast.success(
            'Sync Successful',
            `Synced "${product.name}" with WooCommerce (Remote ID: ${result.updatedProduct.wooCommerceId}).`
          );
        } else {
          toast.error(
            'Sync Failed',
            result.log.errorMessage || 'Failed to synchronise product with WooCommerce.'
          );
        }

        return result.success;
      } finally {
        setActiveSyncProductIds((prev) => prev.filter((pId) => pId !== id));
      }
    },
    [products, simulationConfig, toast]
  );

  const syncSelectedProducts = useCallback(async () => {
    if (selectedProductIds.length === 0) {
      toast.warning('No Products Selected', 'Select at least one product to run batch synchronisation.');
      return;
    }

    const targets = products.filter((p) => selectedProductIds.includes(p.id));
    setIsSyncing(true);
    setActiveSyncProductIds(selectedProductIds);

    // Set all to syncing
    setProducts((prev) =>
      prev.map((p) => (selectedProductIds.includes(p.id) ? { ...p, syncStatus: 'syncing' } : p))
    );

    try {
      const batchResult = await mockWooCommerceAdapter.syncBatch(targets, simulationConfig);

      // Map updated products
      const resultMap = new Map(batchResult.results.map((r) => [r.updatedProduct.id, r.updatedProduct]));
      setProducts((prev) => prev.map((p) => resultMap.get(p.id) || p));

      // Append overall log and individual logs
      setSyncLogs((prev) => [batchResult.overallLog, ...prev].slice(0, 50));

      if (batchResult.failureCount === 0) {
        toast.success(
          'Batch Sync Complete',
          `Successfully synchronised all ${batchResult.successCount} selected products with WooCommerce.`
        );
      } else if (batchResult.successCount > 0) {
        toast.warning(
          'Batch Sync Finished with Errors',
          `Synced ${batchResult.successCount} products, but ${batchResult.failureCount} failed.`
        );
      } else {
        toast.error(
          'Batch Sync Failed',
          `All ${batchResult.failureCount} products failed to sync. Review the Sync History for details.`
        );
      }
    } finally {
      setIsSyncing(false);
      setActiveSyncProductIds([]);
    }
  }, [products, selectedProductIds, simulationConfig, toast]);

  const syncAllPendingProducts = useCallback(async () => {
    const pendingProducts = products.filter(
      (p) => p.syncStatus === 'pending_sync' || p.syncStatus === 'sync_error'
    );

    if (pendingProducts.length === 0) {
      toast.info('Catalogue in Sync', 'There are no pending or error products requiring synchronisation.');
      return;
    }

    const pendingIds = pendingProducts.map((p) => p.id);
    setIsSyncing(true);
    setActiveSyncProductIds(pendingIds);

    setProducts((prev) =>
      prev.map((p) => (pendingIds.includes(p.id) ? { ...p, syncStatus: 'syncing' } : p))
    );

    try {
      const batchResult = await mockWooCommerceAdapter.syncBatch(pendingProducts, simulationConfig);

      const resultMap = new Map(batchResult.results.map((r) => [r.updatedProduct.id, r.updatedProduct]));
      setProducts((prev) => prev.map((p) => resultMap.get(p.id) || p));

      setSyncLogs((prev) => [batchResult.overallLog, ...prev].slice(0, 50));

      if (batchResult.failureCount === 0) {
        toast.success(
          'All Products Synchronised',
          `Synchronised ${batchResult.successCount} pending product(s) with WooCommerce.`
        );
      } else {
        toast.warning(
          'Synchronisation Incomplete',
          `Synced ${batchResult.successCount} products, with ${batchResult.failureCount} errors.`
        );
      }
    } finally {
      setIsSyncing(false);
      setActiveSyncProductIds([]);
    }
  }, [products, simulationConfig, toast]);

  // Settings & Storage management
  const updateSimulationConfig = useCallback(
    (configUpdate: Partial<SyncSimulationConfig>) => {
      setSimulationConfig((prev) => ({ ...prev, ...configUpdate }));
      toast.success('Simulation Settings Updated', 'Changes applied to the demo WooCommerce adapter.');
    },
    [toast]
  );

  const clearSyncLogs = useCallback(() => {
    localStorageRepo.clearSyncLogs();
    setSyncLogs([]);
    toast.info('Audit Logs Cleared', 'Sync history has been reset.');
  }, [toast]);

  const resetAllDataToDefaults = useCallback(() => {
    const res = localStorageRepo.resetToDefaults();
    setProducts(res.products);
    setSyncLogs(res.logs);
    setSelectedProductIds([]);
    resetFilters();
    toast.success('Data Reset', 'Demo catalogue and sync history reset to original sample state.');
  }, [resetFilters, toast]);

  const exportCatalogue = useCallback(() => {
    const json = localStorageRepo.exportCatalogueJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merchline-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export Ready', 'Catalogue data exported as JSON file.');
  }, [toast]);

  const importCatalogue = useCallback(
    (json: string): boolean => {
      try {
        const imported = localStorageRepo.importCatalogueJSON(json);
        setProducts(imported);
        setSyncLogs(localStorageRepo.getSyncLogs());
        setSelectedProductIds([]);
        toast.success('Import Successful', `Loaded ${imported.length} products from imported file.`);
        return true;
      } catch (e) {
        toast.error('Import Failed', (e as Error).message || 'Invalid catalogue JSON format.');
        return false;
      }
    },
    [toast]
  );

  return (
    <CatalogContext.Provider
      value={{
        products,
        filteredProducts,
        filters,
        categories,
        selectedProductIds,
        syncLogs,
        simulationConfig,
        isSyncing,
        activeSyncProductIds,
        setFilters,
        resetFilters,
        toggleSelectProduct,
        selectAllFiltered,
        clearSelection,
        createProduct,
        updateProduct,
        deleteProduct,
        batchDeleteProducts,
        batchUpdatePublicationStatus,
        syncSingleProduct,
        syncSelectedProducts,
        syncAllPendingProducts,
        updateSimulationConfig,
        clearSyncLogs,
        resetAllDataToDefaults,
        exportCatalogue,
        importCatalogue,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export function useCatalog(): CatalogContextType {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}
