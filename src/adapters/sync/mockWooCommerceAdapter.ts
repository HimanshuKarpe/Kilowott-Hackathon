import { Product } from '../../types/product';
import { SyncLogEntry, SyncSimulationConfig, WooCommerceProductPayload } from '../../types/sync';
import { ISyncAdapter, ProductSyncResult, BatchSyncResult } from './syncAdapter.interface';

/**
 * Transforms an internal CatalogSync Product into standard WooCommerce REST API v3 format.
 * Ref: https://woocommerce.github.io/woocommerce-rest-api-docs/#create-a-product
 */
export function productToWooCommercePayload(product: Product): WooCommerceProductPayload {
  const regularPrice = product.regularPrice ?? product.price;
  const salePrice = product.salePrice ? String(product.salePrice) : undefined;

  let wooStatus: 'publish' | 'draft' | 'private' = 'draft';
  if (product.publicationStatus === 'published') {
    wooStatus = 'publish';
  } else if (product.publicationStatus === 'archived') {
    wooStatus = 'private';
  }

  const payload: WooCommerceProductPayload = {
    name: product.name,
    type: 'simple',
    regular_price: regularPrice.toFixed(2),
    description: product.description || '',
    short_description: product.description ? product.description.slice(0, 100) + '...' : '',
    sku: product.sku.trim().toUpperCase(),
    manage_stock: true,
    stock_quantity: product.stockQuantity,
    status: wooStatus,
    categories: [
      {
        name: product.category,
      },
    ],
    attributes: (product.attributes || []).map((attr) => ({
      name: attr.name,
      visible: true,
      options: [attr.value],
    })),
  };

  if (salePrice) {
    payload.sale_price = salePrice;
  }

  if (product.imageUrl) {
    payload.images = [
      {
        src: product.imageUrl,
        alt: product.name,
      },
    ];
  }

  return payload;
}

/**
 * Demo Adapter simulating WooCommerce REST API v3 interactions.
 * Clearly marked as a sandbox simulation.
 */
export class MockWooCommerceAdapter implements ISyncAdapter {
  readonly adapterName = 'WooCommerce REST API v3 Demo Simulator';
  readonly isDemo = true;

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async syncProduct(product: Product, config: SyncSimulationConfig): Promise<ProductSyncResult> {
    const startTime = performance.now();
    const isUpdate = Boolean(product.wooCommerceId);
    const endpoint = isUpdate
      ? `/wp-json/wc/v3/products/${product.wooCommerceId}`
      : `/wp-json/wc/v3/products`;

    const requestPayload = productToWooCommercePayload(product);

    // Simulate realistic network latency
    const simulatedLatency = Math.max(100, config.latencyMs + Math.floor(Math.random() * 200 - 100));
    await this.sleep(simulatedLatency);

    const durationMs = Math.round(performance.now() - startTime);
    const timestamp = new Date().toISOString();

    // 1. Simulate Network or Offline error if requested
    if (config.simulateNetworkError) {
      const log: SyncLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
        action: isUpdate ? 'update' : 'create',
        status: 'failed',
        productCount: 1,
        productIds: [product.id],
        productNames: [product.name],
        httpStatus: 0,
        durationMs,
        endpoint,
        requestPayload,
        errorMessage: 'Network Error: Failed to reach WooCommerce remote host (ECONNREFUSED / timeout).',
      };

      const updatedProduct: Product = {
        ...product,
        syncStatus: 'sync_error',
        lastSyncError: log.errorMessage,
        updatedAt: timestamp,
      };

      return { success: false, log, updatedProduct };
    }

    // 2. Validate payload for realistic simulation errors
    if (!product.name || !product.sku || !product.category) {
      const log: SyncLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
        action: isUpdate ? 'update' : 'create',
        status: 'failed',
        productCount: 1,
        productIds: [product.id],
        productNames: [product.name || 'Unnamed Product'],
        httpStatus: 400,
        durationMs,
        endpoint,
        requestPayload,
        responsePayload: {
          code: 'rest_missing_callback_param',
          message: 'Missing required parameters for WooCommerce product creation.',
          data: { status: 400 },
        },
        errorMessage: 'WooCommerce API 400: Product missing required attributes (name, sku, or category).',
      };

      const updatedProduct: Product = {
        ...product,
        syncStatus: 'sync_error',
        lastSyncError: log.errorMessage,
        updatedAt: timestamp,
      };

