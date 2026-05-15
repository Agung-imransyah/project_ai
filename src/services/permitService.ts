import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { PermitApplication, PermitStatus, Notification } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const permitService = {
  async submitPermit(permitData: Partial<PermitApplication>) {
    const path = 'permits';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...permitData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        archived: false
      });
      
      // Notify Admin
      await this.createNotification({
        userId: 'admin_all',
        message: `Pengajuan surat ijin baru dari ${permitData.userDisplayName} (${permitData.typeName})`,
        type: 'new_permit',
        read: false,
        permitId: docRef.id,
        createdAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updatePermitStatus(permitId: string, userId: string, status: PermitStatus, adminNotes?: string) {
    const path = `permits/${permitId}`;
    try {
      await updateDoc(doc(db, 'permits', permitId), {
        status,
        adminNotes,
        updatedAt: serverTimestamp(),
        archived: status !== 'pending'
      });
      
      // Notify User
      await this.createNotification({
        userId,
        message: `Status pengajuan (${permitId}) Anda telah diubah menjadi: ${status === 'approved' ? 'Disetujui' : 'Ditolak'}`,
        type: 'status_change',
        read: false,
        permitId,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async createNotification(notification: any) {
    const path = 'notifications';
    try {
      await addDoc(collection(db, path), notification);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  subscribeToUserPermits(userId: string, callback: (permits: PermitApplication[]) => void) {
    const q = query(
      collection(db, 'permits'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const permits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PermitApplication));
      callback(permits);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'permits');
    });
  },

  subscribeToAdminPermits(callback: (permits: PermitApplication[]) => void) {
    const q = query(
      collection(db, 'permits'),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const permits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PermitApplication));
      callback(permits);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'permits');
    });
  },

  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', [userId, 'admin_all']),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      callback(notifications);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });
  }
};
