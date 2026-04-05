import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  Timestamp,
  getDocs,
  where,
  runTransaction,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Tenant {
  id?: string;
  name: string;
  subdomain: string;
  ownerEmail: string;
  email?: string;
  address?: string;
  phone?: string;
  panNo?: string;
  registrationNo?: string;
  plan: 'Basic' | 'Pro' | 'Enterprise';
  status: 'Active' | 'Suspended' | 'Trial' | 'Pending Approval';
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  calendarType?: 'Indian' | 'Nepali';
  currency?: 'INR' | 'NPR';
  invoiceCounter?: number;
  sampleInvoiceCounter?: number;
  lastInvoiceMonth?: string;
  lastInvoiceYear?: number;
  lastSampleInvoiceMonth?: string;
  lastSampleInvoiceYear?: number;
  planExpiry?: any;
  razorpaySubscriptionId?: string;
  paymentStatus?: 'Paid' | 'Unpaid' | 'Pending';
  createdAt: any;
}

export interface Doctor {
  id?: string;
  tenantId: string;
  name: string;
  clinicName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: any;
}

export interface Case {
  id?: string;
  tenantId: string;
  doctorId: string;
  doctorName?: string;
  patientName: string;
  toothNumber: string;
  caseType: string;
  status: 'Received' | 'In Progress' | 'Ready' | 'Delivered';
  dueDate: any;
  deliveryDate?: any;
  materials?: string;
  technique?: string;
  shade?: string;
  quantity?: number;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  price: number;
  notes?: string;
  patientAge?: number;
  patientGender?: string;
  createdAt: any;
}

// Generic error handler as per instructions
const handleFirestoreError = (error: any, operation: string, path: string) => {
  const errInfo = {
    error: error.message || String(error),
    operation,
    path,
    timestamp: new Date().toISOString()
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

export interface UserProfile {
  uid: string;
  tenantId?: string;
  role: 'super_admin' | 'admin' | 'doctor';
  status: 'pending' | 'approved' | 'rejected';
  entityId?: string;
  email: string;
  name?: string;
  clinicName?: string;
  phone?: string;
  address?: string;
  specialization?: string;
  requestedAt?: any;
  approvedAt?: any;
}

export interface GlobalStats {
  totalLabs: number;
  totalRevenue: number;
  totalCases: number;
  totalDoctors: number;
  revenueByMonth: { month: string; amount: number }[];
  labsByMonth: { month: string; count: number }[];
  topTenants: { name: string; revenue: number; cases: number }[];
}

export interface Invitation {
  id?: string;
  email: string;
  tenantId: string;
  role: 'doctor' | 'admin';
  status: 'pending' | 'accepted' | 'expired';
  token: string;
  invitedBy: string;
  expiresAt: any;
  createdAt: any;
}

export interface InventoryItem {
  id?: string;
  tenantId: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minThreshold: number;
  costPerUnit: number;
  supplier: string;
  lastRestocked?: any;
  updatedAt: any;
}

export interface MaterialUsage {
  id?: string;
  tenantId: string;
  caseId: string;
  itemId: string;
  itemName?: string;
  quantityUsed: number;
  timestamp: any;
}

export interface Expense {
  id?: string;
  tenantId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  notes?: string;
  createdAt: any;
}

// Tenants
export const createTenant = async (tenant: Omit<Tenant, 'id' | 'createdAt'>) => {
  try {
    return await addDoc(collection(db, 'tenants'), {
      ...tenant,
      createdAt: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, 'create', 'tenants');
  }
};

export const getTenant = async (tenantId: string): Promise<Tenant | null> => {
  try {
    const { getDoc } = await import('firebase/firestore');
    const docRef = doc(db, 'tenants', tenantId);
    const tenantDoc = await getDoc(docRef);
    if (tenantDoc.exists()) {
      return { id: tenantDoc.id, ...tenantDoc.data() } as Tenant;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, 'get', `tenants/${tenantId}`);
    return null;
  }
};

export const updateTenant = async (tenantId: string, data: Partial<Tenant>) => {
  try {
    const docRef = doc(db, 'tenants', tenantId);
    return await updateDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, 'update', `tenants/${tenantId}`);
  }
};

export const updateTenantBranding = async (tenantId: string, branding: { logoUrl?: string; primaryColor?: string; accentColor?: string }) => {
  return updateTenant(tenantId, branding);
};

export const deleteTenant = async (tenantId: string) => {
  try {
    const docRef = doc(db, 'tenants', tenantId);
    return await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete', `tenants/${tenantId}`);
  }
};

// Invitations
export const createInvitation = async (data: Omit<Invitation, 'id' | 'createdAt' | 'status'>) => {
  const path = 'invitations';
  try {
    const docRef = await addDoc(collection(db, 'invitations'), {
      ...data,
      status: 'pending',
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, 'create', path);
  }
};

export const getInvitationByToken = async (token: string): Promise<Invitation | null> => {
  const path = 'invitations';
  try {
    const q = query(collection(db, 'invitations'), where('token', '==', token), where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Invitation;
  } catch (error) {
    handleFirestoreError(error, 'get', path);
    return null;
  }
};

export const acceptInvitation = async (invitationId: string) => {
  const path = `invitations/${invitationId}`;
  try {
    const docRef = doc(db, 'invitations', invitationId);
    await updateDoc(docRef, { status: 'accepted' });
  } catch (error) {
    handleFirestoreError(error, 'update', path);
  }
};

export const subscribeToTenant = (tenantId: string, callback: (tenant: Tenant | null) => void) => {
  const docRef = doc(db, 'tenants', tenantId);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as Tenant);
    } else {
      callback(null);
    }
  }, (error) => handleFirestoreError(error, 'get', `tenants/${tenantId}`));
};

