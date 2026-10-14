import React from 'react';
import { Product } from '../../types/product';
import { PublicationBadge, SyncStatusBadge, CompletenessBadge } from '../common/Badge';
import { calculateCompleteness } from '../../domain/completeness';
import { Edit2, Trash2, RefreshCw } from 'lucide-react';
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
            className={`enterprise-card enterprise-card-hover overflow-hidden flex flex-col justify-between ${
              isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : ''
            }`}
          >
            {/* Card Header & Image */}
            <div className="relative h-44 bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-200">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <span className="text-2xl font-bold font-mono text-slate-400">
                    {product.name.slice(0, 2).toUpperCase() || 'SKU'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 uppercase font-medium">No Image Uploaded</span>
                </div>
              )}

              {/* Multiselect Checkbox */}
              <div className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelectProduct(product.id)}
                  className="w-4 h-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm"
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
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1.5">
                  <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                    {product.sku}
                  </span>
                  <span className="text-slate-500 truncate max-w-[130px] font-sans">{product.category}</span>
                </div>

                <h3
                  onClick={() => onEditProduct(product)}
                  className="text-sm font-semibold text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-1 transition-colors"
                  title={product.name}
                >
                  {product.name}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {product.description || <em className="text-slate-400 italic">No description provided.</em>}
                </p>
              </div>

              {/* Attributes Preview */}
              {product.attributes && product.attributes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.attributes.slice(0, 2).map((attr) => (
                    <span
                      key={attr.id}
                      className="text-[11px] bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded"
                    >
                      <strong className="text-slate-500 font-medium">{attr.name}:</strong> {attr.value}
                    </span>
                  ))}
                  {product.attributes.length > 2 && (
                    <span className="text-[11px] text-slate-400 self-center">
                      +{product.attributes.length - 2} more
                    </span>
                  )}
                </div>
              )}

              {/* Pricing & Stock Row */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-base font-bold text-[#0F172A] font-mono">
                    ₹{product.price.toFixed(2)}
                  </span>
                  {product.regularPrice && product.regularPrice > product.price && (
                    <span className="text-xs text-slate-400 line-through font-mono ml-1.5">
                      ₹{product.regularPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono">
                  <span
                    className={
                      product.stockQuantity === 0
                        ? 'text-rose-600 font-semibold'
                        : product.stockQuantity < 10
                        ? 'text-amber-600 font-semibold'
                        : 'text-slate-600'
                    }
                  >
                    {product.stockQuantity} in stock
                  </span>
                </div>
              </div>

              {/* Completeness & Actions */}
              <div className="flex items-center justify-between pt-1">
                <CompletenessBadge score={comp.score} isComplete={comp.isComplete} size="sm" />

                {/* Card Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => syncSingleProduct(product.id)}
                    disabled={isSyncingRow}
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100 transition-colors disabled:opacity-50"
                    title="Sync to WooCommerce"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingRow ? 'animate-spin text-blue-600' : ''}`} />
                  </button>
                  <button
                    onClick={() => onEditProduct(product)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteProduct(product)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
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
