import { Product } from '../../types/product';
import { SyncLogEntry, SyncSimulationConfig } from '../../types/sync';
import { INITIAL_PRODUCTS, INITIAL_SYNC_LOGS } from './seedData';

const STORAGE_KEYS = {
  PRODUCTS: 'catalog_sync_pim_products_v1',
  SYNC_LOGS: 'catalog_sync_pim_logs_v1',
  SIMULATION_CONFIG: 'catalog_sync_pim_config_v1',
};

const DEFAULT_CONFIG: SyncSimulationConfig = {
  latencyMs: 700,
  failureRate: 0,
  simulateNetworkError: false,
  mockEndpointUrl: 'https://demo-woocommerce.local/wp-json/wc/v3',
  isDemoSandbox: true,
};

export const localStorageRepo = {
  getProducts(): Product[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
        return INITIAL_PRODUCTS;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse products from localStorage, falling back to seed:', e);
      return INITIAL_PRODUCTS;
    }
  },

  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage:', e);
    }
  },

  getSyncLogs(): SyncLogEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SYNC_LOGS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(INITIAL_SYNC_LOGS));
        return INITIAL_SYNC_LOGS;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse sync logs from localStorage:', e);
      return INITIAL_SYNC_LOGS;
    }
  },

  saveSyncLogs(logs: SyncLogEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save sync logs to localStorage:', e);
    }
  },

  addSyncLog(log: SyncLogEntry): SyncLogEntry[] {
    const existing = this.getSyncLogs();
    const updated = [log, ...existing].slice(0, 50); // Keep latest 50 logs
    this.saveSyncLogs(updated);
    return updated;
  },

  clearSyncLogs(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify([]));
    } catch (e) {
      console.error('Failed to clear sync logs:', e);
    }
  },

  getSimulationConfig(): SyncSimulationConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SIMULATION_CONFIG);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.SIMULATION_CONFIG, JSON.stringify(DEFAULT_CONFIG));
        return DEFAULT_CONFIG;
      }
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_CONFIG;
    }
  },

  saveSimulationConfig(config: SyncSimulationConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SIMULATION_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save simulation config:', e);
    }
  },

  resetToDefaults(): { products: Product[]; logs: SyncLogEntry[] } {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(INITIAL_SYNC_LOGS));
    localStorage.setItem(STORAGE_KEYS.SIMULATION_CONFIG, JSON.stringify(DEFAULT_CONFIG));
    return {
      products: INITIAL_PRODUCTS,
      logs: INITIAL_SYNC_LOGS,
    };
  },

  exportCatalogueJSON(): string {
    const products = this.getProducts();
    const logs = this.getSyncLogs();
    const bundle = {
      app: 'Merchline PIM',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      products,
      logs,
    };
    return JSON.stringify(bundle, null, 2);
  },

  importCatalogueJSON(jsonString: string): Product[] {
    const parsed = JSON.parse(jsonString);
    if (parsed && Array.isArray(parsed.products)) {
      this.saveProducts(parsed.products);
      if (Array.isArray(parsed.logs)) {
        this.saveSyncLogs(parsed.logs);
      }
      return parsed.products;
    }
    throw new Error('Invalid JSON format: missing products array.');
  },
};