export const subscribeToTenants = (callback: (tenants: Tenant[]) => void) => {
  const q = query(collection(db, 'tenants'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const tenants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));
    callback(tenants);
  }, (error) => handleFirestoreError(error, 'list', 'tenants'));
};

// User Profiles
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const docRef = doc(db, 'users', uid);
    const userDoc = await getDoc(docRef);
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Role-based subscriptions
export const subscribeToMyCases = (tenantId: string | undefined, role: string | undefined, entityId: string, callback: (cases: Case[]) => void) => {
  if (!role || !tenantId) {
    callback([]);
    return () => {};
  }
  
  let q;
  if (tenantId === 'platform') {
    q = query(collection(db, 'cases'), orderBy('createdAt', 'desc'));
  } else if (role === 'doctor') {
    q = query(collection(db, 'cases'), where('tenantId', '==', tenantId), where('doctorId', '==', entityId), orderBy('createdAt', 'desc'));
  } else if (role === 'admin') {
    q = query(collection(db, 'cases'), where('tenantId', '==', tenantId), orderBy('createdAt', 'desc'));
  } else {
    callback([]);
    return () => {};
  }
  
  return onSnapshot(q, (snapshot) => {
    const cases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Case));
    callback(cases);
  }, (error) => handleFirestoreError(error, 'list', 'cases'));
};

// Doctors
export const subscribeToDoctors = (tenantId: string | undefined, callback: (doctors: Doctor[]) => void) => {
  if (!tenantId) {
    callback([]);
    return () => {};
  }
  const q = tenantId === 'platform' 
    ? query(collection(db, 'doctors'), orderBy('createdAt', 'desc'))
    : query(collection(db, 'doctors'), where('tenantId', '==', tenantId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const doctors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
    callback(doctors);
  }, (error) => handleFirestoreError(error, 'list', 'doctors'));
};

export const addDoctor = async (doctor: Omit<Doctor, 'id' | 'createdAt'>) => {
  try {
    return await addDoc(collection(db, 'doctors'), {
      ...doctor,
      createdAt: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, 'create', 'doctors');
  }
};

export const updateDoctor = async (doctorId: string, doctorData: Partial<Doctor>) => {
  try {
    const docRef = doc(db, 'doctors', doctorId);
    await updateDoc(docRef, { ...doctorData });
  } catch (error) {
    handleFirestoreError(error, 'update', `doctors/${doctorId}`);
  }
};

export const deleteDoctor = async (doctorId: string) => {
  try {
    const docRef = doc(db, 'doctors', doctorId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete', `doctors/${doctorId}`);
  }
};

// Cases
export const subscribeToCases = (tenantId: string | undefined, callback: (cases: Case[]) => void) => {
  if (!tenantId) {
    callback([]);
    return () => {};
  }
  const q = tenantId === 'platform'
    ? query(collection(db, 'cases'), orderBy('createdAt', 'desc'))
    : query(collection(db, 'cases'), where('tenantId', '==', tenantId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const cases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Case));
    callback(cases);
  }, (error) => handleFirestoreError(error, 'list', 'cases'));
};

export const addCase = async (caseData: Omit<Case, 'id' | 'createdAt'>) => {
  try {
    return await addDoc(collection(db, 'cases'), {
      ...caseData,
      createdAt: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, 'create', 'cases');
  }
};

export const updateCase = async (caseId: string, caseData: Partial<Case>) => {
  try {
    const docRef = doc(db, 'cases', caseId);
    await updateDoc(docRef, { ...caseData });
  } catch (error) {
    handleFirestoreError(error, 'update', `cases/${caseId}`);
  }
};

export const updateCaseStatus = async (caseId: string, status: Case['status']) => {
  try {
    const docRef = doc(db, 'cases', caseId);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, 'update', `cases/${caseId}`);
  }
};

