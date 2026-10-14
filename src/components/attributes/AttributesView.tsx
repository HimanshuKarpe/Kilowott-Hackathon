import React, { useState, useMemo } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { Product } from '../../types/product';
import { Search, Tags, Edit2, ArrowRight } from 'lucide-react';

interface AttributesViewProps {
  onEditProduct: (product: Product) => void;
  onNavigateToProductsWithFilter: (query: string) => void;
}

interface AttributeSummary {
  name: string;
  usageCount: number;
  distinctValues: string[];
  sampleProducts: Array<{
    product: Product;
    value: string;
  }>;
}

export const AttributesView: React.FC<AttributesViewProps> = ({
  onEditProduct,
  onNavigateToProductsWithFilter,
}) => {
  const { products } = useCatalog();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAttributeKey, setSelectedAttributeKey] = useState<string | null>(null);

  // Group attributes across all products dynamically
  const attributeSummaries = useMemo(() => {
    const map = new Map<string, { distinctValues: Set<string>; items: Array<{ product: Product; value: string }> }>();

    products.forEach((prod) => {
      (prod.attributes || []).forEach((attr) => {
        const key = (attr.name || '').trim();
        const val = (attr.value || '').trim();
        if (!key) return;

        if (!map.has(key)) {
          map.set(key, { distinctValues: new Set(), items: [] });
        }
        const record = map.get(key)!;
        if (val) record.distinctValues.add(val);
        record.items.push({ product: prod, value: val });
      });
    });

    const summaries: AttributeSummary[] = [];
    map.forEach((data, name) => {
      summaries.push({
        name,
        usageCount: data.items.length,
        distinctValues: Array.from(data.distinctValues).sort(),
        sampleProducts: data.items,
      });
    });

    return summaries.sort((a, b) => b.usageCount - a.usageCount);
  }, [products]);

  // Filtered attribute keys
  const filteredSummaries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return attributeSummaries;

    return attributeSummaries.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.distinctValues.some((v) => v.toLowerCase().includes(q))
    );
  }, [attributeSummaries, searchQuery]);

  // Active selected attribute for inspection
  const activeSummary = useMemo(() => {
    if (!selectedAttributeKey && filteredSummaries.length > 0) {
      return filteredSummaries[0];
    }
    return attributeSummaries.find((a) => a.name === selectedAttributeKey) || filteredSummaries[0] || null;
  }, [attributeSummaries, filteredSummaries, selectedAttributeKey]);

  return (
    <div className="space-y-6">
      {/* Title & Description Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Tags className="w-5 h-5 text-blue-600" />
            <span>Product Attributes Overview</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Dynamic specifications and parameters configured across catalogue items. Mapped directly to WooCommerce product attributes.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Total Attributes: <strong className="text-slate-900 font-bold">{attributeSummaries.length}</strong> keys registered
        </div>
      </div>

      {/* Main Grid: Left Attribute Keys List, Right Attribute Usage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Attribute Index */}
        <div className="enterprise-card p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search attribute keys or values..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
            {filteredSummaries.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No matching attributes found.</p>
            ) : (
              filteredSummaries.map((attr) => {
                const isSelected = activeSummary?.name === attr.name;
                return (
                  <button
                    key={attr.name}
                    onClick={() => setSelectedAttributeKey(attr.name)}
                    className={`w-full py-3 px-3 flex items-center justify-between text-left rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border border-blue-200 text-blue-900 font-semibold shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold block">{attr.name}</span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[170px] mt-0.5">
                        {attr.distinctValues.slice(0, 3).join(', ')}
                        {attr.distinctValues.length > 3 && '...'}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                      {attr.usageCount} {attr.usageCount === 1 ? 'item' : 'items'}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Attribute Detail & Product Association Table */}
        <div className="lg:col-span-2 enterprise-card p-6 space-y-5">
          {activeSummary ? (
            <>
              {/* Attribute Detail Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">{activeSummary.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold font-mono">
                      {activeSummary.usageCount} products assigned
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {activeSummary.distinctValues.length} distinct values detected across catalogue items.
                  </p>
                </div>

                <button
                  onClick={() => onNavigateToProductsWithFilter(activeSummary.name)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 shrink-0 hover:underline cursor-pointer"
                >
                  <span>Filter in Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Distinct Values Tags */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                  Active Values in Use:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeSummary.distinctValues.map((val) => (
                    <span
                      key={val}
                      className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-medium"
                    >
                      {val}
                    </span>
                  ))}
                </div>
              </div>

              {/* Associated Products Table */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                  Products Configured with &quot;{activeSummary.name}&quot;:
                </span>

                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="enterprise-table-header text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3">Assigned Value</th>
                        <th className="py-2.5 pr-3 pl-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-xs">
                      {activeSummary.sampleProducts.map(({ product, value }) => (
                        <tr key={product.id} className="enterprise-table-row">
                          <td className="py-2.5 px-3 text-slate-700 font-medium">{product.sku}</td>
                          <td className="py-2.5 px-3 text-slate-900 font-sans font-medium">{product.name}</td>
                          <td className="py-2.5 px-3 text-blue-700 font-semibold">{value || '—'}</td>
                          <td className="py-2.5 pr-3 pl-2 text-right font-sans">
                            <button
                              onClick={() => onEditProduct(product)}
                              className="text-xs text-slate-700 hover:text-slate-900 px-2 py-1 rounded border border-slate-300 hover:bg-slate-100 inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                              title="Edit product attribute"
                            >
                              <Edit2 className="w-3 h-3 text-slate-500" />
                              <span>Edit</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500 py-12 text-center">
              Select an attribute from the left to view value distribution.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
