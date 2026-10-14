import { Product } from '../../types/product';
import { SyncLogEntry, SyncSimulationConfig } from '../../types/sync';

export interface ProductSyncResult {
  success: boolean;
  log: SyncLogEntry;
  updatedProduct: Product;
}

export interface BatchSyncResult {
  results: ProductSyncResult[];
  overallLog: SyncLogEntry;
  successCount: number;
  failureCount: number;
}

export interface ISyncAdapter {
  readonly adapterName: string;
  readonly isDemo: boolean;
  syncProduct(product: Product, config: SyncSimulationConfig): Promise<ProductSyncResult>;
  syncBatch(products: Product[], config: SyncSimulationConfig): Promise<BatchSyncResult>;
}