export const deleteCase = async (caseId: string) => {
  try {
    const docRef = doc(db, 'cases', caseId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete', `cases/${caseId}`);
  }
};

export const deleteInvoice = async (invoiceId: string) => {
  try {
    const docRef = doc(db, 'invoices', invoiceId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete', `invoices/${invoiceId}`);
  }
};

export interface Invoice {
  id?: string;
  tenantId: string;
  doctorId: string;
  doctorName?: string;
  caseIds: string[];
  amount: number;
  status: 'Pending' | 'Paid';
  billNo?: string;
  invoiceNumber?: string;
  isSample?: boolean;
  isMEI?: boolean;
  meiMonth?: string;
  meiYear?: number;
  childInvoiceIds?: string[];
  consolidatedIntoMEIId?: string;
  createdAt: any;
}

export const subscribeToMyInvoices = (tenantId: string | undefined, role: string | undefined, entityId: string, callback: (invoices: Invoice[]) => void) => {
  if (!role || !tenantId) {
    callback([]);
    return () => {};
  }
  
  let q;
  if (tenantId === 'platform') {
    q = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
  } else if (role === 'doctor') {
    q = query(collection(db, 'invoices'), where('tenantId', '==', tenantId), where('doctorId', '==', entityId), orderBy('createdAt', 'desc'));
  } else if (role === 'admin') {
    q = query(collection(db, 'invoices'), where('tenantId', '==', tenantId), orderBy('createdAt', 'desc'));
  } else {
    callback([]);
    return () => {};
  }
  
  return onSnapshot(q, (snapshot) => {
    const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
    callback(invoices);
  }, (error) => handleFirestoreError(error, 'list', 'invoices'));
};

// Invoices
export const subscribeToInvoices = (tenantId: string | undefined, callback: (invoices: Invoice[]) => void) => {
  if (!tenantId) {
    callback([]);
    return () => {};
  }
  const q = tenantId === 'platform'
    ? query(collection(db, 'invoices'), orderBy('createdAt', 'desc'))
    : query(collection(db, 'invoices'), where('tenantId', '==', tenantId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
    callback(invoices);
  }, (error) => handleFirestoreError(error, 'list', 'invoices'));
};

export const addInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
  try {
    const { runTransaction, collection, doc, Timestamp } = await import('firebase/firestore');
    
    return await runTransaction(db, async (transaction) => {
      const tenantRef = doc(db, 'tenants', invoice.tenantId);
      let tenantDoc = await transaction.get(tenantRef);
      let tenantData: Tenant;
      
      if (!tenantDoc.exists()) {
        if (invoice.tenantId === 'platform') {
          // Auto-create platform tenant for super_admin if it doesn't exist
          tenantData = {
            name: 'Platform Admin',
            subdomain: 'platform',
            ownerEmail: 'theblackman2902@gmail.com',
            plan: 'Enterprise',
            status: 'Active',
            createdAt: Timestamp.now(),
            invoiceCounter: 0,
            sampleInvoiceCounter: 0
          };
          transaction.set(tenantRef, tenantData);
        } else {
          throw new Error('Tenant not found');
        }
      } else {
        tenantData = tenantDoc.data() as Tenant;
      }
      
      const now = new Date();
      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const currentMonth = monthNames[now.getMonth()];
      const currentYear = now.getFullYear();
      
      const isSample = (invoice as any).isSample === true;
      
      // Check if we need to reset the counter (new month or year)
      const lastMonth = isSample ? tenantData.lastSampleInvoiceMonth : tenantData.lastInvoiceMonth;
      const lastYear = isSample ? tenantData.lastSampleInvoiceYear : tenantData.lastInvoiceYear;
      
      let nextCounter = 1;
      if (lastMonth === currentMonth && lastYear === currentYear) {
        const currentCounter = isSample ? (tenantData.sampleInvoiceCounter || 0) : (tenantData.invoiceCounter || 0);
        nextCounter = currentCounter + 1;
      }
      
      // Generate formatted invoice number: #INV- or #SINV-
      const prefix = isSample ? '#SINV-' : '#INV-';
      const sequence = String(nextCounter).padStart(6, '0');
      const formattedInvoiceNo = `${prefix}${currentMonth}${currentYear}${sequence}`;
      
      const invoiceRef = doc(collection(db, 'invoices'));
      transaction.set(invoiceRef, {
        ...invoice,
        billNo: invoice.billNo || formattedInvoiceNo,
        invoiceNumber: formattedInvoiceNo,
        createdAt: Timestamp.now()
      });
      
      const updateData: any = isSample ? {
        sampleInvoiceCounter: nextCounter,
        lastSampleInvoiceMonth: currentMonth,
        lastSampleInvoiceYear: currentYear
      } : {
        invoiceCounter: nextCounter,
        lastInvoiceMonth: currentMonth,
        lastInvoiceYear: currentYear
      };

      transaction.update(tenantRef, updateData);
      
      return invoiceRef;
    });
  } catch (error) {
    handleFirestoreError(error, 'create', 'invoices');
  }
};

export const consolidateInvoices = async (meiInvoice: Omit<Invoice, 'id' | 'createdAt'>, childInvoiceIds: string[]) => {
  try {
    const { runTransaction, collection, doc, Timestamp } = await import('firebase/firestore');
    
    return await runTransaction(db, async (transaction) => {
      // 1. Create the MEI Invoice
      const tenantRef = doc(db, 'tenants', meiInvoice.tenantId);
      let tenantDoc = await transaction.get(tenantRef);
      let tenantData: Tenant;
      
      if (!tenantDoc.exists()) {
        if (meiInvoice.tenantId === 'platform') {
          // Auto-create platform tenant for super_admin if it doesn't exist
          tenantData = {
            name: 'Platform Admin',
            subdomain: 'platform',
            ownerEmail: 'theblackman2902@gmail.com',
            plan: 'Enterprise',
            status: 'Active',
            createdAt: Timestamp.now(),
            invoiceCounter: 0,
            sampleInvoiceCounter: 0
          };
          transaction.set(tenantRef, tenantData);
        } else {
          throw new Error('Tenant not found');
        }
      } else {
        tenantData = tenantDoc.data() as Tenant;
      }
      
      const now = new Date();
      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const currentMonth = monthNames[now.getMonth()];
      const currentYear = now.getFullYear();
      
      const nextCounter = (tenantData.invoiceCounter || 0) + 1;
      const prefix = '#MEI-';
      const sequence = String(nextCounter).padStart(6, '0');
      const formattedInvoiceNo = `${prefix}${currentMonth}${currentYear}${sequence}`;
      
      const meiRef = doc(collection(db, 'invoices'));
      transaction.set(meiRef, {
        ...meiInvoice,
        billNo: meiInvoice.billNo || formattedInvoiceNo,
        invoiceNumber: formattedInvoiceNo,
        isMEI: true,
        createdAt: Timestamp.now()
      });
      
      // 2. Update child invoices to mark them as consolidated
      for (const id of childInvoiceIds) {
        const childRef = doc(db, 'invoices', id);
        transaction.update(childRef, { consolidatedIntoMEIId: meiRef.id });
      }
      
      // 3. Update tenant counter
      transaction.update(tenantRef, {
        invoiceCounter: nextCounter,
        lastInvoiceMonth: currentMonth,
        lastInvoiceYear: currentYear
      });
      
      return meiRef;
    });
  } catch (error) {
    handleFirestoreError(error, 'consolidate', 'invoices');
  }
};

export const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
  try {
    const docRef = doc(db, 'invoices', invoiceId);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, 'update', `invoices/${invoiceId}`);
  }
};

