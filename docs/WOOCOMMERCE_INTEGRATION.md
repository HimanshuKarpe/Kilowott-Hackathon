# CatalogSync — WooCommerce REST API Integration Specification

## 1. Integration Scope & Standards

CatalogSync integrates with WooCommerce using the official **WooCommerce REST API v3** specification.

- **Protocol**: HTTPS JSON REST
- **Base Endpoint**: `/wp-json/wc/v3/products`
- **Current Mode**: In-Browser Virtual Simulation Sandbox (Demo Adapter)
- **Production Target**: Server-Side Authenticated Proxy

---

## 2. Field Mapping Specification

| CatalogSync PIM Field | WooCommerce REST v3 Field | Data Type | Transformation & Validation |
| :--- | :--- | :--- | :--- |
| `name` | `name` | `string` | Required. Min 2 chars. Sanitised text. |
| `sku` | `sku` | `string` | Required. Unique, uppercase alphanumeric with hyphens/underscores. |
| `price` / `regularPrice` | `regular_price` | `string` | Formatted to 2 decimal string (e.g. `"29.99"`). |
| `salePrice` | `sale_price` | `string` | Optional. Must be `< regularPrice` if provided. |
| `description` | `description` | `string` | HTML / plain text description body. |
| `category` | `categories[].name` | `array` | Mapped to WooCommerce taxonomy object `[{ "name": "Audio" }]`. |
| `stockQuantity` | `stock_quantity` | `integer` | Non-negative integer. Accompanied by `"manage_stock": true`. |
| `publicationStatus` | `status` | `string` | `'published'` → `'publish'`, `'draft'` → `'draft'`, `'archived'` → `'private'`. |
| `attributes[]` | `attributes[]` | `array` | `[{ "name": "Color", "visible": true, "options": ["Obsidian"] }]`. |
| `imageUrl` | `images[].src` | `array` | `[{ "src": "https://...", "alt": name }]`. |

---

## 3. Request & Response Payload Examples

### 3.1 Single Product Creation (`POST /wp-json/wc/v3/products`)

**Outgoing Request Payload:**
```json
{
  "name": "AcoustiQ Pro Noise-Cancelling Headphones",
  "type": "simple",
  "regular_price": "349.99",
  "sale_price": "299.99",
  "description": "Over-ear wireless headphones engineered with hybrid active noise cancellation...",
  "short_description": "Over-ear wireless headphones engineered...",
  "sku": "AUDIO-ANC-01",
  "manage_stock": true,
  "stock_quantity": 45,
  "status": "publish",
  "categories": [
    { "name": "Audio" }
  ],
  "attributes": [
    { "name": "Color", "visible": true, "options": ["Matte Obsidian"] },
    { "name": "Battery Life", "visible": true, "options": ["40 Hours"] }
  ],
  "images": [
    { "src": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", "alt": "AcoustiQ Pro Noise-Cancelling Headphones" }
  ]
}
```

**Simulated 201 Created Response:**
```json
{
  "id": 1081,
  "name": "AcoustiQ Pro Noise-Cancelling Headphones",
  "slug": "acoustiq-pro-noise-cancelling-headphones",
  "permalink": "https://demo-woocommerce.local/shop/audio/acoustiq-pro-noise-cancelling-headphones",
  "date_created": "2026-10-14T09:15:00.000Z",
  "date_modified": "2026-10-14T09:15:00.000Z",
  "status": "publish",
  "sku": "AUDIO-ANC-01",
  "price": "299.99",
  "regular_price": "349.99",
  "sale_price": "299.99",
  "stock_quantity": 45,
  "manage_stock": true,
  "in_stock": true,
  "sync_engine": "CatalogSync PIM Demo Adapter v1.0"
}
```

---

### 3.2 Batch Synchronization (`POST /wp-json/wc/v3/products/batch`)

```json
{
  "create": [
    { "name": "New Item", "sku": "NEW-01", "regular_price": "19.99", "manage_stock": true, "stock_quantity": 10 }
  ],
  "update": [
    { "id": 1081, "stock_quantity": 42, "regular_price": "329.99" }
  ]
}
```

---

## 4. Error Simulation Matrix

CatalogSync includes a built-in error injector in the demo adapter so testers can verify UI resilience without touching live infrastructure:

| Injected Scenario | Simulated HTTP Status | Error Code | Observed Behavior in Dashboard |
| :--- | :--- | :--- | :--- |
| **Missing required fields** | `400 Bad Request` | `rest_missing_callback_param` | Sync status set to `sync_error`, error tooltip visible, retry button available. |
| **Duplicate remote SKU** | `422 Unprocessable` | `product_invalid_sku` | Product flagged in queue with error message. |
| **Rate Limit Exceeded** | `429 Too Many Requests` | `woocommerce_rest_rate_limit` | Logged in audit trail with retry suggestion. |
| **Database Lock** | `500 Internal Server` | `internal_server_error` | Audit entry recorded with stack trace details. |
| **Network Outage** | `HTTP 0 (Network Error)` | `ECONNREFUSED` | Marked as connection failure; queue preserves pending state. |

---

## 5. Production Deployment Architecture

To transition this prototype into a production-grade deployment connected to a live WooCommerce store:

```
[ CatalogSync Frontend Client ]
              │ (HTTPS Bearer Token / Session)
              ▼
[ Secure Backend API Proxy (Node / Go / Cloudflare Worker) ]
   ├── Stores WOO_CONSUMER_KEY & WOO_CONSUMER_SECRET securely in environment
   ├── Enforces rate limiting & queue batching
   ├── Validates JSON schemas
              │ (HTTPS Basic Auth + SSL)
              ▼
[ Live WooCommerce Store: /wp-json/wc/v3 ]
```

1. **Security**: Never expose WooCommerce `ck_...` and `cs_...` keys on client single-page applications.
2. **Batching**: Group catalogue pushes into batches of 50–100 items using the WooCommerce `/products/batch` endpoint.
3. **Webhooks**: Implement inbound webhooks for `product.updated` and `order.created` to keep PIM inventory synchronised bidirectionally.
