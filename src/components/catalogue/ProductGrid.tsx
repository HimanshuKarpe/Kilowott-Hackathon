import React from 'react';
import { Product } from '../../types/product';
import { PublicationBadge, SyncStatusBadge, CompletenessBadge } from '../common/Badge';
import { calculateCompleteness } from '../../domain/completeness';
import { Edit2, Trash2, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';

interface ProductGridProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onEditProduct,
  onDeleteProduct,
}) => {
  const {
    selectedProductIds,
    toggleSelectProduct,
    syncSingleProduct,
    activeSyncProductIds,
  } = useCatalog();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => {
        const isSelected = selectedProductIds.includes(product.id);
        const isSyncingRow = activeSyncProductIds.includes(product.id);
        const comp = calculateCompleteness(product);

        return (
          <div
            key={product.id}
            className={`glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col justify-between border transition-all duration-200 ${
              isSelected ? 'border-brand-500 ring-1 ring-brand-500/50' : 'border-slate-800'
            }`}
          >
            {/* Card Header & Image */}
            <div className="relative h-44 bg-surface-950 flex items-center justify-center overflow-hidden border-b border-slate-800/80">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <ImageIcon className="w-10 h-10 text-slate-700" />
              )}

              {/* Multiselect Checkbox */}
              <div className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelectProduct(product.id)}
                  className="w-4 h-4 rounded border-slate-700 bg-surface-900/90 text-brand-600 focus:ring-brand-500 cursor-pointer shadow-md"
                />
              </div>

              {/* Status badges top right */}
              <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
                <PublicationBadge status={product.publicationStatus} size="sm" />
                <SyncStatusBadge
                  status={isSyncingRow ? 'syncing' : product.syncStatus}
                  wooCommerceId={product.wooCommerceId}
                  size="sm"
                />
              </div>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                  <span>{product.sku}</span>
                  <span className="text-slate-500">{product.category}</span>
                </div>

                <h3
                  onClick={() => onEditProduct(product)}
                  className="text-sm font-semibold text-white hover:text-brand-300 cursor-pointer line-clamp-1 transition-colors"
                  title={product.name}
                >
                  {product.name}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {product.description || <em className="text-slate-500 italic">No description provided.</em>}
                </p>
              </div>

              {/* Attributes Preview */}
              {product.attributes && product.attributes.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {product.attributes.slice(0, 3).map((attr) => (
                    <span
                      key={attr.id}
                      className="text-[10px] bg-surface-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md"
                    >
                      <strong className="text-slate-400">{attr.name}:</strong> {attr.value}
                    </span>
                  ))}
                  {product.attributes.length > 3 && (
                    <span className="text-[10px] text-slate-500 self-center">
                      +{product.attributes.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Pricing & Stock Row */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-base font-bold text-white font-mono">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.regularPrice && product.regularPrice > product.price && (
                    <span className="text-[11px] text-slate-500 line-through font-mono ml-1.5">
                      ${product.regularPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono">
                  <span
                    className={
                      product.stockQuantity === 0
                        ? 'text-rose-400 font-semibold'
                        : product.stockQuantity < 10
                        ? 'text-amber-400 font-semibold'
                        : 'text-slate-400'
                    }
                  >
                    {product.stockQuantity} in stock
                  </span>
                </div>
              </div>

              {/* Completeness bar */}
              <div className="flex items-center justify-between pt-1">
                <CompletenessBadge score={comp.score} isComplete={comp.isComplete} size="sm" />

                {/* Card Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => syncSingleProduct(product.id)}
                    disabled={isSyncingRow}
                    className="p-1.5 text-slate-400 hover:text-brand-300 rounded-lg hover:bg-surface-800 transition-colors disabled:opacity-50"
                    title="Sync to WooCommerce"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingRow ? 'animate-spin text-brand-400' : ''}`} />
                  </button>
                  <button
                    onClick={() => onEditProduct(product)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-800 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteProduct(product)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-surface-800 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
