import React from 'react';
import { Product } from '../../types/product';
import { PublicationBadge, SyncStatusBadge, CompletenessBadge } from '../common/Badge';
import { calculateCompleteness } from '../../domain/completeness';
import { Edit2, Trash2, RefreshCw, AlertCircle, Image as ImageIcon } from 'lucide-react';
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
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-surface-900/90 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 pl-4 pr-2 w-10">
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
                  className="rounded border-slate-700 text-brand-600 focus:ring-brand-500 bg-surface-950 cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-3 min-w-[240px]">Product / Category</th>
              <th className="py-3.5 px-3 min-w-[120px]">SKU</th>
              <th className="py-3.5 px-3 min-w-[110px]">Price</th>
              <th className="py-3.5 px-3 min-w-[100px]">Stock</th>
              <th className="py-3.5 px-3 min-w-[100px]">Status</th>
              <th className="py-3.5 px-3 min-w-[140px]">Sync State</th>
              <th className="py-3.5 px-3 min-w-[120px]">Completeness</th>
              <th className="py-3.5 pr-4 pl-3 text-right min-w-[110px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {products.map((product) => {
              const isSelected = selectedProductIds.includes(product.id);
              const isSyncingRow = activeSyncProductIds.includes(product.id);
              const comp = calculateCompleteness(product);

              return (
                <tr
                  key={product.id}
                  className={`hover:bg-surface-800/40 transition-colors ${
                    isSelected ? 'bg-brand-500/5' : ''
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-3.5 pl-4 pr-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectProduct(product.id)}
                      className="rounded border-slate-700 text-brand-600 focus:ring-brand-500 bg-surface-950 cursor-pointer"
                    />
                  </td>

                  {/* Product Details (Image, Name, Category) */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-950 border border-slate-700/60 overflow-hidden shrink-0 flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback on image load error
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="font-semibold text-white hover:text-brand-300 text-left truncate block max-w-[280px] transition-colors"
                          title={product.name}
                        >
                          {product.name}
                        </button>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-400 font-medium">
                            {product.category}
                          </span>
                          {product.attributes && product.attributes.length > 0 && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              • {product.attributes.length} attributes
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="py-3.5 px-3">
                    <span className="font-mono text-slate-300 bg-surface-950 px-2 py-0.5 rounded border border-slate-800 font-medium text-[11px]">
                      {product.sku}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-3 font-medium">
                    <div className="flex flex-col">
                      <span className="text-white font-mono font-semibold">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.regularPrice && product.regularPrice > product.price && (
                        <span className="text-[10px] text-slate-500 line-through font-mono">
                          ${product.regularPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Stock Quantity */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span
                        className={`font-semibold ${
                          product.stockQuantity === 0
                            ? 'text-rose-400'
                            : product.stockQuantity < 10
                            ? 'text-amber-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {product.stockQuantity}
                      </span>
                      {product.stockQuantity === 0 ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 font-sans">
                          Out
                        </span>
                      ) : product.stockQuantity < 10 ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-sans">
                          Low
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {/* Publication Status */}
                  <td className="py-3.5 px-3">
                    <PublicationBadge status={product.publicationStatus} size="sm" />
                  </td>

                  {/* Sync Status */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col gap-1 items-start">
                      <SyncStatusBadge
                        status={isSyncingRow ? 'syncing' : product.syncStatus}
                        wooCommerceId={product.wooCommerceId}
                        size="sm"
                      />
                      {product.lastSyncError && (
                        <span
                          className="text-[10px] text-rose-400/90 flex items-center gap-1 max-w-[150px] truncate"
                          title={product.lastSyncError}
                        >
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span className="truncate">{product.lastSyncError}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Completeness */}
                  <td className="py-3.5 px-3">
                    <CompletenessBadge
                      score={comp.score}
                      isComplete={comp.isComplete}
                      size="sm"
                    />
                  </td>

                  {/* Row Actions */}
                  <td className="py-3.5 pr-4 pl-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Quick Sync */}
                      <button
                        onClick={() => syncSingleProduct(product.id)}
                        disabled={isSyncingRow}
                        className="p-1.5 text-slate-400 hover:text-brand-300 rounded-lg hover:bg-surface-800 transition-colors disabled:opacity-50"
                        title="Sync this product to WooCommerce"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingRow ? 'animate-spin text-brand-400' : ''}`} />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEditProduct(product)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-800 transition-colors"
                        title="Edit product details & attributes"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteProduct(product)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-surface-800 transition-colors"
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
