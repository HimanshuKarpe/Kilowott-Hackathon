import React from 'react';
import { RefreshCw, CheckCircle, FileText, Trash2, X } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { Button } from '../common/Button';

interface BatchActionToolbarProps {
  onOpenBatchDeleteConfirm: () => void;
}

export const BatchActionToolbar: React.FC<BatchActionToolbarProps> = ({
  onOpenBatchDeleteConfirm,
}) => {
  const {
    selectedProductIds,
    clearSelection,
    syncSelectedProducts,
    batchUpdatePublicationStatus,
    isSyncing,
  } = useCatalog();

  if (selectedProductIds.length === 0) return null;

  return (
    <div className="sticky top-16 z-30 p-3 rounded-xl bg-white border border-slate-300 shadow-lg flex flex-wrap items-center justify-between gap-3 animate-dialog">
      <div className="flex items-center gap-2.5">
        <span className="flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono font-bold text-xs">
          {selectedProductIds.length}
        </span>
        <span className="text-sm font-medium text-slate-800">
          {selectedProductIds.length === 1 ? '1 product selected' : `${selectedProductIds.length} products selected`}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={syncSelectedProducts}
          isLoading={isSyncing}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Sync to WooCommerce
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => batchUpdatePublicationStatus(selectedProductIds, 'published')}
          icon={<CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
        >
          Publish
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => batchUpdatePublicationStatus(selectedProductIds, 'draft')}
          icon={<FileText className="w-3.5 h-3.5 text-amber-600" />}
        >
          Draft
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={onOpenBatchDeleteConfirm}
          icon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Delete
        </Button>

        <button
          onClick={clearSelection}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
