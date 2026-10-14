export type PublicationStatus = 'draft' | 'published' | 'archived';

export type SyncStatus = 'synced' | 'pending_sync' | 'sync_error' | 'syncing';

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  regularPrice?: number;
  salePrice?: number | null;
  stockQuantity: number;
  category: string;
  publicationStatus: PublicationStatus;
  syncStatus: SyncStatus;
  attributes: ProductAttribute[];
  imageUrl?: string;
  wooCommerceId?: number | null;
  lastSyncedAt?: string | null;
  lastSyncError?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompletenessReport {
  score: number; // 0 to 100
  isComplete: boolean;
  missingFields: string[];
  recommendations: string[];
}

export type ProductSortField = 'name' | 'price' | 'stockQuantity' | 'updatedAt' | 'lastSyncedAt' | 'completeness';
export type SortDirection = 'asc' | 'desc';

export interface ProductFilters {
  searchQuery: string;
  category: string;
  publicationStatus: 'all' | PublicationStatus;
  syncStatus: 'all' | SyncStatus;
  completeness: 'all' | 'complete' | 'incomplete';
  sortField: ProductSortField;
  sortDirection: SortDirection;
}