export const updateProfile = async (role: string, entityId: string, data: any) => {
  const collectionName = role === 'doctor' ? 'doctors' : 'users';
  const docRef = doc(db, collectionName, entityId);
  await updateDoc(docRef, data);
};

// Inventory
export const subscribeToInventory = (tenantId: string | undefined, callback: (items: InventoryItem[]) => void) => {
  if (!tenantId) {
    callback([]);
    return () => {};
  }
  const q = tenantId === 'platform'
    ? query(collection(db, 'inventory'), orderBy('name', 'asc'))
    : query(collection(db, 'inventory'), where('tenantId', '==', tenantId), orderBy('name', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem));
    callback(items);
  }, (error) => handleFirestoreError(error, 'list', 'inventory'));
};

export const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'updatedAt'>) => {
  try {
    return await addDoc(collection(db, 'inventory'), {
      ...item,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, 'create', 'inventory');
  }
};

export const updateInventoryItem = async (itemId: string, data: Partial<InventoryItem>) => {
  try {
    const docRef = doc(db, 'inventory', itemId);
    await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
  } catch (error) {
    handleFirestoreError(error, 'update', `inventory/${itemId}`);
  }
};

export const deleteInventoryItem = async (itemId: string) => {
  try {
    const docRef = doc(db, 'inventory', itemId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete', `inventory/${itemId}`);
  }
};

// Material Usage
export const recordMaterialUsage = async (usage: Omit<MaterialUsage, 'id' | 'timestamp'>) => {
  try {
    await runTransaction(db, async (transaction) => {
      const itemRef = doc(db, 'inventory', usage.itemId);
      const itemDoc = await transaction.get(itemRef);
      
      if (!itemDoc.exists()) {
        throw new Error('Inventory item not found');
      }
      
      const currentQuantity = itemDoc.data().quantity;
      if (currentQuantity < usage.quantityUsed) {
        throw new Error('Insufficient stock');
      }
      
      // 1. Record the usage
      const usageRef = doc(collection(db, 'material_usage'));
      transaction.set(usageRef, {
        ...usage,
        timestamp: Timestamp.now()
      });
      
      // 2. Update inventory quantity
      transaction.update(itemRef, {
        quantity: currentQuantity - usage.quantityUsed,
        updatedAt: Timestamp.now()
      });
    });
  } catch (error) {
    handleFirestoreError(error, 'transaction', 'material_usage');
  }
};

export const subscribeToMaterialUsage = (tenantId: string | undefined, caseId: string | undefined, callback: (usage: MaterialUsage[]) => void) => {
  if (!tenantId) {
    callback([]);
    return () => {};
  }
  
  let q;
  if (tenantId === 'platform') {
    q = query(collection(db, 'material_usage'), orderBy('timestamp', 'desc'));
  } else if (caseId) {
    q = query(collection(db, 'material_usage'), where('tenantId', '==', tenantId), where('caseId', '==', caseId), orderBy('timestamp', 'desc'));
  } else {
    q = query(collection(db, 'material_usage'), where('tenantId', '==', tenantId), orderBy('timestamp', 'desc'));
  }
  
  return onSnapshot(q, (snapshot) => {
    const usage = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaterialUsage));
    callback(usage);
  }, (error) => handleFirestoreError(error, 'list', 'material_usage'));
};

