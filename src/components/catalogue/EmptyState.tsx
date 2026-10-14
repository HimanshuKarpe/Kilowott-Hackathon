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
  description = 'Try adjusting your search query, changing active filters, or adding a new product to your catalogue.',
  onResetFilters,
  onAddProduct,
}) => {
  return (
    <div className="enterprise-card p-12 flex flex-col items-center justify-center text-center max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mb-4">
        <PackageSearch className="w-7 h-7 text-slate-400" />
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-sm">{description}</p>

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
            New Product
          </Button>
        )}
      </div>
    </div>
  );
};
