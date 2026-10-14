import React from 'react';
import { Product } from '../../types/product';
import { PublicationBadge, SyncStatusBadge, CompletenessBadge } from '../common/Badge';
import { calculateCompleteness } from '../../domain/completeness';
import { Edit2, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';

interface ProductTableProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEditProduct,
  onDeleteProduct,
}) => {
  const {
    selectedProductIds,
    toggleSelectProduct,
    selectAllFiltered,
    clearSelection,
    syncSingleProduct,
    activeSyncProductIds,
  } = useCatalog();

  const isAllSelected =
    products.length > 0 && products.every((p) => selectedProductIds.includes(p.id));

  return (
    <div className="enterprise-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="enterprise-table-header text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 pl-4 pr-2 w-8">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      selectAllFiltered();
                    } else {
                      clearSelection();
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 min-w-[120px]">SKU</th>
              <th className="py-3 px-3 min-w-[280px]">Product / Category</th>
              <th className="py-3 px-3 min-w-[110px]">Publication</th>
              <th className="py-3 px-3 min-w-[120px]">Data Quality</th>
              <th className="py-3 px-3 min-w-[90px]">Stock</th>
              <th className="py-3 px-3 min-w-[100px]">Price</th>
              <th className="py-3 px-3 min-w-[140px]">WooCommerce Sync</th>
              <th className="py-3 pr-4 pl-2 text-right min-w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const isSelected = selectedProductIds.includes(product.id);
              const isSyncingRow = activeSyncProductIds.includes(product.id);
              const comp = calculateCompleteness(product);

              return (
                <tr
                  key={product.id}
                  className={`enterprise-table-row ${isSelected ? 'bg-blue-50/40' : ''}`}
                >
                  {/* Select Checkbox */}
                  <td className="py-3.5 pl-4 pr-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectProduct(product.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>

                  {/* SKU */}
                  <td className="py-3.5 px-3 font-mono font-medium text-slate-700">
                    <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                      {product.sku}
                    </span>
                  </td>

                  {/* Product Details (Optional Image, Name, Category, Attributes) */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-slate-500 font-bold text-xs uppercase font-mono">
                          {product.name.slice(0, 2).toUpperCase() || 'P'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="font-semibold text-slate-900 hover:text-blue-600 text-left truncate block max-w-[280px] transition-colors text-sm"
                          title={product.name}
                        >
                          {product.name}
                        </button>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{product.category}</span>
                          {product.attributes && product.attributes.length > 0 && (
                            <span className="text-slate-400">
                              • {product.attributes.length} {product.attributes.length === 1 ? 'attr' : 'attrs'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Merchandising Publication Status */}
                  <td className="py-3.5 px-3">
                    <PublicationBadge status={product.publicationStatus} size="sm" />
                  </td>

                  {/* PIM Completeness Badge */}
                  <td className="py-3.5 px-3">
                    <CompletenessBadge
                      score={comp.score}
                      isComplete={comp.isComplete}
                      size="sm"
                    />
                  </td>

                  {/* Inventory Stock */}
                  <td className="py-3.5 px-3 font-mono text-xs">
                    <span
                      className={`font-semibold ${
                        product.stockQuantity === 0
                          ? 'text-rose-600'
                          : product.stockQuantity < 10
                          ? 'text-amber-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {product.stockQuantity}
                    </span>
                    <span className="text-slate-400 font-sans text-[11px] ml-1">
                      {product.stockQuantity === 0 ? '(Out)' : product.stockQuantity < 10 ? '(Low)' : 'pcs'}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-3 font-mono text-xs">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-semibold text-[#0F172A]">₹{product.price.toFixed(2)}</span>
                      {product.regularPrice && product.regularPrice > product.price && (
                        <span className="text-[11px] text-slate-400 line-through">
                          ₹{product.regularPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* WooCommerce Sync State */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col gap-1 items-start">
                      <SyncStatusBadge
                        status={isSyncingRow ? 'syncing' : product.syncStatus}
                        wooCommerceId={product.wooCommerceId}
                        size="sm"
                      />
                      {product.lastSyncError && (
                        <span
                          className="text-[11px] text-rose-600 flex items-center gap-1 max-w-[150px] truncate"
                          title={product.lastSyncError}
                        >
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span className="truncate">{product.lastSyncError}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Row Actions with Clearly Labelled Edit Button */}
                  <td className="py-3.5 pr-4 pl-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Clearly Labelled Edit Button */}
                      <button
                        onClick={() => onEditProduct(product)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors shadow-2xs"
                        title="Edit product"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>Edit</span>
                      </button>

                      {/* Quick Sync */}
                      <button
                        onClick={() => syncSingleProduct(product.id)}
                        disabled={isSyncingRow}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100 transition-colors disabled:opacity-50"
                        title="Sync this product to WooCommerce"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingRow ? 'animate-spin text-blue-600' : ''}`} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteProduct(product)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