      return { success: false, log, updatedProduct };
    }

    // 3. Simulate configured failure rate
    const shouldFail = Math.random() < config.failureRate;
    if (shouldFail) {
      const errorReasons = [
        {
          status: 429,
          msg: 'WooCommerce API 429: Too Many Requests (Rate limit exceeded on REST API endpoint).',
          body: { code: 'woocommerce_rest_rate_limit', message: 'Rate limit threshold exceeded.', data: { status: 429 } },
        },
        {
          status: 500,
          msg: 'WooCommerce API 500: Internal Server Error (Database lock during product metadata update).',
          body: { code: 'internal_server_error', message: 'WordPress database deadlock detected.', data: { status: 500 } },
        },
        {
          status: 422,
          msg: `WooCommerce API 422: Unprocessable Entity (Duplicate SKU conflict detected).`,
          body: { code: 'product_invalid_sku', message: 'SKU conflict with existing remote entity.', data: { status: 422 } },
        },
      ];

      const err = errorReasons[Math.floor(Math.random() * errorReasons.length)];
      const log: SyncLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
        action: isUpdate ? 'update' : 'create',
        status: 'failed',
        productCount: 1,
        productIds: [product.id],
        productNames: [product.name],
        httpStatus: err.status,
        durationMs,
        endpoint,
        requestPayload,
        responsePayload: err.body,
        errorMessage: err.msg,
      };

      const updatedProduct: Product = {
        ...product,
        syncStatus: 'sync_error',
        lastSyncError: err.msg,
        updatedAt: timestamp,
      };

      return { success: false, log, updatedProduct };
    }

    // 4. Success Simulation
    const remoteId = product.wooCommerceId || Math.floor(Math.random() * 8000) + 1200;
    const responsePayload = {
      id: remoteId,
      name: product.name,
      slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      permalink: `https://demo-woocommerce.local/shop/${product.category.toLowerCase()}/${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      date_created: product.createdAt,
      date_modified: timestamp,
      status: requestPayload.status,
      stock_quantity: product.stockQuantity,
      sku: product.sku,
      price: product.price.toFixed(2),
      regular_price: requestPayload.regular_price,
      sale_price: requestPayload.sale_price || '',
      manage_stock: true,
      in_stock: product.stockQuantity > 0,
      sync_engine: 'CatalogSync PIM Demo Adapter v1.0',
    };

    const log: SyncLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      action: isUpdate ? 'update' : 'create',
      status: 'success',
      productCount: 1,
      productIds: [product.id],
      productNames: [product.name],
      httpStatus: isUpdate ? 200 : 201,
      durationMs,
      endpoint,
      requestPayload,
      responsePayload,
    };

    const updatedProduct: Product = {
      ...product,
      wooCommerceId: remoteId,
      syncStatus: 'synced',
      lastSyncedAt: timestamp,
      lastSyncError: null,
      updatedAt: timestamp,
    };

    return { success: true, log, updatedProduct };
  }

  async syncBatch(products: Product[], config: SyncSimulationConfig): Promise<BatchSyncResult> {
    const startTime = performance.now();
    const results: ProductSyncResult[] = [];

    // Process sequentially or with slight delay to mimic batch REST endpoint
    for (const product of products) {
      const res = await this.syncProduct(product, {
        ...config,
        latencyMs: Math.max(80, Math.floor(config.latencyMs / products.length)), // distribute latency
      });
      results.push(res);
    }

    const durationMs = Math.round(performance.now() - startTime);
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    let overallStatus: SyncLogEntry['status'] = 'success';
    if (failureCount > 0 && successCount > 0) {
      overallStatus = 'partial';
    } else if (failureCount > 0 && successCount === 0) {
      overallStatus = 'failed';
    }

    const overallLog: SyncLogEntry = {
      id: `log-batch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action: 'batch_sync',
      status: overallStatus,
      productCount: products.length,
      productIds: products.map((p) => p.id),
      productNames: products.map((p) => p.name),
      httpStatus: failureCount === 0 ? 200 : 207, // 207 Multi-Status
      durationMs,
      endpoint: '/wp-json/wc/v3/products/batch',
      requestPayload: {
        update: products.filter((p) => p.wooCommerceId).map(productToWooCommercePayload),
        create: products.filter((p) => !p.wooCommerceId).map(productToWooCommercePayload),
      },
      responsePayload: {
        batch_summary: {
          total: products.length,
          successful: successCount,
          failed: failureCount,
        },
      },
      errorMessage:
        failureCount > 0
          ? `Batch sync completed with ${failureCount} failed product(s) out of ${products.length}.`
          : undefined,
    };

    return {
      results,
      overallLog,
      successCount,
      failureCount,
    };
  }
}

export const mockWooCommerceAdapter = new MockWooCommerceAdapter();
