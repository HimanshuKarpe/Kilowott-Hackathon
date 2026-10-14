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
    <div className="sticky top-20 z-30 p-3 rounded-2xl bg-brand-950/95 border border-brand-500/40 backdrop-blur-xl shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-slideIn">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-500 text-white font-bold text-xs">
          {selectedProductIds.length}
        </span>
        <span className="text-xs font-semibold text-white">
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
          icon={<CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
        >
          Publish
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => batchUpdatePublicationStatus(selectedProductIds, 'draft')}
          icon={<FileText className="w-3.5 h-3.5 text-amber-400" />}
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
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors ml-1"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