// Expenses
export const subscribeToExpenses = (tenantId: string | undefined, callback: (expenses: Expense[]) => void) => {
  if (!tenantId) {
    callback([]);
    return () => {};
  }
  const q = tenantId === 'platform'
    ? query(collection(db, 'expenses'), orderBy('date', 'desc'))
    : query(collection(db, 'expenses'), where('tenantId', '==', tenantId), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
    callback(expenses);
  }, (error) => handleFirestoreError(error, 'list', 'expenses'));
};

export const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
  try {
    return await addDoc(collection(db, 'expenses'), {
      ...expense,
      createdAt: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, 'create', 'expenses');
  }
};

export const updateExpense = async (expenseId: string, data: Partial<Expense>) => {
  try {
    const docRef = doc(db, 'expenses', expenseId);
    await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
  } catch (error) {
    handleFirestoreError(error, 'update', `expenses/${expenseId}`);
  }
};

export const deleteExpense = async (expenseId: string) => {
  try {
    const docRef = doc(db, 'expenses', expenseId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete', `expenses/${expenseId}`);
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, 'update', path);
  }
};

export const subscribeToPendingApprovals = (tenantId: string | undefined, callback: (count: number) => void) => {
  if (!tenantId) {
    callback(0);
    return () => {};
  }
  
  if (tenantId === 'platform') {
    let userCount = 0;
    let tenantCount = 0;
    
    const unsubUsers = onSnapshot(query(collection(db, 'users'), where('status', '==', 'pending')), (snapshot) => {
      userCount = snapshot.size;
      callback(userCount + tenantCount);
    }, (error) => handleFirestoreError(error, 'list', 'users'));
    
    const unsubTenants = onSnapshot(query(collection(db, 'tenants'), where('status', '==', 'Pending Approval')), (snapshot) => {
      tenantCount = snapshot.size;
      callback(userCount + tenantCount);
    }, (error) => handleFirestoreError(error, 'list', 'tenants'));
    
    return () => {
      unsubUsers();
      unsubTenants();
    };
  }

  // Lab Admin: Count their own pending users + orphaned doctors
  let myLabCount = 0;
  let orphanedCount = 0;

  const unsubMyLab = onSnapshot(query(collection(db, 'users'), where('tenantId', '==', tenantId), where('status', '==', 'pending')), (snapshot) => {
    myLabCount = snapshot.size;
    callback(myLabCount + orphanedCount);
  }, (error) => {
    console.error('Error fetching my lab pending approvals:', error);
    callback(orphanedCount);
  });

  const unsubOrphaned = onSnapshot(query(collection(db, 'users'), where('status', '==', 'pending'), where('role', '==', 'doctor')), (snapshot) => {
    orphanedCount = snapshot.docs.filter(d => !d.data().tenantId).length;
    callback(myLabCount + orphanedCount);
  }, (error) => {
    console.error('Error fetching orphaned doctors count:', error);
    callback(myLabCount);
  });

  return () => {
    unsubMyLab();
    unsubOrphaned();
  };
};

