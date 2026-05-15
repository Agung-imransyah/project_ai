import { User } from 'firebase/auth';
import { Bell, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { Button } from '../common/Button';
import { Notification } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface NavbarProps {
  user: User | null;
  isAdmin: boolean;
  notifications: Notification[];
  onOpenNotifications: () => void;
}

export function Navbar({ user, isAdmin, notifications, onOpenNotifications }: NavbarProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-burgundy w-8 h-8 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg italic">N</span>
            </div>
            <div>
              <span className="font-bold text-xl text-burgundy tracking-tight">NUANSA</span>
              <span className="text-xs block -mt-1 text-zinc-500 font-medium uppercase tracking-widest">Jurnalis</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <button 
                  onClick={onOpenNotifications}
                  className="relative p-2 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-burgundy text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white leading-none">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                <div className="flex items-center gap-3 pl-4 border-l border-zinc-200">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-zinc-900 leading-none">{user.displayName}</p>
                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-tighter mt-1 flex items-center justify-end gap-1">
                      {isAdmin ? <><Shield className="w-2 h-2" /> Admin</> : 'Mahasiswa'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center border border-burgundy/20 overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-burgundy" />
                    )}
                  </div>
                  <button 
                    onClick={() => auth.signOut()}
                    className="p-2 text-zinc-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                    title="Keluar"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
