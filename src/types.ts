export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
}

export type PermitStatus = 'pending' | 'approved' | 'rejected';

export interface Requirement {
  id: string;
  label: string;
  type: 'text' | 'file' | 'checkbox';
  required: boolean;
  value?: any;
}

export interface PermitType {
  id: string;
  name: string;
  description: string;
  requirements: Requirement[];
}

export interface PermitApplication {
  id: string;
  userId: string;
  userDisplayName: string;
  userEmail: string;
  typeId: string;
  typeName: string;
  status: PermitStatus;
  data: Record<string, any>;
  createdAt: any;
  updatedAt: any;
  archived: boolean;
  adminNotes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'status_change' | 'new_permit' | 'system';
  read: boolean;
  permitId?: string;
  createdAt: any;
}