export const approveTenant = async (tenantId: string) => {
  try {
    const tenantRef = doc(db, 'tenants', tenantId);
    await updateDoc(tenantRef, { 
      status: 'Active',
      approvedAt: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, 'update', `tenants/${tenantId}`);
  }
};

export const rejectTenant = async (tenantId: string) => {
  try {
    const tenantRef = doc(db, 'tenants', tenantId);
    await updateDoc(tenantRef, { 
      status: 'Suspended',
      rejectedAt: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, 'update', `tenants/${tenantId}`);
  }
};

export const subscribeToPendingCasesCount = (tenantId: string | undefined, callback: (count: number) => void) => {
  if (!tenantId) {
    callback(0);
    return () => {};
  }
  const q = tenantId === 'platform'
    ? query(collection(db, 'cases'), where('status', '==', 'Received'))
    : query(collection(db, 'cases'), where('tenantId', '==', tenantId), where('status', '==', 'Received'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  }, (error) => handleFirestoreError(error, 'list', 'cases'));
};

export const subscribeToReadyForInvoiceCount = (tenantId: string | undefined, callback: (count: number) => void) => {
  if (!tenantId) {
    callback(0);
    return () => {};
  }
  const q = tenantId === 'platform'
    ? query(collection(db, 'cases'), where('status', '==', 'Ready'))
    : query(collection(db, 'cases'), where('tenantId', '==', tenantId), where('status', '==', 'Ready'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  }, (error) => handleFirestoreError(error, 'list', 'cases'));
};

export const seedDemoData = async (tenantId: string) => {
  console.log(`Starting seedDemoData for tenant: ${tenantId}`);
  try {
    // 1. Create 3 Doctors if none exist for this tenant
    const doctorsSnap = await getDocs(query(collection(db, 'doctors'), where('tenantId', '==', tenantId)));
    let doctorIds: {id: string, name: string}[] = doctorsSnap.docs.map(d => ({id: d.id, name: d.data().name}));
    
    if (doctorIds.length < 3) {
      const newDoctors = [
        { name: 'Dr. Rajesh Kumar', clinicName: 'Kumar Dental Clinic', email: 'rajesh@example.com', phone: '9876543210', address: '123 MG Road, Mumbai', tenantId },
        { name: 'Dr. Anita Sharma', clinicName: 'Smile Care Center', email: 'anita@example.com', phone: '9876543211', address: '456 Park Street, Delhi', tenantId },
        { name: 'Dr. Vikram Singh', clinicName: 'Singh Orthodontics', email: 'vikram@example.com', phone: '9876543212', address: '789 Link Road, Bangalore', tenantId }
      ];
      
      const doctorPromises = newDoctors.map(docData => 
        addDoc(collection(db, 'doctors'), { ...docData, createdAt: Timestamp.now() })
      );
      const docRefs = await Promise.all(doctorPromises);
      docRefs.forEach((ref, i) => {
        doctorIds.push({ id: ref.id, name: newDoctors[i].name });
      });
    }

    // 2. Create 30 Cases if none exist
    const casesSnap = await getDocs(query(collection(db, 'cases'), where('tenantId', '==', tenantId)));
    if (casesSnap.size < 10) {
      const statuses: Case['status'][] = ['Received', 'In Progress', 'Ready', 'Delivered'];
      const caseTypes = ['Crown', 'Bridge', 'Denture', 'Implant', 'Inlay', 'Onlay'];
      const toothNumbers = ['11', '12', '13', '14', '21', '22', '23', '24', '31', '32', '33', '34', '41', '42', '43', '44'];
      const patientNames = ['Rahul', 'Sonia', 'Modi', 'Kejriwal', 'Mamata', 'Uddhav', 'Stalin', 'Pinarayi', 'Nitish', 'Lalu'];

      const casePromises = [];
      for (let i = 0; i < 30; i++) {
        const doctor = doctorIds[Math.floor(Math.random() * doctorIds.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const caseType = caseTypes[Math.floor(Math.random() * caseTypes.length)];
        const toothNumber = toothNumbers[Math.floor(Math.random() * toothNumbers.length)];
        const patientName = patientNames[Math.floor(Math.random() * patientNames.length)] + ' ' + (i + 1);
        
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 10) + 1);

        casePromises.push(addDoc(collection(db, 'cases'), {
          tenantId,
          doctorId: doctor.id,
          doctorName: doctor.name,
          patientName,
          toothNumber,
          caseType,
          status,
          dueDate: Timestamp.fromDate(dueDate),
          price: Math.floor(Math.random() * 5000) + 1000,
          createdAt: Timestamp.now()
        }));
      }
      await Promise.all(casePromises);
    }

    // 4. Create 10 Invoices if none exist
    const invoicesSnap = await getDocs(query(collection(db, 'invoices'), where('tenantId', '==', tenantId)));
    if (invoicesSnap.size < 5) {
      const invoicePromises = [];
      for (let i = 0; i < 10; i++) {
        const doctor = doctorIds[Math.floor(Math.random() * doctorIds.length)];
        const amount = Math.floor(Math.random() * 20000) + 5000;
        const status = Math.random() > 0.3 ? 'Paid' : 'Pending';
        
        invoicePromises.push(addDoc(collection(db, 'invoices'), {
          tenantId,
          doctorId: doctor.id,
          doctorName: doctor.name,
          caseIds: [], // Simplified for demo
          amount,
          status,
          createdAt: Timestamp.now()
        }));
      }
      await Promise.all(invoicePromises);
    }

    // 5. Create Inventory Items if none exist
    const inventorySnap = await getDocs(query(collection(db, 'inventory'), where('tenantId', '==', tenantId)));
    if (inventorySnap.size < 3) {
      const inventoryItems = [
        { name: 'Zirconia Block A2', category: 'Blocks', unit: 'pcs', quantity: 25, minThreshold: 5, costPerUnit: 1200, supplier: 'DentalSupply Co', tenantId },
        { name: 'Porcelain Powder - Enamel', category: 'Porcelain', unit: 'grams', quantity: 500, minThreshold: 100, costPerUnit: 45, supplier: 'Ceramix Inc', tenantId },
        { name: 'Cobalt Chrome Alloy', category: 'Alloy', unit: 'grams', quantity: 1000, minThreshold: 200, costPerUnit: 15, supplier: 'MetalWorks', tenantId },
        { name: 'Implant Abutment - Standard', category: 'Implants', unit: 'pcs', quantity: 10, minThreshold: 3, costPerUnit: 2500, supplier: 'BioDent', tenantId },
        { name: '3D Printing Resin - Grey', category: 'Supplies', unit: 'ml', quantity: 2000, minThreshold: 500, costPerUnit: 8, supplier: 'PrintLab', tenantId }
      ];

      const inventoryPromises = inventoryItems.map(item => 
        addDoc(collection(db, 'inventory'), {
          ...item,
          updatedAt: Timestamp.now()
        })
      );
      await Promise.all(inventoryPromises);
    }

    console.log(`Successfully seeded data for tenant: ${tenantId}`);
    return true;
  } catch (error) {
    console.error(`Error in seedDemoData for tenant ${tenantId}:`, error);
    handleFirestoreError(error, 'seed', 'all');
  }
};

export const seedPlatformData = async () => {
  console.log('Starting seedPlatformData...');
  try {
    const demoLabs = [
      { name: 'Apex Dental Studio', subdomain: 'apex', ownerEmail: 'apex@example.com', email: 'contact@apex.com', plan: 'Pro' as const, status: 'Active' as const },
      { name: 'Precision Prosthetics', subdomain: 'precision', ownerEmail: 'precision@example.com', email: 'info@precision.com', plan: 'Enterprise' as const, status: 'Active' as const },
      { name: 'Elite Smile Lab', subdomain: 'elite', ownerEmail: 'elite@example.com', email: 'support@elite.com', plan: 'Basic' as const, status: 'Active' as const }
    ];

    for (const lab of demoLabs) {
      console.log(`Processing lab: ${lab.name}`);
      // Check if lab already exists
      const q = query(collection(db, 'tenants'), where('subdomain', '==', lab.subdomain));
      const snap = await getDocs(q);
      
      let tenantId: string;
      if (snap.empty) {
        console.log(`Creating new tenant for ${lab.name}`);
        const docRef = await addDoc(collection(db, 'tenants'), {
          ...lab,
          createdAt: Timestamp.now(),
          paymentStatus: 'Paid'
        });
        tenantId = docRef.id;
      } else {
        tenantId = snap.docs[0].id;
        console.log(`Using existing tenant for ${lab.name}: ${tenantId}`);
      }

      // Seed data for this lab
      await seedDemoData(tenantId);
    }
    console.log('Successfully completed seedPlatformData');
    return true;
  } catch (error) {
    console.error('Error in seedPlatformData:', error);
    handleFirestoreError(error, 'seed-platform', 'tenants');
  }
};

export const getGlobalStats = async (): Promise<GlobalStats> => {
  try {
    // 1. Get counts efficiently using getCountFromServer
    const tenantsCountPromise = getCountFromServer(collection(db, 'tenants'));
    const casesCountPromise = getCountFromServer(collection(db, 'cases'));
    const doctorsCountPromise = getCountFromServer(collection(db, 'doctors'));
    
    // 2. Fetch only necessary data for revenue and trends
    // We only need Paid invoices for revenue
    const paidInvoicesQuery = query(collection(db, 'invoices'), where('status', '==', 'Paid'));
    const paidInvoicesSnapPromise = getDocs(paidInvoicesQuery);
    
    // 3. Fetch tenants for topTenants and labsByMonth
    const tenantsSnapPromise = getDocs(collection(db, 'tenants'));

    // Wait for all essential data
    const [
      tenantsCountSnap, 
      casesCountSnap, 
      doctorsCountSnap, 
      paidInvoicesSnap,
      tenantsSnap
    ] = await Promise.all([
      tenantsCountPromise,
      casesCountPromise,
      doctorsCountPromise,
      paidInvoicesSnapPromise,
      tenantsSnapPromise
    ]);

    const totalLabs = tenantsCountSnap.data().count;
    const totalCases = casesCountSnap.data().count;
    const totalDoctors = doctorsCountSnap.data().count;

    const tenants = tenantsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Tenant));
    const tenantIds = new Set(tenants.map(t => t.id));
    
    const paidInvoices = paidInvoicesSnap.docs
      .map(d => ({ id: d.id, ...d.data() } as any))
      .filter(inv => tenantIds.has(inv.tenantId));

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

    // Revenue by month
    const revenueMap: Record<string, number> = {};
    paidInvoices.forEach(inv => {
      const date = inv.createdAt?.toDate ? inv.createdAt.toDate() : new Date(inv.createdAt);
      const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      revenueMap[month] = (revenueMap[month] || 0) + (inv.amount || 0);
    });

    const revenueByMonth = Object.entries(revenueMap)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-6); // Only show last 6 months for performance and UI

    // Labs by month
    const labsMap: Record<string, number> = {};
    tenants.forEach(t => {
      const date = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
      const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      labsMap[month] = (labsMap[month] || 0) + 1;
    });

    const labsByMonth = Object.entries(labsMap).map(([month, count]) => ({ month, count }));

    // Top Tenants (Market Leaders)
    const revenueByTenant: Record<string, number> = {};
    paidInvoices.forEach(inv => {
      revenueByTenant[inv.tenantId] = (revenueByTenant[inv.tenantId] || 0) + (inv.amount || 0);
    });

    const allTenantRevenue = tenants.map(t => ({
      id: t.id,
      name: t.name,
      revenue: revenueByTenant[t.id || ''] || 0,
    }));

    const topTenants = allTenantRevenue
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const tenantStats = await Promise.all(topTenants.map(async t => {
      // Only fetch case counts for the top 5 to keep it fast
      const casesCountSnap = await getCountFromServer(query(collection(db, 'cases'), where('tenantId', '==', t.id)));
      return {
        ...t,
        cases: casesCountSnap.data().count
      };
    }));

    return {
      totalLabs,
      totalRevenue,
      totalCases,
      totalDoctors,
      revenueByMonth,
      labsByMonth,
      topTenants: tenantStats
    };
  } catch (error) {
    handleFirestoreError(error, 'get', 'global-stats');
    throw error;
  }
};

export const cleanupOrphanedData = async () => {
  try {
    const tenantsSnap = await getDocs(collection(db, 'tenants'));
    const tenantIds = new Set(tenantsSnap.docs.map(d => d.id));
    
    const collections = ['cases', 'doctors', 'invoices', 'inventory', 'material_usage', 'users'];
    let totalDeleted = 0;
    
    for (const collName of collections) {
      const snap = await getDocs(collection(db, collName));
      const orphans = snap.docs.filter(d => {
        const data = d.data();
        // Skip platform users
        if (collName === 'users' && data.role === 'super_admin') return false;
        return !tenantIds.has(data.tenantId);
      });
      
      for (const orphan of orphans) {
        await deleteDoc(doc(db, collName, orphan.id));
        totalDeleted++;
      }
    }
    
    return totalDeleted;
  } catch (error) {
    handleFirestoreError(error, 'delete', 'orphaned-data');
    throw error;
  }
};
