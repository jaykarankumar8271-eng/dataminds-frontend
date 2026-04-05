import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeToDoctors, addDoctor, updateDoctor, deleteDoctor, Doctor, subscribeToMyCases, Case } from '../services/firestoreService';
import { Plus, Search, Mail, Phone, MapPin, Building2, ArrowLeft, Clock, CheckCircle2, Edit2, Trash2, AlertCircle, ShieldAlert, UserPlus, Copy, Check, ClipboardList } from 'lucide-react';
import { checkPlanLimit, PlanStatus } from '../lib/planUtils';
import { createInvitation } from '../services/firestoreService';
import { PlanType } from '../constants';
import { toast } from 'sonner';

interface DoctorsProps {
  tenantId?: string;
  userRole?: string;
  initialShowModal?: boolean;
  plan?: PlanType;
  canEdit?: boolean;
}

const Doctors: React.FC<DoctorsProps> = ({ tenantId, userRole, initialShowModal, plan = 'Basic', canEdit = true }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showModal, setShowModal] = useState(initialShowModal || false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctorCases, setDoctorCases] = useState<Case[]>([]);
  const [allCases, setAllCases] = useState<Case[]>([]);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);
  const [isCheckingPlan, setIsCheckingPlan] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitationLink, setInvitationLink] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  
  const initialDoctorState = {
    name: '',
    clinicName: '',
    email: '',
    phone: '',
    address: ''
  };

  const [newDoctor, setNewDoctor] = useState(initialDoctorState);

  useEffect(() => {
    if (userRole !== 'admin' && userRole !== 'super_admin') return;
    const unsubDocs = subscribeToDoctors(tenantId, setDoctors);
    
    // Also subscribe to all cases to count active cases per doctor
    const unsubCases = subscribeToMyCases(tenantId, 'admin', '', setAllCases);
    
    return () => {
      unsubDocs();
      unsubCases();
    };
  }, [tenantId, userRole]);

  useEffect(() => {
    if (selectedDoctor) {
      const unsub = subscribeToMyCases(tenantId, 'doctor', selectedDoctor.id, setDoctorCases);
      return () => unsub();
    }
  }, [tenantId, selectedDoctor]);

  const handleAddClick = async () => {
    if (!tenantId) return;
    
    setIsCheckingPlan(true);
    const status = await checkPlanLimit(tenantId, plan as PlanType, 'doctors');
    setIsCheckingPlan(false);
    
    if (status.isLimited) {
      setPlanStatus(status);
      toast.error(status.message);
    } else {
      setEditingDoctorId(null);
      setNewDoctor(initialDoctorState);
      setShowModal(true);
    }
  };


  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    const toastId = toast.loading(`Deleting ${selectedIds.length} doctors...`);
    try {
      await Promise.all(selectedIds.map(id => deleteDoctor(id)));
      toast.success(`Successfully deleted ${selectedIds.length} doctors`, { id: toastId });
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      toast.error('Failed to delete some doctors', { id: toastId });
    }
  };

  const handleInviteDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !inviteEmail) return;

    setIsSendingInvite(true);
    try {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      await createInvitation({
        email: inviteEmail,
        tenantId,
        role: 'doctor',
        token,
        invitedBy: tenantId, // Using tenantId as placeholder for admin name/ID
        expiresAt
      });

      const link = `${window.location.origin}/invite?token=${token}`;
      setInvitationLink(link);
      toast.success('Invitation link generated!');
    } catch (error) {
      console.error('Failed to create invitation:', error);
      toast.error('Failed to generate invitation');
    } finally {
      setIsSendingInvite(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationLink);
    setIsCopying(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setIsCopying(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    try {
      if (editingDoctorId) {
        await updateDoctor(editingDoctorId, newDoctor);
      } else {
        await addDoctor({ ...newDoctor, tenantId });
      }
      setShowModal(false);
      setEditingDoctorId(null);
      setNewDoctor(initialDoctorState);
    } catch (error) {
      console.error('Failed to save doctor:', error);
    }
  };

  const handleDelete = async (doctorId: string) => {
    try {
      await deleteDoctor(doctorId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete doctor:', error);
    }
  };

  const handleEdit = (doc: Doctor) => {
    setEditingDoctorId(doc.id!);
    setNewDoctor({
      name: doc.name,
      clinicName: doc.clinicName,
      email: doc.email,
      phone: doc.phone,
      address: doc.address
    });
    setShowModal(true);
  };

  const filteredDoctors = doctors.filter(doc => 
    (doc.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (doc.clinicName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (doc.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const isAllSelected = filteredDoctors.length > 0 && filteredDoctors.every(d => selectedIds.includes(d.id!));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const filteredIds = filteredDoctors.map(d => d.id!);
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      const filteredIds = filteredDoctors.map(d => d.id!);
      setSelectedIds(prev => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getActiveCaseCount = (doctorId: string) => {
    return allCases.filter(c => c.doctorId === doctorId && c.status !== 'Delivered').length;
  };

  if (selectedDoctor) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-12 max-w-7xl mx-auto pb-12"
      >
        <div className="bg-white dark:bg-zinc-900 rounded-[48px] border border-border-light dark:border-zinc-800 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-12 border-b border-border-light dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setSelectedDoctor(null)}
                  className="w-14 h-14 flex items-center justify-center bg-white dark:bg-zinc-800 text-text-main dark:text-white rounded-2xl hover:bg-primary hover:text-white transition-all active:scale-90 shadow-sm"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-4xl font-black text-text-main dark:text-white tracking-tight">{selectedDoctor.name}</h2>
                    <div className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                      Client Profile
                    </div>
                  </div>
                  <p className="text-text-muted dark:text-zinc-400 font-medium text-lg flex items-center gap-2">
                    <Building2 size={18} className="text-primary" />
                    {selectedDoctor.clinicName}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-[32px] shadow-sm border border-border-light dark:border-zinc-700 min-w-[160px]">
                  <span className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest block mb-2">Active Cases</span>
                  <span className="text-3xl font-black text-primary">{getActiveCaseCount(selectedDoctor.id!)}</span>
                </div>
                <div className="bg-white dark:bg-zinc-800 p-6 rounded-[32px] shadow-sm border border-border-light dark:border-zinc-700 min-w-[160px]">
                  <span className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest block mb-2">Total Cases</span>
                  <span className="text-3xl font-black text-text-main dark:text-white">{doctorCases.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-12">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-text-main dark:text-white tracking-tight">Case History</h3>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text"
                    placeholder="Filter history..."
                    className="pl-12 pr-6 py-3 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-primary rounded-2xl text-sm font-bold focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-left">
                    <th className="pb-4 px-6 text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em]">Patient Name</th>
                    <th className="pb-4 px-6 text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em]">Case Type</th>
                    <th className="pb-4 px-6 text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em]">Status</th>
                    <th className="pb-4 px-6 text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em]">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorCases.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                          <ClipboardList className="text-zinc-300" size={32} />
                        </div>
                        <p className="text-text-muted dark:text-zinc-500 font-bold">No case history found for this doctor.</p>
                      </td>
                    </tr>
                  ) : (
                    doctorCases.map((c, idx) => (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={c.id} 
                        className="group bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-white dark:hover:bg-zinc-800 transition-all rounded-3xl"
                      >
                        <td className="py-6 px-6 first:rounded-l-[24px]">
                          <span className="text-sm font-black text-text-main dark:text-white">{c.patientName}</span>
                        </td>
                        <td className="py-6 px-6">
                          <span className="text-sm font-bold text-text-muted dark:text-zinc-400">{c.caseType}</span>
                        </td>
                        <td className="py-6 px-6">
                          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            c.status === 'Ready' || c.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-600' :
                            c.status === 'In Progress' ? 'bg-amber-500/10 text-amber-600' :
                            'bg-zinc-500/10 text-zinc-600'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              c.status === 'Ready' || c.status === 'Delivered' ? 'bg-emerald-500' :
                              c.status === 'In Progress' ? 'bg-amber-500' :
                              'bg-zinc-500'
                            }`} />
                            {c.status}
                          </span>
                        </td>
                        <td className="py-6 px-6 last:rounded-r-[24px]">
                          <span className="text-sm font-bold text-text-muted dark:text-zinc-400">
                            {c.dueDate?.toDate ? c.dueDate.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12">
        <div className="text-center lg:text-left">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Client Relationship Management</p>
          <h1 className="text-5xl font-black text-text-main dark:text-white tracking-tight leading-none">Doctors <span className="text-primary">&</span> Clients</h1>
          <p className="text-text-muted dark:text-zinc-400 mt-4 text-lg font-medium max-w-xl">Manage your professional relationships, track case histories, and expand your laboratory's client base.</p>
        </div>
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-4 w-full lg:w-auto">
          <div className="relative group w-full sm:w-72">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search by name, clinic or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white dark:bg-zinc-900 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] text-sm font-bold focus:outline-none transition-all text-text-main dark:text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] dark:shadow-none placeholder:text-text-muted dark:placeholder:text-zinc-500"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => {
                if (!canEdit) return;
                setInvitationLink('');
                setInviteEmail('');
                setShowInviteModal(true);
              }}
              disabled={!canEdit}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-[24px] font-black text-[11px] uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-xl shadow-zinc-900/10 dark:shadow-none active:scale-95 ${!canEdit ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <UserPlus size={18} />
              <span>Send Invite</span>
            </button>
            <button 
              onClick={handleAddClick}
              disabled={isCheckingPlan || !canEdit}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-5 bg-primary text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest hover:bg-primary-light transition-all shadow-2xl shadow-primary/20 active:scale-95 disabled:opacity-50 ${!canEdit ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <Plus size={18} />
              <span>{isCheckingPlan ? 'Checking...' : 'Add Doctor'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {(userRole === 'super_admin' || userRole === 'admin') && selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 100, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-50 bg-zinc-900/90 dark:bg-white/90 backdrop-blur-2xl border border-white/10 dark:border-black/10 rounded-[32px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] p-3 flex items-center gap-2 min-w-[400px]"
          >
            <div className="flex items-center gap-4 px-6 py-3 bg-white/10 dark:bg-black/5 rounded-[24px] mr-2">
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/30">
                {selectedIds.length}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/50 dark:text-black/40 uppercase tracking-widest leading-none mb-1">Selected</span>
                <span className="text-sm font-black text-white dark:text-black leading-none">Doctors</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-1 justify-end pr-2">
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="flex items-center gap-3 px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-rose-500/20"
              >
                <Trash2 size={16} />
                <span>Delete Selected</span>
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-6 py-4 text-white/60 dark:text-black/40 hover:text-white dark:hover:text-black text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {planStatus?.isLimited && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Plan Limit Reached</h4>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              {planStatus.message} Upgrade your plan to add more doctors.
            </p>
          </div>
          <button 
            onClick={() => setPlanStatus(null)}
            className="text-amber-600 hover:text-amber-700 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDoctors.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-white dark:bg-zinc-900 rounded-[48px] border border-border-light dark:border-zinc-800 shadow-sm">
            <div className="w-32 h-32 bg-zinc-50 dark:bg-zinc-800/50 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Building2 className="text-zinc-300 dark:text-zinc-600" size={56} />
            </div>
            <h3 className="text-3xl font-black text-text-main dark:text-zinc-100 tracking-tight">
              {searchTerm ? 'No matches found' : 'No doctors registered'}
            </h3>
            <p className="text-text-muted dark:text-zinc-400 mt-4 max-w-sm mx-auto text-lg font-medium leading-relaxed">
              {searchTerm ? 'Try adjusting your search terms or filters to find what you\'re looking for.' : 'Start by adding your first client to manage your laboratory relationships effectively.'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredDoctors.map((doc, index) => (
              <motion.div
                layout
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className={`group bg-white dark:bg-zinc-900 p-10 rounded-[48px] border-2 transition-all hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-none hover:-translate-y-3 relative overflow-hidden ${
                  selectedIds.includes(doc.id!) 
                    ? 'border-primary bg-primary/[0.02] dark:bg-primary/[0.05]' 
                    : 'border-transparent shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] dark:border-zinc-800'
                }`}
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 transition-transform group-hover:scale-125 duration-700" />
                
                <div className="flex items-start justify-between mb-8 relative z-10">
                  {(userRole === 'super_admin' || userRole === 'admin') && (
                    <button
                      onClick={() => toggleSelect(doc.id!)}
                      className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                        selectedIds.includes(doc.id!) 
                          ? 'bg-primary border-primary shadow-lg shadow-primary/30 scale-110' 
                          : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-primary'
                      }`}
                    >
                      {selectedIds.includes(doc.id!) && <Check className="w-5 h-5 text-white" strokeWidth={4} />}
                    </button>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <button 
                      onClick={() => canEdit && handleEdit(doc)}
                      disabled={!canEdit}
                      className={`w-12 h-12 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 hover:bg-primary/10 text-text-muted dark:text-zinc-500 hover:text-primary rounded-2xl transition-all active:scale-90 ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => canEdit && setShowDeleteConfirm(doc.id!)}
                      disabled={!canEdit}
                      className={`w-12 h-12 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-text-muted dark:text-zinc-500 hover:text-rose-600 rounded-2xl transition-all active:scale-90 ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="w-28 h-28 bg-gradient-to-br from-primary/10 to-primary/5 rounded-[40px] flex items-center justify-center text-primary font-black text-5xl mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    {(doc.name || 'D').charAt(0)}
                  </div>
                  <div className="min-w-0 w-full mb-8">
                    <h3 className="text-3xl font-black text-text-main dark:text-white truncate tracking-tight mb-2">{doc.name}</h3>
                    <div className="inline-flex items-center gap-2 text-[11px] text-primary font-black uppercase tracking-widest bg-primary/5 px-5 py-2 rounded-full">
                      <Building2 size={14} />
                      {doc.clinicName}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-5 mb-10 relative z-10">
                  <div className="flex items-center gap-5 group/item">
                    <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 group-hover/item:bg-primary/10 group-hover/item:text-primary rounded-2xl flex items-center justify-center shrink-0 transition-colors">
                      <Mail size={20} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest mb-0.5">Email Address</span>
                      <span className="text-sm font-bold text-text-main dark:text-zinc-300 truncate">{doc.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 group/item">
                    <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 group-hover/item:bg-primary/10 group-hover/item:text-primary rounded-2xl flex items-center justify-center shrink-0 transition-colors">
                      <Phone size={20} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest mb-0.5">Phone Number</span>
                      <span className="text-sm font-bold text-text-main dark:text-zinc-300">{doc.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 group/item">
                    <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 group-hover/item:bg-primary/10 group-hover/item:text-primary rounded-2xl flex items-center justify-center shrink-0 transition-colors">
                      <MapPin size={20} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest mb-0.5">Clinic Location</span>
                      <span className="text-sm font-bold text-text-main dark:text-zinc-300 truncate">{doc.address}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-border-light dark:border-zinc-800 flex items-center justify-between relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest mb-1">Active Cases</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-2xl font-black text-text-main dark:text-white">{getActiveCaseCount(doc.id!)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedDoctor(doc)}
                    className="px-8 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-widest rounded-[20px] hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all active:scale-95 shadow-lg shadow-zinc-900/10 dark:shadow-none"
                  >
                    View History
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {showBulkDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBulkDeleteConfirm(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-zinc-900 w-full max-w-md rounded-[48px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] p-12 text-center border border-border-light dark:border-zinc-800"
            >
              <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <ShieldAlert size={48} />
              </div>
              <h3 className="text-3xl font-black text-text-main dark:text-white mb-4 tracking-tight">Delete {selectedIds.length} Doctors?</h3>
              <p className="text-text-muted dark:text-zinc-400 text-lg mb-10 leading-relaxed font-medium">
                This action will permanently remove all selected doctors and their associated data. This cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleBulkDelete}
                  className="w-full py-5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-[24px] shadow-xl shadow-rose-600/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
                >
                  Confirm Bulk Delete
                </button>
                <button 
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="w-full py-5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-text-main dark:text-white font-black rounded-[24px] transition-all active:scale-95 uppercase tracking-widest text-xs"
                >
                  Keep Doctors
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-zinc-900 w-full max-w-md rounded-[48px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] p-12 text-center border border-border-light dark:border-zinc-800"
            >
              <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <AlertCircle size={48} />
              </div>
              <h3 className="text-3xl font-black text-text-main dark:text-white mb-4 tracking-tight">Remove Doctor?</h3>
              <p className="text-text-muted dark:text-zinc-400 text-lg mb-10 leading-relaxed font-medium">
                Are you sure you want to remove this doctor? This action is permanent and cannot be reversed.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="w-full py-5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-[24px] shadow-xl shadow-rose-600/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
                >
                  Remove Doctor
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="w-full py-5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-text-main dark:text-white font-black rounded-[24px] transition-all active:scale-95 uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowModal(false);
                setEditingDoctorId(null);
                setNewDoctor(initialDoctorState);
              }}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[48px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-border-light dark:border-zinc-800 my-8"
            >
              <div className="p-12 border-b border-border-light dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/30">
                <div>
                  <h3 className="text-3xl font-black text-text-main dark:text-white tracking-tight">
                    {editingDoctorId ? 'Edit Doctor' : 'Add New Doctor'}
                  </h3>
                  <p className="text-text-muted dark:text-zinc-500 text-lg mt-2 font-medium">Enter the details of your professional client.</p>
                </div>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setEditingDoctorId(null);
                    setNewDoctor(initialDoctorState);
                  }} 
                  className="w-14 h-14 flex items-center justify-center bg-white dark:bg-zinc-800 border border-border-light dark:border-zinc-700 rounded-2xl text-text-muted dark:text-zinc-500 hover:text-primary transition-all active:scale-90 shadow-sm"
                >
                  <Plus className="w-8 h-8 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-12 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Doctor Name</label>
                    <input 
                      required
                      type="text" 
                      value={newDoctor.name}
                      onChange={e => setNewDoctor({...newDoctor, name: e.target.value})}
                      className="w-full px-8 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary rounded-[24px] text-text-main dark:text-white font-bold focus:outline-none transition-all"
                      placeholder="Dr. John Doe"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Clinic Name</label>
                    <input 
                      required
                      type="text" 
                      value={newDoctor.clinicName}
                      onChange={e => setNewDoctor({...newDoctor, clinicName: e.target.value})}
                      className="w-full px-8 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary rounded-[24px] text-text-main dark:text-white font-bold focus:outline-none transition-all"
                      placeholder="Smile Dental Clinic"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Email Address</label>
                    <input 
                      type="email" 
                      value={newDoctor.email}
                      onChange={e => setNewDoctor({...newDoctor, email: e.target.value})}
                      className="w-full px-8 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary rounded-[24px] text-text-main dark:text-white font-bold focus:outline-none transition-all"
                      placeholder="doctor@example.com"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      value={newDoctor.phone}
                      onChange={e => setNewDoctor({...newDoctor, phone: e.target.value})}
                      className="w-full px-8 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary rounded-[24px] text-text-main dark:text-white font-bold focus:outline-none transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Clinic Address</label>
                    <textarea 
                      value={newDoctor.address}
                      onChange={e => setNewDoctor({...newDoctor, address: e.target.value})}
                      className="w-full px-8 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary rounded-[24px] text-text-main dark:text-white font-bold focus:outline-none h-32 transition-all resize-none"
                      placeholder="Enter full clinic address..."
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary-light text-white font-black py-6 rounded-[24px] shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-xl"
                  >
                    {editingDoctorId ? <Edit2 size={24} /> : <CheckCircle2 size={24} />}
                    <span>{editingDoctorId ? 'Update Doctor Profile' : 'Register New Doctor'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInviteModal(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-zinc-900 w-full max-w-md rounded-[48px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-border-light dark:border-zinc-800"
            >
              <div className="p-12 border-b border-border-light dark:border-zinc-800 flex items-center justify-between bg-zinc-900 dark:bg-zinc-100">
                <div>
                  <h3 className="text-3xl font-black text-white dark:text-zinc-900 tracking-tight">Invite Doctor</h3>
                  <p className="text-white/60 dark:text-zinc-500 text-lg mt-2 font-medium">Send a secure registration link.</p>
                </div>
                <button 
                  onClick={() => setShowInviteModal(false)} 
                  className="w-14 h-14 flex items-center justify-center bg-white/10 dark:bg-black/5 rounded-2xl text-white dark:text-zinc-900 hover:bg-white/20 transition-all active:scale-90 shadow-sm"
                >
                  <Plus className="w-8 h-8 rotate-45" />
                </button>
              </div>
              <div className="p-12">
                {!invitationLink ? (
                  <form onSubmit={handleInviteDoctor} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Doctor's Email</label>
                      <input 
                        required
                        type="email" 
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        className="w-full px-8 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary rounded-[24px] text-text-main dark:text-white font-bold focus:outline-none transition-all"
                        placeholder="doctor@example.com"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSendingInvite}
                      className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black py-6 rounded-[24px] shadow-xl shadow-zinc-900/20 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 text-xl"
                    >
                      <Mail size={24} />
                      <span>{isSendingInvite ? 'Generating...' : 'Generate Invite Link'}</span>
                    </button>
                  </form>
                ) : (
                  <div className="space-y-10">
                    <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[32px]">
                      <p className="text-lg text-emerald-600 dark:text-emerald-400 font-black text-center">
                        Invitation link generated successfully!
                      </p>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Share this link with the doctor</label>
                      <div className="flex gap-3">
                        <input 
                          readOnly
                          type="text" 
                          value={invitationLink}
                          className="flex-1 px-8 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent rounded-[24px] text-sm text-text-muted dark:text-zinc-400 font-bold focus:outline-none"
                        />
                        <button 
                          onClick={copyToClipboard}
                          className="w-16 h-16 flex items-center justify-center bg-primary text-white rounded-[24px] hover:bg-primary-light transition-all shadow-xl shadow-primary/20 active:scale-90 shrink-0"
                        >
                          {isCopying ? <Check size={24} /> : <Copy size={24} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => setShowInviteModal(false)}
                        className="w-full py-5 bg-zinc-100 dark:bg-zinc-800 text-text-main dark:text-white font-black rounded-[24px] hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95 uppercase tracking-widest text-xs"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Doctors;
