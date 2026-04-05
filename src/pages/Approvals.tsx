import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, User, Mail, Clock, Shield, CheckCircle2, XCircle, AlertCircle, Building2, MapPin, Phone } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Tenant, approveTenant, rejectTenant as rejectTenantService, subscribeToTenants } from '../services/firestoreService';
import { toast } from 'sonner';

interface ApprovalsProps {
  tenantId?: string;
  userRole?: string;
  canEdit?: boolean;
}

const Approvals: React.FC<ApprovalsProps> = ({ tenantId, userRole, canEdit = true }) => {
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [pendingLabs, setPendingLabs] = useState<Tenant[]>([]);
  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [selectedTenantIds, setSelectedTenantIds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState<{ id: string, type: 'user' | 'lab' } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For both Super Admin and Lab Admin, we want to see pending users.
    // Super Admin sees all.
    // Lab Admin sees their own AND orphaned doctors.
    
    let unsubscribeUsers: () => void;
    
    if (userRole === 'super_admin') {
      const q = query(collection(db, 'users'), where('status', '==', 'pending'));
      unsubscribeUsers = onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
        setPendingUsers(users);
        setLoading(false);
      }, (err) => {
        console.error('Error fetching pending users (Super Admin):', err);
        setError('Permission denied or connection error.');
        setLoading(false);
      });
    } else {
      // Lab Admin needs two separate listeners to handle orphaned doctors and their own lab's users
      // because Firestore rules don't allow a single broad query for both.
      
      const qOrphanedDoctors = query(
        collection(db, 'users'), 
        where('status', '==', 'pending'), 
        where('role', '==', 'doctor')
      );
      
      const qMyLabUsers = query(
        collection(db, 'users'), 
        where('status', '==', 'pending'), 
        where('tenantId', '==', tenantId)
      );
      
      const orphanedDoctorsMap = new Map<string, UserProfile>();
      const myLabUsersMap = new Map<string, UserProfile>();
      
      const updatePendingUsers = () => {
        const combined = new Map([...orphanedDoctorsMap, ...myLabUsersMap]);
        setPendingUsers(Array.from(combined.values()));
        setLoading(false);
      };
      
      const unsubOrphaned = onSnapshot(qOrphanedDoctors, (snapshot) => {
        orphanedDoctorsMap.clear();
        snapshot.docs.forEach(doc => {
          const u = { uid: doc.id, ...doc.data() } as UserProfile;
          // Filter orphaned doctors in memory to be extra safe
          if (!u.tenantId) {
            orphanedDoctorsMap.set(doc.id, u);
          }
        });
        updatePendingUsers();
      }, (err) => {
        console.error('Error fetching orphaned doctors:', err);
        setLoading(false);
      });
      
      const unsubMyLab = onSnapshot(qMyLabUsers, (snapshot) => {
        myLabUsersMap.clear();
        snapshot.docs.forEach(doc => {
          myLabUsersMap.set(doc.id, { uid: doc.id, ...doc.data() } as UserProfile);
        });
        updatePendingUsers();
      }, (err) => {
        console.error('Error fetching my lab pending users:', err);
        setLoading(false);
      });
      
      unsubscribeUsers = () => {
        unsubOrphaned();
        unsubMyLab();
      };
    }

    let unsubscribeLabs = () => {};
    if (userRole === 'super_admin') {
      const qLabs = query(collection(db, 'tenants'), where('status', '==', 'Pending Approval'));
      unsubscribeLabs = onSnapshot(qLabs, (snapshot) => {
        const labs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));
        setPendingLabs(labs);
      }, (err) => {
        console.error('Error fetching pending labs:', err);
      });
    }

    let unsubscribeTenants = () => {};
    if (userRole === 'super_admin') {
      unsubscribeTenants = subscribeToTenants(setAllTenants);
    }

    return () => {
      unsubscribeUsers();
      unsubscribeLabs();
      unsubscribeTenants();
    };
  }, [tenantId, userRole]);

  const handleApproveUser = async (user: UserProfile) => {
    setProcessing(user.uid);
    try {
      let entityId = '';
      const targetTenantId = user.tenantId || selectedTenantIds[user.uid] || (tenantId !== 'platform' ? tenantId : '');

      if (!targetTenantId && userRole !== 'super_admin') {
        throw new Error('Tenant ID is required for approval');
      }

      if (user.role === 'doctor' && (!targetTenantId || targetTenantId === 'platform') && userRole === 'super_admin') {
        toast.error('Please select a Lab for this doctor before approving');
        setProcessing(null);
        return;
      }
      
      if (user.role === 'doctor') {
        const docRef = await addDoc(collection(db, 'doctors'), {
          tenantId: targetTenantId,
          clinicName: user.clinicName || 'New Clinic',
          email: user.email,
          phone: user.phone || '',
          address: user.address || '',
          createdAt: serverTimestamp(),
          uid: user.uid
        });
        entityId = docRef.id;
      }

      const updateData: any = {
        status: 'approved',
        approvedAt: serverTimestamp()
      };
      if (entityId) updateData.entityId = entityId;
      if (targetTenantId) updateData.tenantId = targetTenantId;
      
      await updateDoc(doc(db, 'users', user.uid), updateData);
      toast.success(`User ${user.name || user.email} approved successfully`);
    } catch (error) {
      console.error('Error approving user:', error);
      setError('Failed to approve user.');
    } finally {
      setProcessing(null);
    }
  };

  const handleApproveLab = async (lab: Tenant) => {
    setProcessing(lab.id);
    try {
      await approveTenant(lab.id);
      toast.success(`Lab ${lab.name} approved successfully`);
    } catch (error) {
      console.error('Error approving lab:', error);
      setError('Failed to approve lab.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!showRejectConfirm) return;
    const { id, type } = showRejectConfirm;
    setProcessing(id);
    try {
      if (type === 'user') {
        await updateDoc(doc(db, 'users', id), {
          status: 'rejected'
        });
        toast.success('User request rejected');
      } else {
        await rejectTenantService(id);
        toast.success('Lab registration rejected');
      }
      setShowRejectConfirm(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError('Failed to reject request.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalPending = pendingUsers.length + pendingLabs.length;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-main dark:text-zinc-100 tracking-tight">Approvals</h1>
          <p className="text-text-muted dark:text-zinc-400 mt-1">Review and manage pending access and registration requests.</p>
        </div>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-accent/10 dark:bg-accent/20 text-accent dark:text-accent-light px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-3 shadow-sm border border-accent/10"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
          </span>
          {totalPending} PENDING REQUESTS
        </motion.div>
      </div>

      {totalPending === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-[40px] p-20 text-center border border-border-light dark:border-zinc-800 shadow-sm"
        >
          <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-[32px] flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-green-500 dark:text-green-400" size={48} />
          </div>
          <h3 className="text-2xl font-bold text-text-main dark:text-zinc-100">All Caught Up!</h3>
          <p className="text-text-muted dark:text-zinc-400 mt-2 max-w-xs mx-auto">There are no pending requests at the moment. Your laboratory is running smoothly.</p>
        </motion.div>
      ) : (
        <div className="space-y-12">
          {/* Pending Labs Section (Super Admin Only) */}
          {userRole === 'super_admin' && pendingLabs.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Building2 className="text-primary" size={24} />
                </div>
                <h2 className="text-xl font-black text-text-main dark:text-zinc-100 tracking-tight uppercase">Lab Registrations</h2>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">{pendingLabs.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                  {pendingLabs.map((lab, index) => (
                    <motion.div
                      key={lab.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-border-light dark:border-zinc-800 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all hover:-translate-y-1"
                    >
                      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                        <div className="flex items-start gap-6 min-w-0 flex-1">
                          <div className="w-16 h-16 bg-primary/5 dark:bg-primary/10 rounded-[24px] flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                            <Building2 className="text-primary dark:text-primary-light" size={32} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-black text-text-main dark:text-zinc-100 text-2xl truncate tracking-tight">
                                {lab.name}
                              </h3>
                              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                NEW LABORATORY
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-text-muted dark:text-zinc-500 font-medium">
                              <span className="flex items-center gap-2 truncate"><Mail size={16} className="text-primary/60" /> {lab.email}</span>
                              <span className="flex items-center gap-2"><Phone size={16} className="text-primary/60" /> {lab.phone || 'No phone'}</span>
                              <span className="flex items-center gap-2"><MapPin size={16} className="text-primary/60" /> {lab.address || 'No address'}</span>
                            </div>
                            <div className="mt-4 flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 w-fit">
                              <User size={14} className="text-zinc-400" />
                              <p className="text-xs font-bold text-text-muted dark:text-zinc-400">Owner: <span className="text-text-main dark:text-zinc-200">{lab.ownerEmail}</span></p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
                          <button
                            onClick={() => canEdit && setShowRejectConfirm({ id: lab.id, type: 'lab' })}
                            disabled={processing === lab.id || !canEdit}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-black transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
                          >
                            <X size={20} strokeWidth={3} />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => canEdit && handleApproveLab(lab)}
                            disabled={processing === lab.id || !canEdit}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#00D26A] hover:bg-[#00B85C] text-white font-black shadow-xl shadow-[#00D26A]/30 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
                          >
                            {processing === lab.id ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <Check size={20} strokeWidth={3} />
                                <span>Approve Lab</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Pending Users Section */}
          {pendingUsers.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="p-2 bg-accent/10 rounded-xl">
                  <User className="text-accent" size={24} />
                </div>
                <h2 className="text-xl font-black text-text-main dark:text-zinc-100 tracking-tight uppercase">User Access Requests</h2>
                <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-black">{pendingUsers.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                  {pendingUsers.map((user, index) => (
                    <motion.div
                      key={user.uid}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-border-light dark:border-zinc-800 shadow-sm hover:shadow-xl hover:shadow-accent/5 transition-all hover:-translate-y-1"
                    >
                      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                        <div className="flex items-start gap-6 min-w-0 flex-1">
                          <div className="w-16 h-16 bg-accent/5 dark:bg-accent/10 rounded-[24px] flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
                            <User className="text-accent dark:text-accent-light" size={32} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-black text-text-main dark:text-zinc-100 text-2xl truncate tracking-tight">
                                {user.role === 'doctor' ? user.clinicName : user.name}
                              </h3>
                              <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {user.role}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-text-muted dark:text-zinc-500 font-medium">
                              <span className="flex items-center gap-2 truncate"><Mail size={16} className="text-accent/60" /> {user.email}</span>
                              <span className="flex items-center gap-2 whitespace-nowrap"><Clock size={16} className="text-accent/60" /> Requested: {user.requestedAt ? new Date(user.requestedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}</span>
                            </div>
                            
                            {userRole === 'super_admin' && user.role === 'doctor' && !user.tenantId && (
                              <div className="mt-6 p-6 bg-background-alt dark:bg-zinc-800/30 rounded-[24px] border border-border-light dark:border-zinc-800">
                                <label className="block text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest mb-3">Assign to Laboratory (Required for Approval)</label>
                                <select 
                                  value={selectedTenantIds[user.uid] || ''}
                                  onChange={(e) => setSelectedTenantIds(prev => ({ ...prev, [user.uid]: e.target.value }))}
                                  className="w-full bg-white dark:bg-zinc-900 border-2 border-border-light dark:border-zinc-700 rounded-2xl px-5 py-4 text-sm font-bold text-text-main dark:text-zinc-200 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all appearance-none cursor-pointer"
                                >
                                  <option value="">Select a Laboratory...</option>
                                  {allTenants.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
                          <button
                            onClick={() => canEdit && setShowRejectConfirm({ id: user.uid, type: 'user' })}
                            disabled={processing === user.uid || !canEdit}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-black transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
                          >
                            <X size={20} strokeWidth={3} />
                            <span>Reject</span>
                          </button>
                          <button
                            onClick={() => canEdit && handleApproveUser(user)}
                            disabled={processing === user.uid || !canEdit}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#00D26A] hover:bg-[#00B85C] text-white font-black shadow-xl shadow-[#00D26A]/30 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
                          >
                            {processing === user.uid ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <Check size={20} strokeWidth={3} />
                                <span>Approve Access</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-border-light dark:border-zinc-800"
          >
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-red-500 dark:text-red-400" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-text-main dark:text-zinc-100 text-center mb-2">Reject Request?</h2>
            <p className="text-text-muted dark:text-zinc-400 text-center mb-8">
              Are you sure you want to reject this {showRejectConfirm.type === 'lab' ? 'lab registration' : 'access request'}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowRejectConfirm(null)}
                className="flex-1 py-4 bg-background-alt dark:bg-zinc-800 hover:bg-border-light dark:hover:bg-zinc-700 text-text-main dark:text-zinc-100 font-bold rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleReject}
                disabled={processing === showRejectConfirm.id}
                className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {processing === showRejectConfirm.id ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  'Reject'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-red-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"
          >
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-2 hover:bg-white/20 rounded-full p-1">
              <X size={16} />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
