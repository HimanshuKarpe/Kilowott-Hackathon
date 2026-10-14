import React from 'react';
import { BookOpen, Layers, ShieldCheck, Server, Database } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { Button } from '../common/Button';

export const DocsView: React.FC = () => {
  const { exportCatalogue } = useCatalog();

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-slideIn">
      {/* Hero Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-surface-900 via-surface-900 to-brand-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-brand-500/20 text-brand-300">
              <BookOpen className="w-4 h-4 text-brand-400" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Architecture & Integration Specifications
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Technical blueprint, layered architecture, WooCommerce REST API v3 mapping, and verification matrix.
          </p>
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

      {/* Layer Architecture Diagram */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-400" />
          <h2 className="text-base font-bold text-white tracking-tight">
            Layered System Architecture
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          CatalogSync follows a strict separation of concerns to guarantee long-term testability and maintainability:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-4 rounded-xl bg-surface-950 border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-brand-400 block tracking-wider">
              1. Domain Layer
            </span>
            <p className="font-semibold text-white">Pure Business Logic</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              No UI or React dependencies. Pure functions for SKU uniqueness, positive pricing, stock integrity, and PIM completeness scoring.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-950 border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
              2. Adapter Layer
            </span>
            <p className="font-semibold text-white">Pluggable Interfaces</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Defines <code className="text-brand-300 font-mono">ISyncAdapter</code>. Implements the Demo WooCommerce REST v3 simulator and LocalStorage persistence.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-950 border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
              3. State Context
            </span>
            <p className="font-semibold text-white">Application State</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Coordinates asynchronous sync queues, active selection, toast notifications, search filtering, and CRUD state transitions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-950 border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-sky-400 block tracking-wider">
              4. Presentation
            </span>
            <p className="font-semibold text-white">Atomic Components</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Responsive layouts, metric cards, dynamic attribute editors, tables, grid views, and JSON audit drawers.
            </p>
          </div>
        </div>
      </div>

      {/* WooCommerce REST API Mapping Table */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-brand-400" />
          <h2 className="text-base font-bold text-white tracking-tight">
            WooCommerce REST API v3 Field Mapping
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-surface-950 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">CatalogSync PIM Field</th>
                <th className="py-2.5 px-3">WooCommerce REST v3 Parameter</th>
                <th className="py-2.5 px-3">Transformation / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              <tr>
                <td className="py-2.5 px-3 text-brand-300">name</td>
                <td className="py-2.5 px-3 text-slate-200">name</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Product title string</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-brand-300">sku</td>
                <td className="py-2.5 px-3 text-slate-200">sku</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Enforced unique, uppercase alphanumeric</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-brand-300">price / regularPrice</td>
                <td className="py-2.5 px-3 text-slate-200">regular_price</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Formatted to 2 decimal string (e.g. &quot;29.99&quot;)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-brand-300">salePrice</td>
                <td className="py-2.5 px-3 text-slate-200">sale_price</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Optional string representation when set</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-brand-300">stockQuantity</td>
                <td className="py-2.5 px-3 text-slate-200">stock_quantity, manage_stock: true</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Integer inventory tracking</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-brand-300">publicationStatus</td>
                <td className="py-2.5 px-3 text-slate-200">status (&apos;publish&apos; | &apos;draft&apos; | &apos;private&apos;)</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Published maps to &apos;publish&apos;, Archived maps to &apos;private&apos;</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-brand-300">category</td>
                <td className="py-2.5 px-3 text-slate-200">{"categories: [{ 'name': '...' }]"}</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Categorised taxonomies</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-brand-300">attributes[]</td>
                <td className="py-2.5 px-3 text-slate-200">{"attributes: [{ name, visible: true, options: ['val'] }]"}</td>
                <td className="py-2.5 px-3 text-slate-400 font-sans">Dynamic key-value parameters</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Readiness & Real Adapter Extension Notice */}
      <div className="glass-panel p-6 rounded-2xl space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white tracking-tight">
            Connecting a Real WooCommerce Instance
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          In compliance with hackathon security requirements, <strong>no production credentials are hardcoded into the client</strong>. To connect to an actual live WooCommerce site:
        </p>
        <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 pl-1 leading-relaxed">
          <li>Create a secure backend proxy or serverless function to store the <code className="text-brand-300 font-mono">Consumer Key</code> and <code className="text-brand-300 font-mono">Consumer Secret</code> safely.</li>
          <li>Implement the <code className="text-brand-300 font-mono">ISyncAdapter</code> interface targeting your server endpoint.</li>
          <li>Switch the provider instance in <code className="text-brand-300 font-mono">CatalogContext</code> without rewriting any UI or validation code.</li>
        </ol>
      </div>
    </div>
  );
};
