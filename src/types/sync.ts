export type SyncAction = 'create' | 'update' | 'batch_sync';

export type SyncResultStatus = 'success' | 'failed' | 'partial';

export interface WooCommerceProductPayload {
  name: string;
  type: string;
  regular_price: string;
  sale_price?: string;
  description: string;
  short_description?: string;
  sku: string;
  manage_stock: boolean;
  stock_quantity: number;
  status: 'publish' | 'draft' | 'private';
  categories: Array<{ id?: number; name: string }>;
  images?: Array<{ src: string; alt?: string }>;
  attributes?: Array<{
    name: string;
    visible: boolean;
    options: string[];
  }>;
  meta_data?: Array<{ key: string; value: string }>;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  action: SyncAction;
  status: SyncResultStatus;
  productCount: number;
  productIds: string[];
  productNames: string[];
  httpStatus: number;
  durationMs: number;
  endpoint: string;
  requestPayload?: unknown;
  responsePayload?: unknown;
  errorMessage?: string;
}

export interface SyncSimulationConfig {
  latencyMs: number;
  failureRate: number; // 0 to 1
  simulateNetworkError: boolean;
  mockEndpointUrl: string;
  isDemoSandbox: boolean;
}

export interface SyncAdapterResult {
  success: boolean;
  httpStatus: number;
  remoteId?: number;
  data?: unknown;
  error?: string;
  timestamp: string;
  durationMs: number;
}
