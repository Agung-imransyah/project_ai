import { PermitApplication } from '../../types';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '../../lib/utils';
import { Search, FileText, ChevronRight, Archive } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../common/Button';

interface PermitListProps {
  permits: PermitApplication[];
  isAdmin?: boolean;
  onAction?: (permit: PermitApplication) => void;
}

export function PermitList({ permits, isAdmin, onAction }: PermitListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filteredPermits = permits.filter(p => {
    const matchesSearch = 
      p.typeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.userDisplayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || p.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
          {isAdmin ? <Archive className="w-5 h-5 text-burgundy" /> : <FileText className="w-5 h-5 text-burgundy" />}
          {isAdmin ? 'Kelola Seluruh Surat' : 'Riwayat Pengajuan'}
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text"
              placeholder="Cari surat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-burgundy w-full md:w-64"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-burgundy"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm flex flex-col">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-serif font-bold italic text-xl">
            {isAdmin ? 'Direktori Arsip Surat' : 'Riwayat Pengajuan Terkini'}
          </h3>
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-burgundy/20"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-burgundy/20"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-burgundy/20"></div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
              <tr className="border-b border-gray-100">
                <th className="px-8 py-5">Nomor Surat / Tanggal</th>
                <th className="px-8 py-5">{isAdmin ? 'Pengaju' : 'Informasi'}</th>
                <th className="px-8 py-5">Kategori</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredPermits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-zinc-300 font-serif italic text-lg">
                    Belum ada rekaman surat tersimpan...
                  </td>
                </tr>
              ) : (
                filteredPermits.map((permit) => (
                  <tr key={permit.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-mono text-[10px] text-zinc-300 mb-1">JN-SURAT-{permit.id.slice(-4).toUpperCase()}</div>
                      <div className="text-zinc-600 font-semibold">{formatDate(permit.createdAt?.toDate?.() || new Date())}</div>
                    </td>
                    <td className="px-8 py-5">
                      {isAdmin ? (
                        <div>
                          <div className="font-serif font-bold text-zinc-900 group-hover:text-burgundy transition-colors">{permit.userDisplayName}</div>
                          <div className="text-[10px] font-mono text-zinc-400">{permit.userEmail.toUpperCase()}</div>
                        </div>
                      ) : (
                        <div className="max-w-xs truncate text-zinc-500 italic">
                          {Object.values(permit.data).join(' • ')}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5 font-serif italic font-bold text-zinc-900">
                      {permit.typeName}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <StatusBadge status={permit.status} />
                    </td>
                    <td className="px-8 py-5 text-right">
                      {isAdmin ? (
                        <button 
                          onClick={() => onAction?.(permit)}
                          className="px-4 py-2 border border-burgundy/20 text-burgundy rounded-full text-[10px] font-bold tracking-widest hover:bg-burgundy hover:text-white transition-all cursor-pointer"
                        >
                          TINJAU ARSIP
                        </button>
                      ) : (
                        <button className="w-10 h-10 flex items-center justify-center hover:bg-burgundy/5 rounded-full text-zinc-300 hover:text-burgundy transition-all cursor-pointer">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
