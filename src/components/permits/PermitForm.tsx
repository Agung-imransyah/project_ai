import { useState } from 'react';
import { PermitType, Requirement } from '../../types';
import { Button } from '../common/Button';
import { FileText, Send, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const PERMIT_TYPES: PermitType[] = [
  {
    id: 'kegiatan',
    name: 'Surat Ijin Kegiatan',
    description: 'Untuk permohonan ijin mengadakan acara atau kegiatan organisasi.',
    requirements: [
      { id: 'title', label: 'Nama Kegiatan', type: 'text', required: true },
      { id: 'date', label: 'Tanggal Pelaksanaan', type: 'text', required: true },
      { id: 'location', label: 'Lokasi', type: 'text', required: true },
      { id: 'description', label: 'Deskripsi Singkat', type: 'text', required: true },
    ]
  },
  {
    id: 'alat',
    name: 'Surat Ijin Peminjaman Alat',
    description: 'Untuk meminjam inventaris atau alat-alat nuansa.',
    requirements: [
      { id: 'tools', label: 'Alat yang Dipinjam', type: 'text', required: true },
      { id: 'duration', label: 'Lama Peminjaman (hari)', type: 'text', required: true },
      { id: 'purpose', label: 'Tujuan Pemakaian', type: 'text', required: true },
    ]
  },
  {
    id: 'peliputan',
    name: 'Surat Ijin Peliputan',
    description: 'Untuk ijin meliput suatu event atau berita.',
    requirements: [
      { id: 'event', label: 'Nama Event/Berita', type: 'text', required: true },
      { id: 'date', label: 'Waktu Peliputan', type: 'text', required: true },
      { id: 'location', label: 'Lokasi Peliputan', type: 'text', required: true },
    ]
  }
];

interface PermitFormProps {
  onSubmit: (typeId: string, typeName: string, data: any) => Promise<void>;
}

export function PermitForm({ onSubmit }: PermitFormProps) {
  const [selectedType, setSelectedType] = useState<PermitType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedType.id, selectedType.name, formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedType(null);
        setFormData({});
      }, 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 border border-green-200 p-8 rounded-xl text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-green-900 mb-2">Pengajuan Berhasil!</h3>
        <p className="text-green-700">Surat ijin Anda telah dikirim dan menunggu tinjauan admin.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-zinc-100/50 p-10 rounded-[32px] border border-gray-100">
        <h3 className="text-2xl font-serif italic font-bold text-burgundy mb-6 flex items-center gap-3">
          <FileText className="w-6 h-6" />
          Kategori Surat
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PERMIT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setSelectedType(type);
                setFormData({});
              }}
              className={cn(
                "group p-8 rounded-3xl border-2 text-left transition-all cursor-pointer relative overflow-hidden",
                selectedType?.id === type.id 
                  ? "border-burgundy bg-burgundy text-white shadow-2xl" 
                  : "border-transparent bg-white hover:border-burgundy/20 hover:shadow-xl shadow-sm"
              )}
            >
              <div className={cn(
                "absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-2xl opacity-20 transition-all group-hover:scale-150",
                selectedType?.id === type.id ? "bg-white" : "bg-burgundy"
              )} />
              <h4 className={cn("font-serif italic font-bold text-xl relative z-10", selectedType?.id === type.id ? "text-white" : "text-zinc-900")}>
                {type.name}
              </h4>
              <p className={cn("text-xs mt-2 relative z-10 font-medium leading-relaxed opacity-60", selectedType?.id === type.id ? "text-white/80" : "text-zinc-500")}>
                {type.description}
              </p>
              <div className={cn(
                "mt-6 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest relative z-10",
                selectedType?.id === type.id ? "text-white" : "text-burgundy"
              )}>
                Pilih Kategori <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedType && (
          <motion.form
            key={selectedType.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleSubmit}
            className="bg-burgundy p-12 rounded-[48px] text-white shadow-2xl space-y-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="border-b border-white/10 pb-8 relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 mb-2 block">Formulir Pengajuan</span>
              <h3 className="text-3xl font-serif italic font-bold">{selectedType.name}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              {selectedType.requirements.map((req) => (
                <div key={req.id} className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-1">
                    {req.label}
                    {req.required && <span className="text-white">*</span>}
                  </label>
                  <input
                    type="text"
                    required={req.required}
                    value={formData[req.id] || ''}
                    onChange={(e) => handleInputChange(req.id, e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:bg-white/20 focus:ring-4 focus:ring-white/5 transition-all text-white placeholder:text-white/20"
                    placeholder={`Ketik ${req.label.toLowerCase()}...`}
                  />
                </div>
              ))}
            </div>

            <div className="p-6 bg-white/5 rounded-[24px] border border-white/10 flex items-start gap-4 relative z-10">
              <AlertCircle className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
              <p className="text-[10px] font-medium text-white/50 leading-relaxed uppercase tracking-wider">
                Sistem Jurnalis Nuansa menjamin kerahasiaan data. Pastikan semua persyaratan terpenuhi sebelum melakukan pengiriman (Submit). Informasi status akan dikirimkan melalui notifikasi portal dan email resmi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 relative z-10">
              <button 
                type="button" 
                onClick={() => setSelectedType(null)}
                className="px-8 py-4 text-[11px] font-bold tracking-widest uppercase opacity-40 hover:opacity-100 transition-all cursor-pointer"
                disabled={isSubmitting}
              >
                Batalkan
              </button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-white text-burgundy hover:bg-gray-100 rounded-[20px] px-12 py-4 font-black shadow-xl shadow-black/20 group"
              >
                {isSubmitting ? 'MEMPROSES...' : 'KIRIM PENGAJUAN'}
                <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
