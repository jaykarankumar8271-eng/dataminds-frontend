import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  subscribeToCases, 
  subscribeToDoctors, 
  addCase, 
  updateCase,
  deleteCase,
  Case,
  Doctor,
  subscribeToMyCases,
  subscribeToInvoices,
  Invoice
} from '../services/firestoreService';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Package, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  ShieldAlert, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  RefreshCw,
  LayoutGrid,
  List,
  Calendar,
  ArrowRight,
  User2,
  Stethoscope
} from 'lucide-react';
import { format } from 'date-fns';
import { checkPlanLimit, PlanStatus } from '../lib/planUtils';
import { PlanType } from '../constants';
import { toast } from 'sonner';

interface CasesProps {
  tenantId?: string;
  userRole?: string;
  userId?: string;
  initialShowModal?: boolean;
  plan?: PlanType;
  canEdit?: boolean;
  currency?: 'INR' | 'NPR';
}

const Cases: React.FC<CasesProps> = ({ tenantId, userRole = 'admin', userId, initialShowModal, plan = 'Basic', canEdit = true, currency = 'INR' }) => {
  const currencySymbol = currency === 'NPR' ? 'रू' : '₹';
  const [cases, setCases] = useState<Case[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showModal, setShowModal] = useState(initialShowModal || false);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);
  const [isCheckingPlan, setIsCheckingPlan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<Case | null>(null);
  
  const initialCaseState = {
    doctorId: '',
    patientName: '',
    toothNumber: '',
    caseType: '',
    status: 'Received' as Case['status'],
    deliveryDate: '',
    materials: '',
    technique: '',
    shade: '',
    quantity: 1,
    priority: 'Normal' as Case['priority'],
    price: 0,
    notes: '',
    patientAge: '',
    patientGender: ''
  };

  const [newCase, setNewCase] = useState<any>(initialCaseState);

  useEffect(() => {
    let unsubCases = () => {};
    let unsubDoctors = () => {};
    let unsubInvoices = () => {};

    if (userRole === 'admin' || userRole === 'super_admin') {
      unsubCases = subscribeToCases(tenantId, setCases);
      unsubDoctors = subscribeToDoctors(tenantId, setDoctors);
      unsubInvoices = subscribeToInvoices(tenantId, setInvoices);
    } else {
      unsubCases = subscribeToMyCases(tenantId, userRole, userId || '', setCases);
    }
    
    return () => {
      unsubCases();
      unsubDoctors();
      unsubInvoices();
    };
  }, [tenantId, userRole, userId]);

  const handleAddClick = async () => {
    if (!tenantId) return;
    
    setIsCheckingPlan(true);
    const status = await checkPlanLimit(tenantId, plan as PlanType, 'cases');
    setIsCheckingPlan(false);
    
    if (status.isLimited) {
      setPlanStatus(status);
      toast.error(status.message);
    } else {
      setEditingCaseId(null);
      setNewCase(initialCaseState);
      setShowModal(true);
    }
  };


  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    const toastId = toast.loading(`Deleting ${selectedIds.length} cases...`);
    try {
      await Promise.all(selectedIds.map(id => deleteCase(id)));
      toast.success(`Successfully deleted ${selectedIds.length} cases`, { id: toastId });
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      toast.error('Failed to delete some cases', { id: toastId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    setLoading(true);
    try {
      const docName = doctors.find(d => d.id === newCase.doctorId)?.name || '';
      
      const caseData = {
        ...newCase,
        tenantId,
        doctorName: docName,
        deliveryDate: newCase.deliveryDate ? new Date(newCase.deliveryDate) : null,
        patientAge: newCase.patientAge ? Number(newCase.patientAge) : null,
        patientGender: newCase.patientGender || null,
        patientName: newCase.patientName || null
      };

      if (editingCaseId) {
        await updateCase(editingCaseId, caseData);
        toast.success('Case updated successfully');
      } else {
        await addCase(caseData);
        toast.success('Case created successfully');
      }
      
      setShowModal(false);
      setEditingCaseId(null);
      setNewCase(initialCaseState);
    } catch (error) {
      console.error('Failed to save case:', error);
      toast.error('Failed to save case');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (caseId: string, newStatus: Case['status']) => {
    try {
      await updateCase(caseId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (caseId: string) => {
    try {
      await deleteCase(caseId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete case:', error);
    }
  };

  const handleEdit = (c: Case) => {
    setEditingCaseId(c.id!);
    setNewCase({
      doctorId: c.doctorId,
      patientName: c.patientName || '',
      toothNumber: c.toothNumber,
      caseType: c.caseType,
      status: c.status,
      deliveryDate: c.deliveryDate ? (c.deliveryDate instanceof Date ? format(c.deliveryDate, 'yyyy-MM-dd') : format(c.deliveryDate.toDate(), 'yyyy-MM-dd')) : '',
      materials: c.materials || '',
      technique: c.technique || '',
      shade: c.shade || '',
      quantity: c.quantity || 1,
      priority: c.priority || 'Normal',
      price: c.price,
      notes: c.notes || '',
      patientAge: c.patientAge || '',
      patientGender: c.patientGender || ''
    });
    setShowModal(true);
    setShowActionMenu(null);
  };

  const sortedCases = [...cases].sort((a, b) => {
    const getTime = (date: any) => {
      if (!date) return 0;
      if (date.toDate) return date.toDate().getTime();
      if (date instanceof Date) return date.getTime();
      if (typeof date === 'number') return date;
      if (typeof date === 'string') return new Date(date).getTime();
      return 0;
    };
    return getTime(b.createdAt) - getTime(a.createdAt);
  });

  const filteredCases = sortedCases.filter(c => {
    const matchesSearch = (c.id?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (c.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (c.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (c.caseType?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const receivedCasesCount = cases.filter(c => c.status === 'Received').length;
  const readyCasesCount = cases.filter(c => 
    c.status === 'Ready' &&
    !invoices.some(inv => inv.caseIds?.includes(c.id || ''))
  ).length;

  const isAllSelected = filteredCases.length > 0 && filteredCases.every(c => selectedIds.includes(c.id!));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const filteredIds = filteredCases.map(c => c.id!);
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      const filteredIds = filteredCases.map(c => c.id!);
      setSelectedIds(prev => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Received': return <Package className="w-4 h-4" />;
      case 'In Progress': return <Clock className="w-4 h-4" />;
      case 'Ready': return <CheckCircle2 className="w-4 h-4" />;
      case 'Delivered': return <Truck className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Received': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50';
      case 'In Progress': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/50';
      case 'Ready': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50';
      case 'Delivered': return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/50';
      default: return 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800';
    }
  };

  const KanbanColumn = ({ title, status, cases }: { title: string, status: string, cases: Case[] }) => (
    <div className="flex flex-col gap-6 min-w-[350px] flex-1">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)] ${
            status === 'Received' ? 'bg-blue-500 shadow-blue-500/40' : 
            status === 'In Progress' ? 'bg-orange-500 shadow-orange-500/40' : 
            status === 'Ready' ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-zinc-500 shadow-zinc-500/40'
          }`} />
          <h3 className="text-sm font-black text-text-main dark:text-white uppercase tracking-[0.2em]">{title}</h3>
          <div className="bg-zinc-100 dark:bg-zinc-800 text-text-muted dark:text-zinc-400 px-3 py-1 rounded-full text-[10px] font-black shadow-sm">
            {cases.length}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-[32px] border border-border-light dark:border-zinc-800/50 min-h-[600px] backdrop-blur-sm">
        {cases.map((c, index) => (
          <motion.div
            layoutId={c.id}
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedCaseForDetail(c)}
            className="bg-white dark:bg-zinc-900 p-6 rounded-[24px] border border-border-light dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest">#CASE-{c.id?.slice(-6).toUpperCase()}</span>
              {c.priority === 'Urgent' && (
                <span className="bg-rose-500 text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-rose-500/20 animate-pulse">Urgent</span>
              )}
            </div>
            
            <h4 className="text-lg font-black text-text-main dark:text-white mb-2 group-hover:text-primary transition-colors relative z-10">{c.patientName}</h4>
            
            <div className="flex items-center gap-2 text-text-muted dark:text-zinc-400 font-bold text-xs mb-5 relative z-10">
              <div className="w-6 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                <Stethoscope size={12} className="text-primary" />
              </div>
              {c.caseType}
            </div>
            
            <div className="flex items-center justify-between pt-5 border-t border-border-light dark:border-zinc-800 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-text-muted dark:text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <User2 size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest">Doctor</span>
                  <span className="text-[11px] font-bold text-text-main dark:text-zinc-300 truncate max-w-[120px]">{c.doctorName}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest">Due Date</span>
                <div className="flex items-center gap-1.5 text-primary">
                  <Calendar size={12} />
                  <span className="text-[11px] font-black">
                    {c.deliveryDate ? format(c.deliveryDate instanceof Date ? c.deliveryDate : c.deliveryDate.toDate(), 'MMM d') : 'TBD'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {cases.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-20">
            <div className="w-20 h-20 bg-zinc-200 dark:bg-zinc-800 rounded-[32px] flex items-center justify-center mb-4">
              <Package size={40} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em]">No Cases</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Package className="w-6 h-6" />
            </div>
            <h1 className="text-5xl font-black text-text-main dark:text-white tracking-tight">
              Cases <span className="text-primary">&</span> Orders
            </h1>
          </div>
          <p className="text-text-muted dark:text-zinc-400 text-xl font-medium ml-1">
            Production pipeline and case management
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          {/* View Toggle */}
          <div className="bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-[20px] border border-border-light dark:border-zinc-700 flex items-center gap-1">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-3 rounded-2xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-zinc-900 text-primary shadow-xl shadow-black/5' : 'text-text-muted dark:text-zinc-500 hover:text-text-main dark:hover:text-zinc-300'}`}
            >
              <List size={20} />
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-3 rounded-2xl transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-zinc-900 text-primary shadow-xl shadow-black/5' : 'text-text-muted dark:text-zinc-500 hover:text-text-main dark:hover:text-zinc-300'}`}
            >
              <LayoutGrid size={20} />
            </button>
          </div>

          {(userRole === 'admin' || userRole === 'super_admin' || userRole === 'doctor') && (
            <button 
              onClick={handleAddClick}
              disabled={isCheckingPlan || !canEdit}
              className="group relative px-8 py-4 bg-primary hover:bg-primary-light text-white font-black rounded-[24px] shadow-2xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10 uppercase tracking-widest text-xs">
                {isCheckingPlan ? 'Checking...' : 'New Case'}
              </span>
            </button>
          )}
        </motion.div>
      </div>

      {/* Status KPI Cards */}
      {(userRole === 'admin' || userRole === 'super_admin' || userRole === 'doctor') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-border-light dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] mb-1">New Cases</p>
                <h3 className="text-4xl font-black text-text-main dark:text-white tracking-tight">{receivedCasesCount}</h3>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group relative bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-border-light dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] mb-1">Ready Cases</p>
                <h3 className="text-4xl font-black text-text-main dark:text-white tracking-tight">{readyCasesCount}</h3>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {planStatus?.isLimited && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Monthly Limit Reached</h4>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              {planStatus.message} Upgrade your plan to process more cases this month.
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

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by patient, doctor, or case ID..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300"
              >
                <option value="All">All Status</option>
                <option value="Received">Received</option>
                <option value="In Progress">In Progress</option>
                <option value="Ready">Ready</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        {viewMode === 'kanban' ? (
          <div className="p-10 overflow-x-auto">
            <div className="flex gap-10 min-w-max">
              <KanbanColumn title="Received" status="Received" cases={filteredCases.filter(c => c.status === 'Received')} />
              <KanbanColumn title="In Production" status="In Progress" cases={filteredCases.filter(c => c.status === 'In Progress')} />
              <KanbanColumn title="Ready" status="Ready" cases={filteredCases.filter(c => c.status === 'Ready')} />
              <KanbanColumn title="Delivered" status="Delivered" cases={filteredCases.filter(c => c.status === 'Delivered')} />
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="text-text-muted dark:text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-border-light dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <th className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      {(userRole === 'super_admin' || userRole === 'admin') && (
                        <button
                          onClick={toggleSelectAll}
                          className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isAllSelected ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'border-zinc-300 dark:border-zinc-700 hover:border-primary'}`}
                        >
                          {isAllSelected && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                        </button>
                      )}
                      Case ID
                    </div>
                  </th>
                  <th className="px-8 py-6">Doctor</th>
                  <th className="px-8 py-6">Patient</th>
                  <th className="px-8 py-6">Case Type</th>
                  <th className="px-8 py-6">Priority</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <div className="w-24 h-24 bg-zinc-200 dark:bg-zinc-800 rounded-[40px] flex items-center justify-center mb-2">
                          <Package size={48} />
                        </div>
                        <p className="text-sm font-black uppercase tracking-[0.2em]">No cases found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCases.map((c, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      key={c.id} 
                      onClick={() => setSelectedCaseForDetail(c)}
                      className={`border-b border-border-light dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer group ${selectedIds.includes(c.id!) ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          {(userRole === 'super_admin' || userRole === 'admin') && (
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleSelect(c.id!); }}
                              className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.includes(c.id!) ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'border-zinc-300 dark:border-zinc-700 hover:border-primary'}`}
                            >
                              {selectedIds.includes(c.id!) && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                            </button>
                          )}
                          <div>
                            <p className="font-black text-text-main dark:text-white tracking-tight text-base">#CASE-{c.id?.slice(-6).toUpperCase()}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                              <p className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest">Tooth: {c.toothNumber}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-text-muted dark:text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <User2 size={18} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest">Doctor</span>
                            <span className="font-bold text-text-main dark:text-zinc-300">{c.doctorName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest">Patient</span>
                          <span className="font-black text-text-main dark:text-white text-base tracking-tight">{c.patientName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3 text-text-muted dark:text-zinc-400 font-bold">
                          <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                            <Stethoscope size={14} className="text-primary" />
                          </div>
                          {c.caseType}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                          c.priority === 'Urgent' 
                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 animate-pulse' 
                            : 'bg-zinc-100 dark:bg-zinc-800 text-text-muted dark:text-zinc-400'
                        }`}>
                          {c.priority || 'Normal'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusClass(c.status)}`}>
                          {getStatusIcon(c.status)}
                          {c.status}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right relative">
                        <div className="flex justify-end items-center gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!canEdit) return;
                              setShowActionMenu(showActionMenu === c.id ? null : c.id!);
                              setShowStatusDropdown(null);
                            }}
                            disabled={!canEdit}
                            className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-400 transition-colors ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                            
                            {showActionMenu === c.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowActionMenu(null);
                                    setShowStatusDropdown(null);
                                  }}
                                />
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className={`absolute right-8 ${filteredCases.indexOf(c) > filteredCases.length - 3 && filteredCases.length > 3 ? 'bottom-full mb-4' : 'top-16'} w-64 bg-white dark:bg-zinc-900 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-border-light dark:border-zinc-800 py-3 z-50 overflow-hidden backdrop-blur-xl`}
                                  >
                                    <button 
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleEdit(c); }}
                                      className="w-full px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-4 text-text-main dark:text-zinc-200 transition-all group"
                                    >
                                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                        <Edit2 className="w-4 h-4" />
                                      </div>
                                      Edit Case
                                    </button>
                                    
                                    <div className="border-t border-border-light dark:border-zinc-800 my-2 mx-4" />
                                    
                                    <div className="relative">
                                      <button 
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setShowStatusDropdown(showStatusDropdown === c.id ? null : c.id!);
                                        }}
                                        className={`w-full px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-between gap-4 transition-all group ${showStatusDropdown === c.id ? 'bg-primary/5 text-primary' : 'text-text-main dark:text-zinc-200'}`}
                                      >
                                        <div className="flex items-center gap-4">
                                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${showStatusDropdown === c.id ? 'bg-primary/20 text-primary' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:text-primary group-hover:bg-primary/10'}`}>
                                            <RefreshCw className={`w-4 h-4 ${showStatusDropdown === c.id ? 'animate-spin-slow' : ''}`} />
                                          </div>
                                          Update Status
                                        </div>
                                        <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${showStatusDropdown === c.id ? 'rotate-90' : ''}`} />
                                      </button>
                                      
                                      {showStatusDropdown === c.id && (
                                        <div 
                                          className="absolute right-full top-0 mr-4 w-56 bg-white dark:bg-zinc-900 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-border-light dark:border-zinc-800 py-3 z-[60] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300 backdrop-blur-xl"
                                        >
                                          {[
                                            { status: 'Received', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                            { status: 'In Progress', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                            { status: 'Ready', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                            { status: 'Delivered', icon: Truck, color: 'text-zinc-500', bg: 'bg-zinc-500/10' }
                                          ].map((item) => (
                                            <button 
                                              key={item.status}
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleStatusUpdate(c.id!, item.status as any);
                                                setShowActionMenu(null);
                                                setShowStatusDropdown(null);
                                              }}
                                              className={`w-full px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest flex items-center gap-4 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 ${c.status === item.status ? 'text-primary bg-primary/5' : 'text-text-muted dark:text-zinc-400'}`}
                                            >
                                              <div className={`w-8 h-8 ${c.status === item.status ? item.bg : 'bg-zinc-100 dark:bg-zinc-800'} rounded-xl flex items-center justify-center ${c.status === item.status ? item.color : 'text-zinc-400'}`}>
                                                <item.icon className="w-4 h-4" />
                                              </div>
                                              {item.status}
                                              {c.status === item.status && <Check className="w-4 h-4 ml-auto text-primary" strokeWidth={3} />}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    <div className="border-t border-border-light dark:border-zinc-800 my-2 mx-4" />
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteConfirm(c.id!);
                                        setShowActionMenu(null);
                                        setShowStatusDropdown(null);
                                      }}
                                      className="w-full px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-4 text-rose-600 transition-all group"
                                    >
                                      <div className="w-8 h-8 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                                        <Trash2 className="w-4 h-4" />
                                      </div>
                                      Delete Case
                                    </button>
                                  </motion.div>
                              </>
                            )}
                          </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Case Detail Drawer */}
      <AnimatePresence>
        {selectedCaseForDetail && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCaseForDetail(null)}
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md z-[70]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-screen w-full max-w-lg bg-white dark:bg-zinc-900 shadow-2xl z-[80] overflow-y-auto border-l border-border-light dark:border-zinc-800"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] mb-2">Case Overview</span>
                    <h2 className="text-3xl font-black text-text-main dark:text-white tracking-tight">#CASE-{selectedCaseForDetail.id?.slice(-6).toUpperCase()}</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedCaseForDetail(null)}
                    className="w-12 h-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-2xl transition-all active:scale-90"
                  >
                    <Plus className="w-6 h-6 rotate-45 text-text-muted dark:text-zinc-400" />
                  </button>
                </div>

                <div className="space-y-10">
                  {/* Status Section */}
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-8 rounded-[32px] border border-border-light dark:border-zinc-800/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em]">Production Status</span>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusClass(selectedCaseForDetail.status)}`}>
                        {getStatusIcon(selectedCaseForDetail.status)}
                        {selectedCaseForDetail.status}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ 
                            width: selectedCaseForDetail.status === 'Received' ? '25%' :
                                   selectedCaseForDetail.status === 'In Progress' ? '50%' :
                                   selectedCaseForDetail.status === 'Ready' ? '75%' : '100%'
                          }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full shadow-[0_0_15px_rgba(var(--primary),0.5)] ${
                            selectedCaseForDetail.status === 'Received' ? 'bg-blue-500' :
                            selectedCaseForDetail.status === 'In Progress' ? 'bg-orange-500' :
                            selectedCaseForDetail.status === 'Ready' ? 'bg-emerald-500' : 'bg-zinc-500'
                          }`} 
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest">
                        <span>Received</span>
                        <span>In Production</span>
                        <span>Ready</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-8 px-2">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em]">Patient Profile</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <User2 size={20} />
                        </div>
                        <p className="text-lg font-black text-text-main dark:text-white tracking-tight">{selectedCaseForDetail.patientName}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em]">Attending Doctor</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-text-muted dark:text-zinc-400">
                          <Stethoscope size={20} />
                        </div>
                        <p className="text-lg font-black text-text-main dark:text-white tracking-tight">{selectedCaseForDetail.doctorName}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em]">Case Type</p>
                      <p className="text-lg font-black text-text-main dark:text-white tracking-tight">{selectedCaseForDetail.caseType}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em]">Tooth Number</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                        <p className="text-lg font-black text-text-main dark:text-white tracking-tight">{selectedCaseForDetail.toothNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-text-main dark:text-white uppercase tracking-[0.2em] border-b border-border-light dark:border-zinc-800 pb-3">Technical Specifications</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-[24px] border border-border-light dark:border-zinc-800/50">
                        <p className="text-[9px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest mb-2">Material Choice</p>
                        <p className="text-sm font-bold text-text-main dark:text-zinc-300">{selectedCaseForDetail.materials || 'Standard Production'}</p>
                      </div>
                      <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-[24px] border border-border-light dark:border-zinc-800/50">
                        <p className="text-[9px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest mb-2">Shade Selection</p>
                        <p className="text-sm font-bold text-text-main dark:text-zinc-300">{selectedCaseForDetail.shade || 'Not Specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-text-main dark:text-white uppercase tracking-[0.2em] border-b border-border-light dark:border-zinc-800 pb-3">Clinical Notes</h3>
                    <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-[24px] border border-border-light dark:border-zinc-800/50 min-h-[120px]">
                      <p className="text-sm text-text-muted dark:text-zinc-400 leading-relaxed font-medium italic">
                        {selectedCaseForDetail.notes || 'No special clinical instructions provided for this case.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-10 border-t border-border-light dark:border-zinc-800 flex gap-4">
                    <button 
                      onClick={() => { handleEdit(selectedCaseForDetail); setSelectedCaseForDetail(null); }}
                      className="flex-1 py-5 bg-primary hover:bg-primary-light text-white text-[11px] font-black uppercase tracking-widest rounded-[24px] shadow-2xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      <Edit2 size={16} />
                      Edit Case
                    </button>
                    <button 
                      className="px-8 py-5 border-2 border-border-light dark:border-zinc-800 text-text-main dark:text-zinc-300 text-[11px] font-black uppercase tracking-widest rounded-[24px] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      <Package size={16} />
                      Lab Slip
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[40px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] p-12 text-center border border-border-light dark:border-zinc-800"
          >
            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner rotate-12">
              <ShieldAlert className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-black text-text-main dark:text-white mb-4 tracking-tight">Delete {selectedIds.length} Cases?</h3>
            <p className="text-text-muted dark:text-zinc-400 text-base mb-10 leading-relaxed font-medium">This action will permanently remove all selected cases from the system. This operation is <span className="text-rose-500 font-black">irreversible</span>.</p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleBulkDelete}
                className="w-full py-5 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-black uppercase tracking-widest rounded-[24px] shadow-2xl shadow-rose-500/20 transition-all active:scale-95"
              >
                Confirm Bulk Delete
              </button>
              <button 
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="w-full py-5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-text-muted dark:text-zinc-300 text-[11px] font-black uppercase tracking-widest rounded-[24px] transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[40px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] p-12 text-center border border-border-light dark:border-zinc-800"
          >
            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner -rotate-12">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-black text-text-main dark:text-white mb-4 tracking-tight">Delete Case?</h3>
            <p className="text-text-muted dark:text-zinc-400 text-base mb-10 leading-relaxed font-medium">Are you sure you want to delete this case? This action cannot be undone and will remove all associated data.</p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => handleDelete(showDeleteConfirm)}
                className="w-full py-5 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-black uppercase tracking-widest rounded-[24px] shadow-2xl shadow-rose-500/20 transition-all active:scale-95"
              >
                Confirm Delete
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="w-full py-5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-text-muted dark:text-zinc-300 text-[11px] font-black uppercase tracking-widest rounded-[24px] transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xl flex items-start justify-center z-[100] p-4 overflow-y-auto pt-10 sm:pt-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-[40px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] overflow-hidden mb-20 border border-border-light dark:border-zinc-800"
          >
            <div className="bg-zinc-50 dark:bg-zinc-950 p-10 border-b border-border-light dark:border-zinc-800 flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Case Management System</p>
                <h3 className="text-3xl font-black text-text-main dark:text-white tracking-tight">{editingCaseId ? 'Update Case Record' : 'Create New Case'}</h3>
              </div>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingCaseId(null);
                  setNewCase(initialCaseState);
                }} 
                className="w-12 h-12 flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-text-muted dark:text-zinc-400 rounded-2xl transition-all active:scale-90"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 lg:p-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Attending Doctor</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                    <User2 size={18} />
                  </div>
                  <select 
                    required
                    value={newCase.doctorId}
                    onChange={e => setNewCase({...newCase, doctorId: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[20px] text-sm font-bold focus:outline-none transition-all text-text-main dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Patient Name</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                    <User2 size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={newCase.patientName}
                    onChange={e => setNewCase({...newCase, patientName: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[20px] text-sm font-bold focus:outline-none transition-all text-text-main dark:text-white placeholder:text-text-muted dark:placeholder:text-zinc-500"
                    placeholder="Full patient name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Age</label>
                  <input 
                    type="number" 
                    value={newCase.patientAge}
                    onChange={e => setNewCase({...newCase, patientAge: e.target.value})}
                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[20px] text-sm font-bold focus:outline-none transition-all text-text-main dark:text-white"
                    placeholder="Age"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Gender</label>
                  <div className="relative">
                    <select 
                      value={newCase.patientGender}
                      onChange={e => setNewCase({...newCase, patientGender: e.target.value})}
                      className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[20px] text-sm font-bold focus:outline-none transition-all text-text-main dark:text-white appearance-none cursor-pointer"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Case Type</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                    <Stethoscope size={18} />
                  </div>
                  <input 
                    required
                    type="text" 
                    value={newCase.caseType}
                    onChange={e => setNewCase({...newCase, caseType: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[20px] text-sm font-bold focus:outline-none transition-all text-text-main dark:text-white"
                    placeholder="e.g. Zirconia Crown"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Tooth Number(s)</label>
                <input 
                  type="text" 
                  value={newCase.toothNumber}
                  onChange={e => setNewCase({...newCase, toothNumber: e.target.value})}
                  className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[20px] text-sm font-bold focus:outline-none transition-all text-text-main dark:text-white"
                  placeholder="e.g. 14, 26, 32"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Shade Selection</label>
                <input 
                  type="text" 
                  value={newCase.shade}
                  onChange={e => setNewCase({...newCase, shade: e.target.value})}
                  className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[20px] text-sm font-bold focus:outline-none transition-all text-text-main dark:text-white"
                  placeholder="e.g. A1, B2, C3"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Expected Delivery Date</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                    <Calendar size={18} />
                  </div>
                  <input 
                    type="date" 
                    value={newCase.deliveryDate}
                    onChange={e => setNewCase({...newCase, deliveryDate: e.target.value})}
                    className="w-full pl-14 pr-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[20px] text-sm font-bold focus:outline-none transition-all text-text-main dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Material Specification</label>
                <input 
                  type="text" 
                  value={newCase.materials}
                  onChange={e => setNewCase({...newCase, materials: e.target.value})}
                  className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[20px] text-sm font-bold focus:outline-none transition-all text-text-main dark:text-white"
                  placeholder="e.g. High Translucency Zirconia"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Production Technique</label>
                <input 
                  type="text" 
                  value={newCase.technique}
                  onChange={e => setNewCase({...newCase, technique: e.target.value})}
                  className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[20px] text-sm font-bold focus:outline-none transition-all text-text-main dark:text-white"
                  placeholder="e.g. 5-Axis Milling"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Quantity</label>
                  <input 
                    type="number" 
                    value={newCase.quantity}
                    onChange={e => setNewCase({...newCase, quantity: Number(e.target.value)})}
                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[20px] text-sm font-bold focus:outline-none transition-all text-text-main dark:text-white"
                    min="1"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Priority Level</label>
                  <div className="relative">
                    <select 
                      value={newCase.priority}
                      onChange={e => setNewCase({...newCase, priority: e.target.value as Case['priority']})}
                      className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[20px] text-sm font-bold focus:outline-none transition-all text-text-main dark:text-white appearance-none cursor-pointer"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Case Price ({currencySymbol})</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors font-black">
                    {currencySymbol}
                  </div>
                  <input 
                    required
                    type="number" 
                    value={newCase.price}
                    onChange={e => setNewCase({...newCase, price: Number(e.target.value)})}
                    className="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[20px] text-sm font-bold focus:outline-none transition-all text-text-main dark:text-white"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-2">Clinical Notes & Instructions</label>
                <textarea 
                  value={newCase.notes}
                  onChange={e => setNewCase({...newCase, notes: e.target.value})}
                  className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[32px] text-sm font-bold focus:outline-none transition-all text-text-main dark:text-white min-h-[150px] resize-none"
                  placeholder="Enter any special instructions or clinical notes here..."
                />
              </div>

              <div className="md:col-span-2 pt-8 flex flex-col sm:flex-row gap-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-5 bg-primary hover:bg-primary-light text-white text-[11px] font-black uppercase tracking-widest rounded-[24px] shadow-2xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {editingCaseId ? 'Update Case Record' : 'Create Case Record'}
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowModal(false);
                    setEditingCaseId(null);
                    setNewCase(initialCaseState);
                  }}
                  className="px-10 py-5 border-2 border-border-light dark:border-zinc-800 text-text-muted dark:text-zinc-400 text-[11px] font-black uppercase tracking-widest rounded-[24px] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95"
                >
                  Discard Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Cases;
