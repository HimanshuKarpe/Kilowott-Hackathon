import React from 'react';
import { Layers, ShieldCheck, Server, Database, Info, Tag, Sliders, CheckCircle2 } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { Button } from '../common/Button';
import { MerchlineLogo } from '../common/MerchlineLogo';

export const DocsView: React.FC = () => {
  const { exportCatalogue } = useCatalog();

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-slate-800">
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div className="flex items-center gap-3">
          <MerchlineLogo size="md" color="#2563EB" withBadge={true} />
          <div>
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Merchline Platform Blueprint & Guide
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              One catalogue. Every channel. • System architecture, master data lifecycle, and integration specs.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={exportCatalogue}
          icon={<Database className="w-3.5 h-3.5" />}
        >
          Export Catalogue JSON
        </Button>
      </div>

      {/* 1. What Merchline Does */}
      <div className="enterprise-card p-5 space-y-2.5">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            1. Platform Purpose & Overview
          </h2>
        </div>
        <p className="text-xs text-[#64748B] leading-relaxed">
          <strong className="text-[#0F172A]">Merchline</strong> is a dedicated Product Information Management (PIM) application designed for e-commerce operations staff. It serves as the authoritative single source of truth for product information before data is pushed to online sales channels like WooCommerce.
        </p>
        <p className="text-xs text-[#64748B] leading-relaxed">
          By centralizing product data, Merchline eliminates chaotic spreadsheets, enforces strict commercial validation, calculates live data completeness scores, and manages synchronisation through an audited, recoverable pipeline.
        </p>
      </div>

      {/* 2. How Product Information is Managed */}
      <div className="enterprise-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            2. Master Data Management & Validation
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-[#E2E8F0] space-y-1">
            <span className="font-semibold text-[#0F172A] block">SKU Uniqueness</span>
            <p className="text-[#64748B] text-[11px] leading-relaxed">
              Every SKU is verified across the catalogue (case-insensitive) to prevent duplicate stock tracking conflicts.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-[#E2E8F0] space-y-1">
            <span className="font-semibold text-[#0F172A] block">Commercial Integrity</span>
            <p className="text-[#64748B] text-[11px] leading-relaxed">
              Prices must be positive numbers. Sale prices cannot exceed standard prices. Inventory counts require positive integers.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-[#E2E8F0] space-y-1">
            <span className="font-semibold text-[#0F172A] block">Completeness Index (0-100%)</span>
            <p className="text-[#64748B] text-[11px] leading-relaxed">
              Scores product readiness based on title, SKU, price, inventory, category, rich description, image, and attributes.
            </p>
          </div>
        </div>
      </div>

      {/* 3. How Dynamic Attributes Are Handled */}
      <div className="enterprise-card p-5 space-y-2.5">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            3. Dynamic Product Attributes
          </h2>
        </div>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Different e-commerce categories require varied specifications (e.g., <em>Color</em> for apparel, <em>Battery Life</em> for electronics, <em>Material</em> for furniture). Merchline handles this via dynamic key-value attributes stored directly on the product model.
        </p>
        <p className="text-xs text-[#64748B] leading-relaxed">
          The <strong>Attributes Workspace</strong> aggregates these entries across your catalogue in real-time, displaying distinct values and associated products with direct links to edit items without requiring a separate, redundant attribute database.
        </p>
      </div>

      {/* 4. How the Synchronisation Simulator Works */}
      <div className="enterprise-card p-5 space-y-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            4. WooCommerce REST API v3 Simulation
          </h2>
        </div>
        <p className="text-xs text-[#64748B] leading-relaxed">
          Merchline includes a high-fidelity in-browser simulation of the WooCommerce REST API v3 (<code className="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">/wp-json/wc/v3/products</code>).
        </p>
        <ul className="list-disc list-inside text-xs text-[#64748B] space-y-1 pl-1 leading-relaxed">
          <li><strong>Zero Secret Leakage:</strong> No live API keys are stored in the client, keeping demonstrations safe and isolated.</li>
          <li><strong>Network Latency Simulation:</strong> Configurable from 100ms to 2500ms to test asynchronous UI feedback.</li>
          <li><strong>Error Injection:</strong> Injects realistic HTTP errors (429 Rate Limits, 500 DB Deadlocks, 422 Validation Rejections) to verify error recovery workflows.</li>
          <li><strong>Full Audit Trail:</strong> Every request and response payload is recorded for inspection in the Sync Centre.</li>
        </ul>
      </div>

      {/* 5. System Architecture & Clean Layering */}
      <div className="enterprise-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            5. System Architecture
          </h2>
        </div>
        <p className="text-xs text-[#64748B] leading-relaxed">
          The codebase strictly separates concerns into independent layers:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 rounded-lg bg-slate-50 border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-600 block tracking-wider font-mono">
              Domain Layer
            </span>
            <p className="font-semibold text-[#0F172A]">Pure Business Logic</p>
            <p className="text-[#64748B] text-[11px]">
              Validation rules, SKU checks, and completeness score heuristics with zero DOM or React dependencies.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider font-mono">
              Adapter Layer
            </span>
            <p className="font-semibold text-[#0F172A]">Pluggable Interfaces</p>
            <p className="text-[#64748B] text-[11px]">
              Implements <code className="text-blue-700 font-mono">ISyncAdapter</code> and LocalStorage persistence repository.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-600 block tracking-wider font-mono">
              Context Layer
            </span>
            <p className="font-semibold text-[#0F172A]">State Management</p>
            <p className="text-[#64748B] text-[11px]">
              Coordinates asynchronous sync queues, active selection, toast notifications, search, and CRUD transitions.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-[#E2E8F0] space-y-1">
            <span className="text-[10px] uppercase font-bold text-indigo-600 block tracking-wider font-mono">
              Presentation
            </span>
            <p className="font-semibold text-[#0F172A]">Atomic Components</p>
            <p className="text-[#64748B] text-[11px]">
              Responsive workspaces, metric tiles, dynamic forms, data tables, and JSON inspection drawers.
            </p>
          </div>
        </div>
      </div>

      {/* 6. WooCommerce Field Mapping Table */}
      <div className="enterprise-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            6. WooCommerce REST API v3 Field Mapping
          </h2>
        </div>

        <div className="border border-[#E2E8F0] rounded-lg overflow-hidden bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="enterprise-table-header text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-2.5 px-3">Merchline PIM Field</th>
                <th className="py-2.5 px-3">WooCommerce REST v3 Parameter</th>
                <th className="py-2.5 px-3">Transformation & Formatting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              <tr>
                <td className="py-2.5 px-3 text-blue-700 font-semibold">name</td>
                <td className="py-2.5 px-3 text-[#0F172A]">name</td>
                <td className="py-2.5 px-3 text-[#64748B] font-sans">Product title string</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-blue-700 font-semibold">sku</td>
                <td className="py-2.5 px-3 text-[#0F172A]">sku</td>
                <td className="py-2.5 px-3 text-[#64748B] font-sans">Enforced unique, uppercase alphanumeric</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-blue-700 font-semibold">price / regularPrice</td>
                <td className="py-2.5 px-3 text-[#0F172A]">regular_price</td>
                <td className="py-2.5 px-3 text-[#64748B] font-sans">Formatted to 2 decimal string (e.g. &quot;29.99&quot;)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-blue-700 font-semibold">salePrice</td>
                <td className="py-2.5 px-3 text-[#0F172A]">sale_price</td>
                <td className="py-2.5 px-3 text-[#64748B] font-sans">Optional string representation when set</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-blue-700 font-semibold">stockQuantity</td>
                <td className="py-2.5 px-3 text-[#0F172A]">stock_quantity, manage_stock: true</td>
                <td className="py-2.5 px-3 text-[#64748B] font-sans">Integer inventory tracking</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-blue-700 font-semibold">publicationStatus</td>
                <td className="py-2.5 px-3 text-[#0F172A]">status (&apos;publish&apos; | &apos;draft&apos; | &apos;private&apos;)</td>
                <td className="py-2.5 px-3 text-[#64748B] font-sans">Published maps to &apos;publish&apos;, Archived maps to &apos;private&apos;</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-blue-700 font-semibold">category</td>
                <td className="py-2.5 px-3 text-[#0F172A]">{"categories: [{ 'name': '...' }]"}</td>
                <td className="py-2.5 px-3 text-[#64748B] font-sans">Categorised taxonomies</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-blue-700 font-semibold">attributes[]</td>
                <td className="py-2.5 px-3 text-[#0F172A]">{"attributes: [{ name, visible: true, options: ['val'] }]"}</td>
                <td className="py-2.5 px-3 text-[#64748B] font-sans">Dynamic key-value parameters</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Current Limitations & Production Path */}
      <div className="enterprise-card p-5 space-y-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            7. Current Scope & Production Connecting Path
          </h2>
        </div>
        <ul className="list-disc list-inside text-xs text-[#64748B] space-y-1.5 pl-1 leading-relaxed">
          <li><strong>Storage Scope:</strong> Catalogue state persists in your browser&apos;s <code className="text-blue-700 font-mono">localStorage</code>. The &quot;Reset Demo Data&quot; button restores default seed products at any time.</li>
          <li><strong>Connecting to Live WooCommerce:</strong> To hook Merchline up to a production WooCommerce store, route synchronisation calls through a secure backend proxy (Express, Next.js API, or Cloudflare Worker) that signs requests using your WooCommerce Consumer Key and Secret. Implement <code className="text-blue-700 font-mono">ISyncAdapter</code> pointing to your backend endpoint without touching any UI code.</li>
          <li><strong>Running the Application:</strong> Run <code className="text-blue-700 font-mono">npm run dev</code> for local development, <code className="text-blue-700 font-mono">npm run test</code> to run the Vitest test suite, and <code className="text-blue-700 font-mono">npm run build</code> to produce an optimized production bundle.</li>
        </ul>
      </div>
    </div>
  );
};
