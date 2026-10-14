import React from 'react';
import { PublicationStatus, SyncStatus } from '../../types/product';
import { Check, Clock, AlertOctagon, Loader2, FileText, CheckCircle2 } from 'lucide-react';

interface PublicationBadgeProps {
  status: PublicationStatus;
  size?: 'sm' | 'md';
}

export const PublicationBadge: React.FC<PublicationBadgeProps> = ({ status, size = 'md' }) => {
  const configs = {
    published: {
      label: 'Published',
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-400',
    },
    draft: {
      label: 'Draft',
      classes: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      dot: 'bg-amber-400',
    },
    archived: {
      label: 'Archived',
      classes: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      dot: 'bg-slate-400',
    },
  };

  const config = configs[status] || configs.draft;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${padding} ${config.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

interface SyncStatusBadgeProps {
  status: SyncStatus;
  wooCommerceId?: number | null;
  size?: 'sm' | 'md';
  onClick?: () => void;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ status, wooCommerceId, size = 'md', onClick }) => {
  const configs = {
    synced: {
      label: 'Synced',
      icon: <Check className="w-3 h-3 text-emerald-400" />,
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    },
    pending_sync: {
      label: 'Pending Sync',
      icon: <Clock className="w-3 h-3 text-amber-400" />,
      classes: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    },
    sync_error: {
      label: 'Sync Error',
      icon: <AlertOctagon className="w-3 h-3 text-rose-400" />,
      classes: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    },
    syncing: {
      label: 'Syncing...',
      icon: <Loader2 className="w-3 h-3 text-brand-400 animate-spin" />,
      classes: 'bg-brand-500/10 text-brand-300 border-brand-500/25 animate-pulse-subtle',
    },
  };

  const config = configs[status] || configs.pending_sync;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${padding} ${config.classes} ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      }`}
      title={wooCommerceId ? `WooCommerce Remote ID: #${wooCommerceId}` : undefined}
    >
      {config.icon}
      <span>{config.label}</span>
      {wooCommerceId && status === 'synced' && (
        <span className="text-[10px] opacity-75 font-mono">#{wooCommerceId}</span>
      )}
    </span>
  );
};

interface CompletenessBadgeProps {
  score: number;
  isComplete: boolean;
  size?: 'sm' | 'md';
}

export const CompletenessBadge: React.FC<CompletenessBadgeProps> = ({ score, isComplete, size = 'md' }) => {
  let color = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  if (score >= 80) {
    color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  } else if (score >= 60) {
    color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${padding} ${color}`}
      title={isComplete ? 'Product information is complete for WooCommerce' : 'Incomplete product fields'}
    >
      {isComplete ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <FileText className="w-3 h-3 shrink-0" />}
      <span>{score}% Data Quality</span>
    </span>
  );
};
