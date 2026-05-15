import { Notification } from '../../types';
import { formatDate } from '../../lib/utils';
import { Bell, Mail, Info, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface NotificationListProps {
  notifications: Notification[];
  onClose: () => void;
}

export function NotificationList({ notifications, onClose }: NotificationListProps) {
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden z-[100]">
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-burgundy/5">
        <h3 className="font-bold text-burgundy flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notifikasi
        </h3>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest cursor-pointer hover:text-burgundy" onClick={onClose}>Tutup</span>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 italic text-sm">
            Belum ada notifikasi
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {notifications.map((n) => (
              <motion.div 
                key={n.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 hover:bg-zinc-50 transition-colors flex gap-3 ${!n.read ? 'bg-burgundy/5' : ''}`}
              >
                <div className="mt-1">
                  {n.type === 'status_change' ? (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <Mail className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Info className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-zinc-900 leading-snug">{n.message}</p>
                  <p className="text-[10px] text-zinc-400 mt-1 font-medium italic">
                    {formatDate(n.createdAt?.toDate?.() || new Date())}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <div className="p-3 bg-zinc-50 border-t border-zinc-100 text-center">
        <button className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-burgundy transition-colors cursor-pointer">
          Tandai semua dibaca
        </button>
      </div>
    </div>
  );
}
