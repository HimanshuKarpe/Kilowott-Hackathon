# Merchline — One catalogue. Every channel.

> A professional Product Information Management (PIM) dashboard for e-commerce businesses synchronising product data with WooCommerce.

---

## 1. Problem Statement & Background

E-commerce merchants managing modern product catalogues face several recurring friction points:
- **Disorganized Master Data**: Product specifications, variant attributes (sizes, colors, materials), and marketing copy often reside across disparate spreadsheets.
- **Incomplete Product Publishing**: Products are frequently pushed to storefronts with missing images, blank technical specifications, zero stock, or unformatted SKUs.
- **Synchronization Fragility**: Direct manual entry into WooCommerce is error-prone, lacks auditability, and provides no clear history of payload failures or rate-limiting events.

**Merchline solves this** by acting as the authoritative Single Source of Truth (PIM) before products are dispatched to WooCommerce. It enforces SKU uniqueness, validates numeric pricing and integer stock, tracks dynamic attributes, computes real-time completeness scores, and provides an audited synchronization pipeline.

---

## 2. Core Features

### 📊 1. Executive Dashboard
- **4 Meaningful Operational Metrics**: Total Products (with category breakdown), Published Products (% live), Incomplete Product Data (flagging missing fields), and Sync Issues (queue and error counts).
- **Products Requiring Attention**: Unified actionable table prioritizing sync failures and incomplete data, with direct **Edit Product** and **Retry Sync** actions.
- **Catalogue Data Quality & Distribution Strip**: Overview of catalogue quality index score with completeness breakdown.
- **Remote Store Status**: Displays simulated WooCommerce adapter health, active latency, and injected error rates.

### 🛍️ 2. Comprehensive Product Catalogue
- **Full Search & Multi-Filter Engine**: Instant search across titles, unique SKUs, categories, descriptions, and dynamic custom attributes.
- **Dual View Modes**: Switch between high-density **Table View** and visual **Grid Card View**.
- **Sorting**: Sort by recently updated, product name, price, inventory stock, or completeness score.
- **Batch Operations**: Select multiple products to batch-sync to WooCommerce, update publication status (`published`, `draft`, `archived`), or batch-delete with safety confirmation.

### ⚙️ 3. Dynamic Product Attributes & Schema
- Add, update, and remove arbitrary key-value attributes per product (e.g., *Color: Matte Obsidian*, *Battery Life: 40 Hours*, *Material: Grade 5 Titanium*).
- **Quick-Suggestion Chips** for common e-commerce specifications.
- Clean validation preventing blank names or duplicate attribute keys within the same product.

### 🛡️ 4. Data Validation & Completeness Engine
- **SKU Uniqueness**: Enforced across the entire catalogue (case-insensitive check, excluding the active item during edits).
- **Pricing Integrity**: Ensures price is a valid non-negative number and sale price is strictly less than or equal to standard price.
- **Inventory Integrity**: Ensures stock quantity is a whole non-negative integer.
- **PIM Completeness Index (0–100%)**: Evaluates commercial fields, rich description length, imagery, and attribute depth, providing merchandisers with actionable completion recommendations.

### 🔄 5. Sync Centre & Demo WooCommerce Adapter
- **Transparent Demo Adapter**: Clearly marked as an in-browser WooCommerce REST API v3 simulator. Complies with the `/wp-json/wc/v3/products` specification without needing live credentials or risking remote storefronts.
- **Simulation Control Panel**: Dynamically adjust simulated network latency (100ms–2500ms), inject remote failure rates (0%, 25%, 50%, 100%), or simulate offline outages to test UI resilience.
- **Audit Trail & Payload Inspection**: Comprehensive history logging timestamps, HTTP response codes, request payloads, and remote response data with syntax-highlighted JSON viewer and one-click copy.
- **Sync Queue & Error Recovery**: Direct retry for individual failed syncs or one-click "Sync All Pending".

### 💾 6. Persistence & Portable State
- Safe browser persistence via `localStorage` with versioned schema.
- **Pre-populated with 10 realistic e-commerce products** across multiple categories, sync states, and publication states.
- **One-Click Demo Reset**: Instantly restore seed data anytime.
- **JSON Export / Import**: Export catalogue state to a portable JSON backup.

---

## 3. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 18 + TypeScript | Component model with strict typing |
| **Build Tool** | Vite 6 | Sub-second HMR and optimized bundler |
| **Styling** | Tailwind CSS 3 | Professional light-themed enterprise design tokens |
| **Icons** | Lucide React | High-clarity iconography |
| **Persistence** | Browser `localStorage` | Client-side sandbox persistence |
| **Unit Testing** | Vitest + Testing Library | Blazing-fast business logic test runner |

