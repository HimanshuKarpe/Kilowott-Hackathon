import React from 'react';
import { PublicationStatus, SyncStatus } from '../../types/product';
import { Check, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface PublicationBadgeProps {
  status: PublicationStatus;
  size?: 'sm' | 'md';
}

export const PublicationBadge: React.FC<PublicationBadgeProps> = ({ status, size = 'sm' }) => {
  const configs = {
    published: {
      label: 'Published',
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-600',
    },
    draft: {
      label: 'Draft',
      classes: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-600',
    },
    archived: {
      label: 'Archived',
      classes: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
    },
  };

  const config = configs[status] || configs.draft;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${padding} ${config.classes}`}
      title={`Merchandising Status: ${config.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

interface SyncStatusBadgeProps {
  status: SyncStatus;
  wooCommerceId?: number | null;
  size?: 'sm' | 'md';
  onClick?: () => void;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  status,
  wooCommerceId,
  size = 'sm',
  onClick,
}) => {
  const configs = {
    synced: {
      label: 'Synced',
      icon: <Check className="w-3.5 h-3.5 text-emerald-600" />,
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    pending_sync: {
      label: 'Pending Sync',
      icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
      classes: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    sync_error: {
      label: 'Sync Failed',
      icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600" />,
      classes: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    syncing: {
      label: 'Syncing...',
      icon: <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />,
      classes: 'bg-blue-50 text-blue-800 border-blue-200',
    },
  };

  const config = configs[status] || configs.pending_sync;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${padding} ${config.classes} ${
        onClick ? 'cursor-pointer hover:bg-slate-100' : ''
      }`}
      title={
        wooCommerceId
          ? `WooCommerce Remote Entity ID: #${wooCommerceId}`
          : `Sync Integration Status: ${config.label}`
      }
    >
      {config.icon}
      <span>{config.label}</span>
      {wooCommerceId && status === 'synced' && (
        <span className="font-mono text-[10px] text-emerald-900 bg-white/90 px-1.5 py-0.5 rounded border border-emerald-300 font-semibold">
          #{wooCommerceId}
        </span>
      )}
    </span>
  );
};

interface CompletenessBadgeProps {
  score: number;
  isComplete: boolean;
  size?: 'sm' | 'md';
}

export const CompletenessBadge: React.FC<CompletenessBadgeProps> = ({ score }) => {
  let barColor = 'bg-rose-500';
  let textColor = 'text-rose-700';
  if (score >= 75) {
    barColor = 'bg-emerald-500';
    textColor = 'text-emerald-700';
  } else if (score >= 50) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-700';
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-xs"
      title={`Data Quality Score: ${score}% Complete`}
    >
      <div className="w-8 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`font-mono font-semibold ${textColor}`}>{score}%</span>
    </div>
  );
};
