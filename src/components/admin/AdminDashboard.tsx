import { PermitApplication } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { LayoutDashboard, Users, FileCheck, FileX, Clock } from 'lucide-react';

interface AdminDashboardProps {
  permits: PermitApplication[];
}

export function AdminDashboard({ permits }: AdminDashboardProps) {
  const stats = {
    total: permits.length,
    pending: permits.filter(p => p.status === 'pending').length,
    approved: permits.filter(p => p.status === 'approved').length,
    rejected: permits.filter(p => p.status === 'rejected').length,
  };

  const chartData = [
    { name: 'Menunggu', value: stats.pending, color: '#EAB308' },
    { name: 'Disetujui', value: stats.approved, color: '#22C55E' },
    { name: 'Ditolak', value: stats.rejected, color: '#EF4444' },
  ];

  const typeData = permits.reduce((acc, p) => {
    acc[p.typeName] = (acc[p.typeName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(typeData).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-2">
        <LayoutDashboard className="w-6 h-6 text-burgundy" />
        <h2 className="text-2xl font-bold text-zinc-900">Statistik Pengajuan</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Menunggu Persetujuan', value: stats.pending, icon: Clock, color: 'text-burgundy', borderColor: 'border-burgundy' },
          { label: 'Telah Disetujui', value: stats.approved, icon: FileCheck, color: 'text-emerald-600', borderColor: 'border-emerald-500' },
          { label: 'Ditolak', value: stats.rejected, icon: FileX, color: 'text-rose-600', borderColor: 'border-rose-500' },
          { label: 'Total Arsip', value: stats.total, icon: Users, color: 'text-amber-600', borderColor: 'border-amber-500' },
        ].map((item, i) => (
          <div key={i} className={`bg-white border-l-4 ${item.borderColor} p-6 shadow-sm rounded-r-2xl flex flex-col justify-between`}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{item.label}</p>
              <h4 className={`text-4xl font-serif font-black ${item.color}`}>{item.value.toString().padStart(2, '0')}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-6">Status Distribusi</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {chartData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs font-bold text-zinc-600">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-6">Jenis Surat Terpopuler</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#800020" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