---

## 4. Architecture & Clean Code Separation

Merchline strictly adheres to **Clean Architecture** and **Domain-Driven Design (DDD)**:

```
src/
├── types/                      # Domain interfaces (product.ts, sync.ts, validation.ts)
├── domain/                     # Pure business logic (validation, completeness, filter/sort)
├── adapters/                   # Pluggable adapters
│   ├── storage/                # LocalStorage persistence repo & rich seed data
│   └── sync/                   # ISyncAdapter interface & MockWooCommerceAdapter
├── context/                    # Reactive state (CatalogContext, ToastContext)
├── components/                 # Atomic UI components
│   ├── layout/                 # Header, DemoBanner, Navigation
│   ├── dashboard/              # Operational KPI tiles, Incomplete queue, Sync log
│   ├── catalogue/              # ProductTable, ProductGrid, FilterToolbar, BatchActions
│   ├── attributes/             # Dedicated Attributes Workspace & Schema distribution
│   ├── product-modal/          # ProductModal with structured dynamic attribute editor
│   ├── sync/                   # SyncCentre, PayloadInspectModal, SimulationConfigModal
│   ├── docs/                   # Architecture & REST mapping documentation modal
│   └── common/                 # Reusable Button, Modal, Badge, ConfirmDialog
└── test/                       # Comprehensive Vitest test suites
```

Refer to [`docs/ARCHITECTURE.md`](file:///c:/Users/HIMANSHU/Desktop/Kilowott-Hackathon/docs/ARCHITECTURE.md) and [`docs/WOOCOMMERCE_INTEGRATION.md`](file:///c:/Users/HIMANSHU/Desktop/Kilowott-Hackathon/docs/WOOCOMMERCE_INTEGRATION.md) for full architectural schematics and API mapping tables.

---

## 5. Prerequisites & Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24.x tested and supported)
- **npm**: v9.0.0 or higher

### Installation & Run Instructions

1. **Clone or navigate to the repository**:
   ```bash
   cd Kilowott-Hackathon
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173/`.

4. **Run the automated test suite**:
   ```bash
   npm run test
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 6. Automated Testing Suite

All critical business logic, domain validation, completeness algorithms, and WooCommerce payload transformations are verified with automated unit tests:

```
 RUN  v3.2.7 C:/Users/HIMANSHU/Desktop/Kilowott-Hackathon

 ✓ src/test/completeness.test.ts (2 tests)
 ✓ src/test/filterSort.test.ts (6 tests)
 ✓ src/test/validation.test.ts (16 tests)
 ✓ src/test/syncAdapter.test.ts (4 tests)

 Test Files  4 passed (4)
      Tests  28 passed (28)
```

### Key Test Coverage:
- **SKU Uniqueness**: Checks case-insensitive collisions across existing products; permits keeping the same SKU when updating self.
- **Price & Stock Validation**: Rejects negative numbers, non-numeric strings, and non-integer inventory counts.
- **Sale Price Logic**: Prevents sale price exceeding the standard regular price.
- **Dynamic Attributes**: Detects blank attribute names when values are provided, and flags duplicate attribute keys.
- **Completeness Engine**: Validates score percentage, missing field detection, and recommendation generation.
- **Payload Transformation**: Verifies that internal `Product` data accurately maps to WooCommerce REST API v3 `/products` format.

---

## 7. AI Usage Statement

In accordance with hackathon guidelines:
- **AI Agent (Antigravity)** was utilized as an assistive pair programmer for initial project scaffolding, architecture planning, typing definitions, generating realistic seed product models, and authoring unit test suites.
- All domain rules (SKU uniqueness checks, numerical boundary validation, dynamic attribute parsing, completeness heuristics), clean layering, and WooCommerce REST API v3 transformation schemas were deliberately structured and reviewed to adhere to enterprise standards.

---

## 8. Assumptions & Limitations

- **Demo Simulation Adapter**: The frontend connects to an in-browser WooCommerce simulation adapter rather than a live remote store. This is by design: storing real WooCommerce `consumer_key` and `consumer_secret` in a frontend SPA is insecure and violates basic security guidelines.
- **Production Integration Path**: A real deployment requires routing synchronization requests through a secure serverless backend proxy (e.g., Express or Cloudflare Worker) that signs requests using OAuth 1.0a or HTTPS Basic Auth. The adapter interface (`ISyncAdapter`) was designed specifically to accommodate this without modifying any UI code.
- **Storage Scope**: Persistence is backed by browser `localStorage` scoped to the origin. Clearing browser storage will re-initialize the catalogue from seed data. The "Reset Demo Data" button provides an immediate recovery mechanism.
