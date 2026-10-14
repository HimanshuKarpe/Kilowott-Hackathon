import React from 'react';
import { PackageSearch, Plus, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onResetFilters?: () => void;
  onAddProduct?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No products found',
  description = 'Try adjusting your search terms, changing filters, or adding a new product to your catalogue.',
  onResetFilters,
  onAddProduct,
}) => {
  return (
    <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center max-w-md mx-auto my-8 border border-slate-800">
      <div className="w-16 h-16 rounded-2xl bg-surface-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <PackageSearch className="w-8 h-8" />
      </div>

      <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-400 mb-6 leading-relaxed">{description}</p>

      <div className="flex items-center gap-3">
        {onResetFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Clear Filters
          </Button>
        )}
        {onAddProduct && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAddProduct}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Product
          </Button>
        )}
      </div>
    </div>
  );
};
