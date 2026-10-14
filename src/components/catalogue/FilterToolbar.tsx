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
    <div className="enterprise-card p-4 space-y-3">
      {/* Top Row: Search Input + Quick Presets + View Mode */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catalogue by name, SKU, category, or dynamic attribute..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Layout Toggle & Sort */}
        <div className="flex items-center gap-2 self-end lg:self-center">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filters.sortField}
              onChange={(e) => setFilters({ sortField: e.target.value as ProductSortField })}
              className="bg-transparent text-slate-700 focus:outline-none cursor-pointer pr-1 text-xs font-medium"
            >
              <option value="updatedAt">Sort: Recently Updated</option>
              <option value="name">Sort: Product Title</option>
              <option value="price">Sort: Price</option>
              <option value="stockQuantity">Sort: Stock Level</option>
              <option value="completeness">Sort: Data Completeness</option>
            </select>
            <button
              onClick={() => setFilters({ sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc' })}
              className="text-slate-600 hover:text-slate-900 font-mono px-1 font-semibold text-xs border-l border-slate-200"
              title="Toggle sort direction"
            >
              {filters.sortDirection === 'asc' ? 'ASC' : 'DESC'}
            </button>
          </div>

          {/* Table / Grid Mode Toggle */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => onToggleViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Second Row: Filter Dropdowns & Quick Segments */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        {/* Category & Status Filter Selects */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-slate-500 font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
            className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer text-xs"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={filters.publicationStatus}
            onChange={(e) => setFilters({ publicationStatus: e.target.value as ProductFilters['publicationStatus'] })}
            className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer text-xs"
          >
            <option value="all">All Merchandising States</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={filters.syncStatus}
            onChange={(e) => setFilters({ syncStatus: e.target.value as ProductFilters['syncStatus'] })}
            className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer text-xs"
          >
            <option value="all">All Sync States</option>
            <option value="synced">Synced</option>
            <option value="pending_sync">Pending Sync</option>
            <option value="sync_error">Sync Failed</option>
          </select>

          <select
            value={filters.completeness}
            onChange={(e) => setFilters({ completeness: e.target.value as ProductFilters['completeness'] })}
            className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer text-xs"
          >
            <option value="all">All Data Quality</option>
            <option value="complete">Complete (Ready)</option>
            <option value="incomplete">Incomplete (Needs Review)</option>
          </select>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Count indicator */}
        <div className="text-slate-500 text-xs hidden sm:block shrink-0">
          Showing <strong className="text-slate-900">{filteredProducts.length}</strong> of{' '}
          <strong className="text-slate-900">{products.length}</strong> items
        </div>
      </div>
    </div>
  );
};
