import { useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { UserProfile, PermitApplication, Notification, PermitStatus } from './types';
import { Navbar } from './components/layout/Navbar';
import { PermitForm } from './components/permits/PermitForm';
import { PermitList } from './components/permits/PermitList';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { NotificationList } from './components/notifications/NotificationList';
import { Button } from './components/common/Button';
import { permitService } from './services/permitService';
import { ShieldCheck, Send, History, LayoutDashboard, Plus, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'admin' | 'submit'>('home');
  const [permits, setPermits] = useState<PermitApplication[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<PermitApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Sync Profile
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          let userRole: 'admin' | 'user' = 'user';
          
          if (firebaseUser.email === 'agungimransyah@gmail.com') {
            userRole = 'admin';
          }

          if (!userDoc.exists()) {
            const newProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'User',
              role: userRole,
              photoURL: firebaseUser.photoURL || ''
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            setProfile(newProfile as UserProfile);
          } else {
            setProfile(userDoc.data() as UserProfile);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth sync error:", error);
        setLoginError("Terjadi kesalahan saat memuat profil. Silakan muat ulang halaman.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user || !profile) return;

    let unsubscribePermits: () => void;
    if (profile.role === 'admin') {
      unsubscribePermits = permitService.subscribeToAdminPermits(setPermits);
    } else {
      unsubscribePermits = permitService.subscribeToUserPermits(user.uid, setPermits);
    }

    const unsubscribeNotifications = permitService.subscribeToNotifications(user.uid, setNotifications);

    return () => {
      unsubscribePermits();
      unsubscribeNotifications();
    };
  }, [user, profile]);

  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoginError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/popup-blocked') {
        setLoginError('Jendela login terblokir. Mohon izinkan popup di browser Anda.');
      } else {
        setLoginError('Gagal login. Silakan coba kembali.');
      }
    }
  };

  const handlePermitSubmit = async (typeId: string, typeName: string, data: any) => {
    if (!user) return;
    await permitService.submitPermit({
      userId: user.uid,
      userDisplayName: user.displayName || 'Anonymous',
      userEmail: user.email || '',
      typeId,
      typeName,
      data
    });
    setActiveTab('history');
  };

  const handleUpdateStatus = async (status: PermitStatus) => {
    if (!selectedPermit) return;
    await permitService.updatePermitStatus(selectedPermit.id, selectedPermit.userId, status, adminNotes);
    
    // Trigger email notification if approved
    if (status === 'approved') {
      try {
        const response = await fetch('/api/send-approval-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            permit: selectedPermit,
            userEmail: selectedPermit.userEmail,
            userName: selectedPermit.userDisplayName
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Email API failure:", errorData);
          alert("Surat disetujui, namun GAGAL mengirim email notifikasi. Pastikan konfigurasi SMTP di menu Secrets sudah benar.");
        } else {
          console.log("Email sent successfully!");
        }
      } catch (error) {
        console.error("Failed to initiate email process:", error);
      }
    }

    setSelectedPermit(null);
    setAdminNotes('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-burgundy border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-2">
            <div className="bg-burgundy w-20 h-20 rounded-2xl flex items-center justify-center mx-auto shadow-xl transform rotate-3">
              <span className="text-white font-bold text-4xl italic">N</span>
            </div>
            <h1 className="text-4xl font-black text-burgundy tracking-tight">NUANSA</h1>
            <p className="text-zinc-500 font-medium uppercase tracking-[0.3em] text-sm">Sistem Surat Ijin Online</p>
          </div>
          
          <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Selamat Datang</h2>
            <p className="text-zinc-600 text-sm mb-8 leading-relaxed">
              Masuk dengan akun Google Anda untuk mulai mengajukan atau memantau status surat ijin.
            </p>
            
            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold">
                {loginError}
              </div>
            )}

            <Button 
              onClick={handleLogin} 
              className="w-full gap-3 py-4 shadow-burgundy/20 shadow-lg text-lg"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5 pointer-events-none" alt="" />
              Masuk dengan Google
            </Button>
          </div>
          
          <p className="text-zinc-400 text-xs">
            &copy; 2024 Jurnalis Nuansa. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#fdfcfc] font-sans text-[#1a1a1a]">
      {/* SIDEBAR */}
      <aside className="w-[280px] h-full bg-burgundy flex flex-col p-8 text-white relative overflow-hidden shrink-0">
        <div className="absolute top-[-50px] left-[-50px] w-[200px] h-[200px] bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="mb-12 relative z-10">
          <div className="text-3xl font-serif italic font-bold leading-none tracking-tight mb-2">
            Jurnalis<br/>Nuansa
          </div>
          <div className="h-1 w-12 bg-white/40 mb-10"></div>
          
          <nav className="space-y-6">
            <button 
              onClick={() => setActiveTab('home')}
              className={cn(
                "flex items-center space-x-3 transition-opacity group w-full text-left cursor-pointer",
                activeTab === 'home' ? "opacity-100" : "opacity-60 hover:opacity-100"
              )}
            >
              <div className={cn("w-2 h-2 rotate-45 transition-all", activeTab === 'home' ? "bg-white" : "border border-white")}></div>
              <span className="font-bold tracking-widest text-[11px]">DASHBOARD</span>
            </button>

            {profile?.role === 'admin' ? (
              <button 
                onClick={() => setActiveTab('admin')}
                className={cn(
                  "flex items-center space-x-3 transition-opacity group w-full text-left cursor-pointer",
                  activeTab === 'admin' ? "opacity-100" : "opacity-60 hover:opacity-100"
                )}
              >
                <div className={cn("w-2 h-2 rotate-45 transition-all", activeTab === 'admin' ? "bg-white" : "border border-white")}></div>
                <span className="font-bold tracking-widest text-[11px]">KELOLA SURAT</span>
              </button>
            ) : (
              <button 
                onClick={() => setActiveTab('submit')}
                className={cn(
                  "flex items-center space-x-3 transition-opacity group w-full text-left cursor-pointer",
                  activeTab === 'submit' ? "opacity-100" : "opacity-60 hover:opacity-100"
                )}
              >
                <div className={cn("w-2 h-2 rotate-45 transition-all", activeTab === 'submit' ? "bg-white" : "border border-white")}></div>
                <span className="font-bold tracking-widest text-[11px]">PENGAJUAN</span>
              </button>
            )}

            <button 
              onClick={() => setActiveTab('history')}
              className={cn(
                "flex items-center space-x-3 transition-opacity group w-full text-left cursor-pointer",
                activeTab === 'history' ? "opacity-100" : "opacity-60 hover:opacity-100"
              )}
            >
              <div className={cn("w-2 h-2 rotate-45 transition-all", activeTab === 'history' ? "bg-white" : "border border-white")}></div>
              <span className="font-bold tracking-widest text-[11px]">
                {profile?.role === 'admin' ? 'ARSIP SURAT' : 'RIWAYAT SAYA'}
              </span>
            </button>
          </nav>
        </div>

        <div className="mt-auto relative z-10 transition-all">
          <div className="p-4 bg-white/10 rounded-xl border border-white/10">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1 opacity-60">
              {profile?.role === 'admin' ? 'Logged as Admin' : 'Logged as Student'}
            </div>
            <div className="font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              {user.displayName}
            </div>
            <div className="text-[10px] font-mono opacity-50 mt-1 uppercase">ID: JN-2024-{user.uid.slice(0, 3)}</div>
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="w-full mt-4 flex items-center gap-2 px-4 py-2 text-[10px] font-bold tracking-widest uppercase opacity-40 hover:opacity-100 hover:text-red-400 transition-all cursor-pointer"
          >
            <X className="w-3 h-3" /> Logout Account
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 border-b border-burgundy/10 flex items-center justify-between px-10 bg-white/50 backdrop-blur-md sticky top-0 z-20 shrink-0">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-serif italic font-bold text-burgundy">Portal Perijinan Mandiri</h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
              >
                <Search className="w-5 h-5 opacity-40" />
              </button>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-5 h-5 opacity-40" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white ring-4 ring-red-500/20"></div>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <div className="absolute right-0 top-full">
                    <NotificationList 
                      notifications={notifications} 
                      onClose={() => setShowNotifications(false)} 
                    />
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10">
          {activeTab === 'home' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="bg-burgundy p-10 rounded-[40px] text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <h2 className="text-4xl font-serif italic font-black mb-2 tracking-tight">Selamat Datang, {user.displayName}!</h2>
                  <p className="text-white/60 font-medium max-w-md text-sm uppercase tracking-[0.2em] mb-8">
                    {profile?.role === 'admin' 
                      ? 'Dashboard Administrasi Jurnalis Nuansa' 
                      : 'Layanan Mandiri Pengajuan Surat Jurnalis Nuansa'}
                  </p>
                  <Button 
                    onClick={() => setActiveTab(profile?.role === 'admin' ? 'admin' : 'submit')}
                    className="bg-white text-burgundy border-none hover:bg-zinc-100 rounded-2xl px-8 py-4 font-bold"
                  >
                    MULAI SEKARANG
                  </Button>
                </div>
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 translate-y-10" />
              </div>

              <AdminDashboard permits={permits} />
            </div>
          )}

          {activeTab === 'submit' && <PermitForm onSubmit={handlePermitSubmit} />}
          
          {activeTab === 'history' && (
            <PermitList 
              permits={permits} 
              isAdmin={profile?.role === 'admin'} 
              onAction={(permit) => setSelectedPermit(permit)}
            />
          )}

          {activeTab === 'admin' && (
            <PermitList 
              permits={permits.filter(p => p.status === 'pending')} 
              isAdmin 
              onAction={(permit) => setSelectedPermit(permit)}
            />
          )}
        </main>

        <footer className="h-12 bg-white border-t border-gray-100 flex items-center justify-between px-10 text-[10px] text-gray-400 font-bold uppercase tracking-widest shrink-0">
          <div>© 2024 JURNALIS NUANSA INTEGRATED SYSTEM</div>
          <div className="flex space-x-6">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> STABILITAS: 99.9%</span>
            <span>LATENCY: 24MS</span>
          </div>
        </footer>
      </div>

      {/* Admin Review Modal */}
      <AnimatePresence>
        {selectedPermit && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPermit(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-2xl relative shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="bg-zinc-50 px-8 py-6 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif italic font-bold text-zinc-900">Tinjau Pengajuan</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                    SURAT KELUAR: #{selectedPermit.id.slice(-6).toUpperCase()}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedPermit(null)}
                  className="p-2 hover:bg-zinc-200 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Nama Pengaju</label>
                    <p className="font-serif italic font-bold text-zinc-900 text-xl">{selectedPermit.userDisplayName}</p>
                    <p className="text-xs font-mono text-zinc-400 uppercase">{selectedPermit.userEmail}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Kategori Ijin</label>
                    <p className="font-serif italic font-bold text-zinc-900 text-xl">{selectedPermit.typeName}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border-l-4 border-burgundy shadow-sm">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-4">Detail Persyaratan</label>
                  <div className="space-y-4">
                    {Object.entries(selectedPermit.data).map(([key, value]) => (
                      <div key={key} className="flex flex-col border-b border-zinc-50 pb-2">
                        <span className="text-[10px] font-bold text-zinc-900 uppercase opacity-40">{key}</span>
                        <span className="text-zinc-700 leading-relaxed font-semibold italic">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Catatan Validasi Admin</label>
                  <textarea 
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Masukkan alasan validasi..."
                    className="w-full px-4 py-4 rounded-2xl border border-zinc-100 bg-zinc-50 focus:outline-none focus:bg-white focus:ring-4 focus:ring-burgundy/5 focus:border-burgundy h-24 transition-all text-sm italic"
                  />
                </div>
              </div>

              <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-2xl border-none bg-zinc-200 text-zinc-600 hover:bg-rose-100 hover:text-rose-600 font-bold"
                  onClick={() => handleUpdateStatus('rejected')}
                >
                  TOLAK
                </Button>
                <Button 
                  className="flex-1 rounded-2xl bg-burgundy hover:bg-burgundy-light font-bold"
                  onClick={() => handleUpdateStatus('approved')}
                >
                  SETUJUI & KIRIM
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
