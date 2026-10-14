import { describe, it, expect } from 'vitest';
import { productToWooCommercePayload, mockWooCommerceAdapter } from '../adapters/sync/mockWooCommerceAdapter';
import { Product } from '../types/product';
import { SyncSimulationConfig } from '../types/sync';

const mockProduct: Product = {
  id: 'prod-test-1',
  sku: 'TEST-SKU-100',
  name: 'Ergonomic Desk Mat',
  description: 'Waterproof felt desk mat with stitched edges',
  price: 29.99,
  regularPrice: 35.0,
  salePrice: 29.99,
  stockQuantity: 50,
  category: 'Workspace',
  publicationStatus: 'published',
  syncStatus: 'pending_sync',
  imageUrl: 'https://example.com/mat.jpg',
  attributes: [
    { id: '1', name: 'Color', value: 'Dark Gray' },
    { id: '2', name: 'Dimensions', value: '900x400mm' },
  ],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const baseConfig: SyncSimulationConfig = {
  latencyMs: 10,
  failureRate: 0,
  simulateNetworkError: false,
  mockEndpointUrl: 'https://demo-woocommerce.local/wp-json/wc/v3',
  isDemoSandbox: true,
};

describe('WooCommerce Payload Transformer', () => {
  it('correctly maps internal Product to WooCommerce REST API v3 schema', () => {
    const payload = productToWooCommercePayload(mockProduct);

    expect(payload.name).toBe('Ergonomic Desk Mat');
    expect(payload.sku).toBe('TEST-SKU-100');
    expect(payload.regular_price).toBe('35.00');
    expect(payload.sale_price).toBe('29.99');
    expect(payload.status).toBe('publish');
    expect(payload.manage_stock).toBe(true);
    expect(payload.stock_quantity).toBe(50);
    expect(payload.categories).toEqual([{ name: 'Workspace' }]);
    expect(payload.images).toEqual([{ src: 'https://example.com/mat.jpg', alt: 'Ergonomic Desk Mat' }]);
    expect(payload.attributes).toEqual([
      { name: 'Color', visible: true, options: ['Dark Gray'] },
      { name: 'Dimensions', visible: true, options: ['900x400mm'] },
    ]);
  });
});

describe('MockWooCommerceAdapter', () => {
  it('successfully syncs a product, generates a remote ID, and creates an audit log', async () => {
    const res = await mockWooCommerceAdapter.syncProduct(mockProduct, baseConfig);

    expect(res.success).toBe(true);
    expect(res.updatedProduct.syncStatus).toBe('synced');
    expect(res.updatedProduct.wooCommerceId).toBeGreaterThan(0);
    expect(res.updatedProduct.lastSyncedAt).toBeDefined();

    expect(res.log.status).toBe('success');
    expect(res.log.httpStatus).toBe(201); // Created
    expect(res.log.endpoint).toBe('/wp-json/wc/v3/products');
  });

  it('handles simulated network errors by marking product with sync_error', async () => {
    const errorConfig: SyncSimulationConfig = {
      ...baseConfig,
      simulateNetworkError: true,
    };

    const res = await mockWooCommerceAdapter.syncProduct(mockProduct, errorConfig);

    expect(res.success).toBe(false);
    expect(res.updatedProduct.syncStatus).toBe('sync_error');
    expect(res.updatedProduct.lastSyncError).toContain('Network Error');
    expect(res.log.status).toBe('failed');
    expect(res.log.httpStatus).toBe(0);
  });

  it('runs batch sync across multiple products', async () => {
    const prod2: Product = {
      ...mockProduct,
      id: 'prod-test-2',
      sku: 'TEST-SKU-200',
      name: 'Second Product',
    };

    const batchRes = await mockWooCommerceAdapter.syncBatch([mockProduct, prod2], baseConfig);

    expect(batchRes.results.length).toBe(2);
    expect(batchRes.successCount).toBe(2);
    expect(batchRes.failureCount).toBe(0);
    expect(batchRes.overallLog.status).toBe('success');
    expect(batchRes.overallLog.action).toBe('batch_sync');
  });
});
