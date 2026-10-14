import React from 'react';
import { Search, X, Filter, ArrowUpDown, LayoutGrid, LayoutList, RotateCcw } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { ProductFilters, ProductSortField } from '../../types/product';

interface FilterToolbarProps {
  viewMode: 'table' | 'grid';
  onToggleViewMode: (mode: 'table' | 'grid') => void;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({ viewMode, onToggleViewMode }) => {
  const { filters, setFilters, resetFilters, categories, products, filteredProducts } = useCatalog();

  const isFiltered =
    Boolean(filters.searchQuery) ||
    filters.category !== 'all' ||
    filters.publicationStatus !== 'all' ||
    filters.syncStatus !== 'all' ||
    filters.completeness !== 'all';

  return (
    <div className="glass-panel p-4 rounded-2xl space-y-4">
      {/* Top Search & Primary Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, SKU, category, or dynamic attribute..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-9 py-2 bg-surface-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode & Sorters */}
        <div className="flex items-center gap-2 self-end lg:self-center">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-surface-950/80 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.sortField}
              onChange={(e) => setFilters({ sortField: e.target.value as ProductSortField })}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="updatedAt" className="bg-surface-900">Recently Updated</option>
              <option value="name" className="bg-surface-900">Product Name</option>
              <option value="price" className="bg-surface-900">Price</option>
              <option value="stockQuantity" className="bg-surface-900">Stock Quantity</option>
              <option value="completeness" className="bg-surface-900">Completeness Score</option>
            </select>
            <button
              onClick={() => setFilters({ sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc' })}
              className="text-slate-400 hover:text-white font-mono px-1 font-semibold"
              title="Toggle sort direction"
            >
              {filters.sortDirection === 'asc' ? '↑ ASC' : '↓ DESC'}
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-surface-950/80 border border-slate-700/80 rounded-xl p-1">
            <button
              onClick={() => onToggleViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Dropdown Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 mr-1 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => setFilters({ category: e.target.value })}
          className="bg-surface-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
        >
          <option value="all" className="bg-surface-900">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat} className="bg-surface-900">
              {cat}
            </option>
          ))}
        </select>

        {/* Publication Status */}
        <select
          value={filters.publicationStatus}
          onChange={(e) => setFilters({ publicationStatus: e.target.value as ProductFilters['publicationStatus'] })}
          className="bg-surface-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
        >
          <option value="all" className="bg-surface-900">All Publication Statuses</option>
          <option value="published" className="bg-surface-900">Published</option>
          <option value="draft" className="bg-surface-900">Draft</option>
          <option value="archived" className="bg-surface-900">Archived</option>
        </select>

        {/* Sync Status */}
        <select
          value={filters.syncStatus}
          onChange={(e) => setFilters({ syncStatus: e.target.value as ProductFilters['syncStatus'] })}
          className="bg-surface-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
        >
          <option value="all" className="bg-surface-900">All Sync Statuses</option>
          <option value="synced" className="bg-surface-900">Synced</option>
          <option value="pending_sync" className="bg-surface-900">Pending Sync</option>
          <option value="sync_error" className="bg-surface-900">Sync Error</option>
        </select>

        {/* Completeness Filter */}
        <select
          value={filters.completeness}
          onChange={(e) => setFilters({ completeness: e.target.value as ProductFilters['completeness'] })}
          className="bg-surface-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
        >
          <option value="all" className="bg-surface-900">All Data Quality</option>
          <option value="complete" className="bg-surface-900">Complete Ready (≥75%)</option>
          <option value="incomplete" className="bg-surface-900">Incomplete / Needs Work</option>
        </select>

        {/* Reset Filters button */}
        {isFiltered && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}

        <div className="ml-auto text-slate-400 font-mono text-[11px]">
          Showing <strong>{filteredProducts.length}</strong> of {products.length} products
        </div>
      </div>
    </div>
  );
};
