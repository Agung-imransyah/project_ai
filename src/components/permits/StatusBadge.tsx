import { PermitStatus } from '../../types';
import { cn } from '../../lib/utils';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

export function StatusBadge({ status }: { status: PermitStatus }) {
  const styles = {
    pending: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    approved: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    rejected: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
  };

  const labels = {
    pending: 'PROSES VERIFIKASI',
    approved: 'TERVALIDASI',
    rejected: 'DITOLAK'
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-black border uppercase tracking-[0.2em] transition-all',
      styles[status]
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
      {labels[status]}
    </span>
  );
}
