import React, { useState, useEffect } from 'react';
import { 
  subscribeToInvoices, 
  subscribeToDoctors, 
  addInvoice, 
  consolidateInvoices,
  updateInvoiceStatus,
  deleteInvoice,
  Invoice,
  Doctor,
  subscribeToMyInvoices,
  subscribeToCases,
  Case
} from '../services/firestoreService';
import { Plus, Search, FileText, CheckCircle2, Clock, Download, IndianRupee, Filter, CheckSquare, Square, AlertCircle, Trash2, Calendar, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface InvoicesProps {
  tenantId?: string;
  userRole?: string;
  userId?: string;
  initialShowModal?: boolean;
  canEdit?: boolean;
  currency?: 'INR' | 'NPR';
}

const Invoices: React.FC<InvoicesProps> = ({ tenantId, userRole = 'admin', userId, initialShowModal, canEdit = true, currency = 'INR' }) => {
  const currencySymbol = currency === 'NPR' ? 'रू' : '₹';
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [showModal, setShowModal] = useState(initialShowModal || false);
  const [showMEIModal, setShowMEIModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isSampleInvoice, setIsSampleInvoice] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [newInvoice, setNewInvoice] = useState({
    doctorId: '',
    amount: 0,
    status: 'Pending' as Invoice['status'],
    caseIds: [] as string[],
    billNo: ''
  });

  const [meiConfig, setMeiConfig] = useState({
    doctorId: '',
    month: format(new Date(), 'MMMM'),
    year: new Date().getFullYear(),
    includePreviousInvoices: true,
    includeReadyCases: true
  });

  useEffect(() => {
    let unsubInvoices;
    if (userRole === 'admin' || userRole === 'super_admin') {
      unsubInvoices = subscribeToInvoices(tenantId, setInvoices);
    } else {
      unsubInvoices = subscribeToMyInvoices(tenantId, userRole, userId || '', setInvoices);
    }
    
    const unsubDoctors = subscribeToDoctors(tenantId, setDoctors);
    const unsubCases = subscribeToCases(tenantId, setCases);

    return () => {
      unsubInvoices();
      unsubDoctors();
      unsubCases();
    };
  }, [tenantId, userRole, userId]);

  const readyCases = cases.filter(c => 
    c.status === 'Ready' &&
    !invoices.some(inv => inv.caseIds?.includes(c.id || ''))
  );

  const readyCasesForSelectedDoctor = cases.filter(c => 
    c.doctorId === newInvoice.doctorId && 
    c.status === 'Ready' &&
    !invoices.some(inv => inv.caseIds?.includes(c.id || ''))
  );

  const toggleCaseSelection = (caseId: string, price: number) => {
    const isSelected = newInvoice.caseIds.includes(caseId);
    let updatedCaseIds;
    let updatedAmount;

    if (isSelected) {
      updatedCaseIds = newInvoice.caseIds.filter(id => id !== caseId);
      updatedAmount = newInvoice.amount - price;
    } else {
      updatedCaseIds = [...newInvoice.caseIds, caseId];
      updatedAmount = newInvoice.amount + price;
    }

    setNewInvoice({
      ...newInvoice,
      caseIds: updatedCaseIds,
      amount: updatedAmount
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    try {
      const doctor = doctors.find(d => d.id === newInvoice.doctorId);
      const docName = doctor?.name || '';
      const targetTenantId = doctor?.tenantId || tenantId;

      const invoiceRef = await addInvoice({
        ...newInvoice,
        tenantId: targetTenantId,
        doctorName: docName,
        isSample: isSampleInvoice
      });

      if (isSampleInvoice && invoiceRef) {
        const sampleData = {
          ...newInvoice,
          id: invoiceRef.id,
          tenantId: targetTenantId,
          doctorName: docName,
          isSample: true,
          createdAt: { toDate: () => new Date() }
        } as Invoice;
        setSelectedInvoice(sampleData);
        setShowPreviewModal(true);
      }

      setShowModal(false);
      setIsSampleInvoice(false);
      setNewInvoice({ doctorId: '', amount: 0, status: 'Pending', caseIds: [], billNo: '' });
    } catch (error) {
      console.error('Failed to add invoice:', error);
    }
  };

  const handleMEISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !meiConfig.doctorId) return;

    try {
      const doctor = doctors.find(d => d.id === meiConfig.doctorId);
      const docName = doctor?.name || '';
      const targetTenantId = doctor?.tenantId || tenantId;
      
      // Find previous invoices for this doctor in this month
      const previousInvoices = invoices.filter(inv => 
        inv.doctorId === meiConfig.doctorId && 
        !inv.isMEI && 
        !inv.consolidatedIntoMEIId &&
        inv.createdAt?.toDate && 
        format(inv.createdAt.toDate(), 'MMMM') === meiConfig.month &&
        inv.createdAt.toDate().getFullYear() === meiConfig.year
      );

      // Find ready cases for this doctor
      const readyCasesForDoctor = cases.filter(c => 
        c.doctorId === meiConfig.doctorId && 
        c.status === 'Ready' &&
        !invoices.some(inv => inv.caseIds?.includes(c.id || ''))
      );

      const childInvoiceIds = previousInvoices.map(inv => inv.id!);
      const caseIdsFromReady = readyCasesForDoctor.map(c => c.id!);
      
      // Combine all case IDs
      const allCaseIds = [
        ...previousInvoices.flatMap(inv => inv.caseIds),
        ...caseIdsFromReady
      ];

      const totalAmount = previousInvoices.reduce((sum, inv) => sum + inv.amount, 0) + 
                          readyCasesForDoctor.reduce((sum, c) => sum + c.price, 0);

      await consolidateInvoices({
        tenantId: targetTenantId,
        doctorId: meiConfig.doctorId,
        doctorName: docName,
        caseIds: allCaseIds,
        amount: totalAmount,
        status: 'Pending',
        isMEI: true,
        meiMonth: meiConfig.month,
        meiYear: meiConfig.year,
        childInvoiceIds: childInvoiceIds
      }, childInvoiceIds);

      setShowMEIModal(false);
      setMeiConfig({ ...meiConfig, doctorId: '' });
    } catch (error) {
      console.error('Failed to generate MEI:', error);
    }
  };

  const handleStatusToggle = async (invoiceId: string, currentStatus: string) => {
    if (userRole !== 'admin' && userRole !== 'super_admin') return;
    const newStatus = currentStatus === 'Pending' ? 'Paid' : 'Pending';
    await updateInvoiceStatus(invoiceId, newStatus);
  };

  const handleDownload = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPreviewModal(true);
  };

  const handleDelete = async (invoiceId: string) => {
    try {
      await deleteInvoice(invoiceId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete invoice:', error);
    }
  };

  const handlePrint = () => {
    window.focus();
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('invoice-content');
    const parent = element?.parentElement;
    if (!element) return;
    
    // Add temporary classes to force desktop layout during capture
    element.classList.add('pdf-capture');
    if (parent) parent.classList.add('pdf-capture-parent');
    
    // Reset scroll position to top to avoid cut-off issues
    const originalScrollTop = element.scrollTop;
    element.scrollTop = 0;
    
    // Small delay to let layout settle
    setTimeout(() => {
      const opt = {
        margin: [0.2, 0.2, 0.2, 0.2] as [number, number, number, number],
        filename: `Invoice_${selectedInvoice?.invoiceNumber || selectedInvoice?.billNo || '#INV-' + selectedInvoice?.id?.slice(-6).toUpperCase()}.pdf`,
        image: { type: 'jpeg' as const, quality: 1.0 },
        html2canvas: { 
          scale: 3, 
          useCORS: true, 
          logging: false,
          width: 794, // A4 width in pixels at 96 DPI
          windowWidth: 1024, // Force desktop-like media queries
          scrollY: 0, // Ensure capture starts from top
          scrollX: 0
        },
        jsPDF: { unit: 'in' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: { mode: 'avoid' }
      };
      
      html2pdf().from(element).set(opt).save().then(() => {
        element.classList.remove('pdf-capture');
        if (parent) parent.classList.remove('pdf-capture-parent');
        element.scrollTop = originalScrollTop;
      });
    }, 500); // More delay for stability
  };

  const visibleInvoices = invoices.filter(inv => {
    if (userRole === 'admin' && inv.isSample) return false;
    // Hide consolidated invoices if they are part of an MEI
    if (inv.consolidatedIntoMEIId) return false;
    return true;
  });

  const filteredInvoices = visibleInvoices.filter(inv => {
    const matchesSearch = 
      inv.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.billNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-main dark:text-zinc-100 tracking-tight">Invoices</h1>
          <p className="text-text-muted dark:text-zinc-400 mt-1">Manage billing and financial records for your laboratory.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {(userRole === 'admin' || userRole === 'super_admin') && (
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => {
                  setIsSampleInvoice(true);
                  setShowModal(true);
                }}
                className="flex-1 sm:flex-none bg-accent/10 hover:bg-accent/20 text-accent px-6 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all border border-accent/20 shadow-sm font-black text-sm active:scale-95"
              >
                <FileText className="w-5 h-5" />
                <span>Sample Invoice</span>
              </button>
              <button 
                onClick={() => {
                  setIsSampleInvoice(false);
                  setShowModal(true);
                }}
                disabled={!canEdit}
                className={`flex-1 sm:flex-none bg-primary hover:bg-primary-light text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20 font-black ${!canEdit ? 'cursor-not-allowed opacity-60' : 'active:scale-95'}`}
              >
                <Plus className="w-5 h-5" />
                <span>Generate Invoice</span>
              </button>
              <button 
                onClick={() => setShowMEIModal(true)}
                disabled={!canEdit}
                className={`flex-1 sm:flex-none bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-orange-600/20 font-black ${!canEdit ? 'cursor-not-allowed opacity-60' : 'active:scale-95'}`}
              >
                <Calendar className="w-5 h-5" />
                <span>Generate MEI</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-border-light dark:border-zinc-800 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <p className="text-text-muted dark:text-zinc-500 text-xs font-bold uppercase tracking-widest">Total Outstanding</p>
          <h3 className="text-4xl font-black text-orange-600 dark:text-orange-400 mt-3 tracking-tighter">
            {currencySymbol}{visibleInvoices.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
          </h3>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400">
            <span className="px-2 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg">Awaiting Payment</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-border-light dark:border-zinc-800 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <p className="text-text-muted dark:text-zinc-500 text-xs font-bold uppercase tracking-widest">Collected This Month</p>
          <h3 className="text-4xl font-black text-green-600 dark:text-green-400 mt-3 tracking-tighter">
            {currencySymbol}{visibleInvoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
          </h3>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600 dark:text-green-400">
            <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-lg">Revenue Realized</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-border-light dark:border-zinc-800 shadow-sm relative overflow-hidden group sm:col-span-2 lg:col-span-1"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <p className="text-text-muted dark:text-zinc-500 text-xs font-bold uppercase tracking-widest">Total Invoices</p>
          <h3 className="text-4xl font-black text-primary dark:text-accent mt-3 tracking-tighter">{visibleInvoices.length}</h3>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-primary dark:text-accent">
            <span className="px-2 py-1 bg-primary/10 rounded-lg">Records Generated</span>
          </div>
        </motion.div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-[24px] border border-border-light dark:border-zinc-800 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search by doctor, clinic, or invoice ID..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-background-alt dark:bg-zinc-800/50 border border-border-light dark:border-zinc-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main dark:text-zinc-200 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-5 h-5 text-text-muted dark:text-zinc-500 hidden sm:block" />
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none px-6 py-3 bg-background-alt dark:bg-zinc-800/50 border border-border-light dark:border-zinc-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main dark:text-zinc-200"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredInvoices.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-20 text-center border border-border-light dark:border-zinc-800 shadow-sm">
              <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-zinc-300 dark:text-zinc-600" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-text-main dark:text-zinc-100">No invoices found</h3>
              <p className="text-text-muted dark:text-zinc-400 mt-2 max-w-xs mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredInvoices.map((inv, index) => (
                  <motion.div
                    layout
                    key={inv.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    className="group bg-white dark:bg-zinc-900 p-6 rounded-[24px] border border-border-light dark:border-zinc-800 transition-all hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none hover:-translate-y-1"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-start gap-5 min-w-0 flex-1">
                        <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                          <FileText className="text-zinc-400 dark:text-zinc-500 group-hover:text-primary transition-colors" size={28} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="font-black text-text-main dark:text-zinc-100 text-xl truncate group-hover:text-primary transition-colors">
                              {inv.doctorName}
                            </h4>
                            {inv.isMEI && (
                              <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                MONTH END
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-2 text-sm text-text-muted dark:text-zinc-500 font-medium">
                            <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg">
                              {inv.invoiceNumber || `#INV-${inv.id?.slice(-6).toUpperCase()}`}
                            </span>
                            {inv.billNo && inv.billNo !== inv.invoiceNumber && (
                              <span className="text-primary dark:text-accent font-bold text-xs">Bill: {inv.billNo}</span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {inv.createdAt?.toDate ? format(inv.createdAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between lg:justify-end gap-6 pl-16 lg:pl-0">
                        <div className="text-left sm:text-right">
                          <p className="text-2xl font-black text-text-main dark:text-zinc-100 tracking-tight">
                            {currencySymbol}{inv.amount.toLocaleString()}
                          </p>
                          <button 
                            onClick={() => canEdit && handleStatusToggle(inv.id!, inv.status)}
                            disabled={(userRole !== 'admin' && userRole !== 'super_admin') || !canEdit}
                            className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                              inv.status === 'Paid' 
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                                : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                            } ${(userRole !== 'admin' && userRole !== 'super_admin') || !canEdit ? 'cursor-default' : 'hover:scale-105 active:scale-95'}`}
                          >
                            {inv.status === 'Paid' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {inv.status}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleDownload(inv)}
                            className="p-4 bg-primary/5 hover:bg-primary/10 rounded-2xl text-primary transition-all active:scale-90"
                            title="Download Invoice"
                          >
                            <Download className="w-6 h-6" />
                          </button>
                          {(userRole === 'admin' || userRole === 'super_admin') && (
                            <button 
                              onClick={() => setShowDeleteConfirm(inv.id!)}
                              className="p-4 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-2xl text-red-500 transition-all active:scale-90"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-6 h-6" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* MEI Modal */}
      <AnimatePresence>
        {showMEIModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMEIModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl overflow-hidden border border-border-light dark:border-zinc-800"
            >
              <div className="p-8 border-b border-border-light dark:border-zinc-800 flex items-center justify-between bg-orange-50/30 dark:bg-orange-900/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/20">
                    <Calendar className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-orange-600 dark:text-orange-400 tracking-tight leading-tight">Month End Invoice</h3>
                    <p className="text-sm text-orange-600/60 dark:text-orange-400/60 font-medium">Consolidated billing generation</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMEIModal(false)} 
                  className="p-3 hover:bg-white dark:hover:bg-zinc-800 rounded-2xl transition-all active:scale-90 text-orange-600 dark:text-orange-400"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleMEISubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest ml-1">Select Doctor / Client</label>
                  <select 
                    required
                    value={meiConfig.doctorId}
                    onChange={e => setMeiConfig({...meiConfig, doctorId: e.target.value})}
                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-border-light dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-600/20 transition-all text-text-main dark:text-zinc-100 font-bold"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name} - {d.clinicName}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest ml-1">Month</label>
                    <select 
                      value={meiConfig.month}
                      onChange={e => setMeiConfig({...meiConfig, month: e.target.value})}
                      className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-border-light dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-600/20 transition-all text-text-main dark:text-zinc-100 font-bold"
                    >
                      {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest ml-1">Year</label>
                    <select 
                      value={meiConfig.year}
                      onChange={e => setMeiConfig({...meiConfig, year: parseInt(e.target.value)})}
                      className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-border-light dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-600/20 transition-all text-text-main dark:text-zinc-100 font-bold"
                    >
                      {[2024, 2025, 2026].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {meiConfig.doctorId && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-orange-50 dark:bg-orange-900/10 rounded-3xl border border-orange-100 dark:border-orange-900/20 space-y-4"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-700/70 dark:text-orange-300/70 font-bold uppercase tracking-wider text-[10px]">Previous Invoices</span>
                      <span className="font-black text-orange-900 dark:text-orange-100 bg-white/50 dark:bg-zinc-900/50 px-3 py-1 rounded-full">
                        {invoices.filter(inv => 
                          inv.doctorId === meiConfig.doctorId && 
                          !inv.isMEI && 
                          !inv.consolidatedIntoMEIId &&
                          inv.createdAt?.toDate && 
                          format(inv.createdAt.toDate(), 'MMMM') === meiConfig.month &&
                          inv.createdAt.toDate().getFullYear() === meiConfig.year
                        ).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-700/70 dark:text-orange-300/70 font-bold uppercase tracking-wider text-[10px]">Ready Cases</span>
                      <span className="font-black text-orange-900 dark:text-orange-100 bg-white/50 dark:bg-zinc-900/50 px-3 py-1 rounded-full">
                        {cases.filter(c => 
                          c.doctorId === meiConfig.doctorId && 
                          c.status === 'Ready' &&
                          !invoices.some(inv => inv.caseIds?.includes(c.id || ''))
                        ).length}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-orange-200 dark:border-orange-900/30 flex items-center justify-between">
                      <span className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Estimated Total</span>
                      <span className="text-2xl font-black text-orange-600 dark:text-orange-400 tracking-tighter">
                        {currencySymbol}
                        {(
                          invoices.filter(inv => 
                            inv.doctorId === meiConfig.doctorId && 
                            !inv.isMEI && 
                            !inv.consolidatedIntoMEIId &&
                            inv.createdAt?.toDate && 
                            format(inv.createdAt.toDate(), 'MMMM') === meiConfig.month &&
                            inv.createdAt.toDate().getFullYear() === meiConfig.year
                          ).reduce((sum, inv) => sum + inv.amount, 0) + 
                          cases.filter(c => 
                            c.doctorId === meiConfig.doctorId && 
                            c.status === 'Ready' &&
                            !invoices.some(inv => inv.caseIds?.includes(c.id || ''))
                          ).reduce((sum, c) => sum + c.price, 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                )}

                <button 
                  type="submit" 
                  disabled={!meiConfig.doctorId}
                  className={`w-full py-5 rounded-[24px] font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${
                    !meiConfig.doctorId 
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                      : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20 active:scale-[0.98]'
                  }`}
                >
                  <Plus className="w-6 h-6" />
                  <span>Generate Final MEI</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Invoice Generation Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowModal(false);
                setIsSampleInvoice(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl overflow-hidden border border-border-light dark:border-zinc-800"
            >
              <div className="p-8 border-b border-border-light dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                    <Plus className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-text-main dark:text-zinc-100 tracking-tight leading-tight">
                      {isSampleInvoice ? 'Sample Invoice' : 'Generate Invoice'}
                    </h3>
                    <p className="text-sm text-text-muted dark:text-zinc-400 font-medium">Create billing record for doctor</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setIsSampleInvoice(false);
                  }} 
                  className="p-3 hover:bg-white dark:hover:bg-zinc-800 rounded-2xl transition-all active:scale-90 text-text-muted dark:text-zinc-500 hover:text-red-500"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest ml-1">Manual Bill Number (Optional)</label>
                    <input 
                      type="text" 
                      value={newInvoice.billNo}
                      onChange={e => setNewInvoice({...newInvoice, billNo: e.target.value})}
                      className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-border-light dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-zinc-100 font-bold"
                      placeholder="Enter bill number"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest ml-1">Select Doctor / Client</label>
                    <select 
                      required
                      value={newInvoice.doctorId}
                      onChange={e => {
                        setNewInvoice({
                          ...newInvoice, 
                          doctorId: e.target.value,
                          caseIds: [],
                          amount: 0
                        });
                      }}
                      className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-border-light dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-zinc-100 font-bold"
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map(d => <option key={d.id} value={d.id}>{d.name} - {d.clinicName}</option>)}
                    </select>
                  </div>
                </div>

                {newInvoice.doctorId && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between px-1">
                      <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest">Select Ready Cases</label>
                      {readyCasesForSelectedDoctor.length > 0 && (
                        <button 
                          type="button"
                          onClick={() => {
                            const isAllSelected = readyCasesForSelectedDoctor.every(c => newInvoice.caseIds.includes(c.id!));
                            if (isAllSelected) {
                              setNewInvoice({
                                ...newInvoice,
                                caseIds: [],
                                amount: 0
                              });
                            } else {
                              const allIds = readyCasesForSelectedDoctor.map(c => c.id!);
                              const totalAmount = readyCasesForSelectedDoctor.reduce((sum, c) => sum + c.price, 0);
                              setNewInvoice({
                                ...newInvoice,
                                caseIds: allIds,
                                amount: totalAmount
                              });
                            }
                          }}
                          className="flex items-center gap-2 text-[10px] font-black text-primary dark:text-accent hover:bg-primary/5 px-3 py-1.5 rounded-xl transition-all active:scale-95 border border-primary/10"
                        >
                          <div className={`w-4 h-4 rounded-lg border flex items-center justify-center transition-all ${readyCasesForSelectedDoctor.every(c => newInvoice.caseIds.includes(c.id!)) ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'border-zinc-300 dark:border-zinc-600'}`}>
                            {readyCasesForSelectedDoctor.every(c => newInvoice.caseIds.includes(c.id!)) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                          </div>
                          <span>{readyCasesForSelectedDoctor.every(c => newInvoice.caseIds.includes(c.id!)) ? 'Deselect All' : 'Select All (Monthly Final)'}</span>
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar p-1">
                      {readyCasesForSelectedDoctor.length === 0 ? (
                        <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-700">
                          <p className="text-sm text-text-muted dark:text-zinc-500 font-bold italic">No ready cases found for this doctor.</p>
                        </div>
                      ) : (
                        readyCasesForSelectedDoctor.map(c => (
                          <motion.div 
                            key={c.id} 
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => toggleCaseSelection(c.id!, c.price)}
                            className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                              newInvoice.caseIds.includes(c.id!) 
                                ? 'border-primary dark:border-accent bg-primary/5 dark:bg-accent/5 shadow-sm' 
                                : 'border-border-light dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${newInvoice.caseIds.includes(c.id!) ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'border-zinc-300 dark:border-zinc-600'}`}>
                                {newInvoice.caseIds.includes(c.id!) && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
                              </div>
                              <div>
                                <p className="text-base font-black text-text-main dark:text-zinc-100">{c.patientName}</p>
                                <p className="text-xs text-text-muted dark:text-zinc-500 font-bold uppercase tracking-wider">{c.caseType} • {c.toothNumber}</p>
                              </div>
                            </div>
                            <p className="text-lg font-black text-primary dark:text-accent tracking-tighter">{currencySymbol}{c.price.toLocaleString()}</p>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest ml-1">Total Amount ({currencySymbol})</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-primary dark:text-accent opacity-50">{currencySymbol}</div>
                    <input 
                      required
                      readOnly
                      type="number" 
                      value={newInvoice.amount}
                      className="w-full pl-14 pr-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border border-border-light dark:border-zinc-700 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-primary/20 font-black text-3xl text-primary dark:text-accent tracking-tighter"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-[10px] text-text-muted dark:text-zinc-500 font-bold uppercase tracking-widest ml-1 italic">Calculated automatically from selection</p>
                </div>
                
                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={newInvoice.caseIds.length === 0}
                    className={`w-full py-5 rounded-[24px] font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${
                      newInvoice.caseIds.length === 0 
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                        : 'bg-primary hover:bg-primary-light text-white shadow-primary/20 active:scale-[0.98]'
                    }`}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    <span>{isSampleInvoice ? 'Generate Sample' : 'Generate & Save'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {showPreviewModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPreviewModal(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl my-8 overflow-hidden border border-border-light dark:border-zinc-800"
          >
            <div className="sticky top-0 z-10 p-6 border-b border-border-light dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between no-print">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-text-main dark:text-zinc-100 tracking-tight leading-tight">Invoice Preview</h3>
                  <p className="text-xs text-text-muted dark:text-zinc-500 font-bold uppercase tracking-widest">
                    {selectedInvoice.invoiceNumber || 'Draft Record'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-sm hover:bg-primary-light transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-text-main dark:text-zinc-300 rounded-2xl font-black text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button 
                  onClick={() => setShowPreviewModal(false)} 
                  className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all active:scale-90 text-text-muted dark:text-zinc-500"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div id="invoice-content" className="p-8 sm:p-12 overflow-y-auto max-h-[70vh] bg-zinc-50 dark:bg-zinc-950">
              <div className="bg-white p-8 sm:p-12 rounded-[32px] border border-border-light shadow-inner print:shadow-none print:border-none print:p-0">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-0 pb-8 border-b border-border-light mb-8">
                  <div className="flex flex-col items-start text-left print:text-left">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 print:mb-2 print:w-12 print:h-12">
                      <FileText size={32} className="print:w-6 print:h-6" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-text-main uppercase tracking-tight">Dental Lab</h3>
                    <p className="text-text-muted text-xs sm:text-sm mt-1 print:text-[10px]">Professional Dental Solutions</p>
                    <div className="mt-3 text-xs sm:text-sm text-text-muted">
                      <p>123 Lab Street, Medical Hub</p>
                      <p>Mumbai, Maharashtra - 400001</p>
                      <p>Phone: +91 98765 43210</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right print:text-right w-full sm:w-auto">
                    <h1 className="text-2xl sm:text-4xl font-bold text-text-main uppercase tracking-widest">Invoice</h1>
                    {!selectedInvoice.isSample && (
                      <>
                        <p className="text-text-muted mt-1 font-mono text-xs sm:text-sm">{selectedInvoice.invoiceNumber || `#INV-${selectedInvoice.id?.slice(-6).toUpperCase()}`}</p>
                        {selectedInvoice.billNo && selectedInvoice.billNo !== selectedInvoice.invoiceNumber && (
                          <p className="text-primary font-bold text-sm sm:text-base mt-1">Bill No: {selectedInvoice.billNo}</p>
                        )}
                      </>
                    )}
                    {selectedInvoice.isSample && (
                      <div className="h-6 sm:h-8" />
                    )}
                    <div className="mt-3 text-xs sm:text-sm">
                      <p className="text-text-muted uppercase font-bold text-[10px]">Date Issued</p>
                      <p className="font-bold">{selectedInvoice.createdAt?.toDate ? format(selectedInvoice.createdAt.toDate(), 'MMMM dd, yyyy') : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Bill To */}
                <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 print-grid-2 gap-6 sm:gap-8">
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1 sm:mb-2">Bill To:</p>
                    <h4 className="text-lg sm:text-xl font-bold text-text-main">{selectedInvoice.doctorName}</h4>
                    <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-text-muted space-y-0.5 sm:space-y-1">
                      <p>{doctors.find(d => d.id === selectedInvoice.doctorId)?.clinicName}</p>
                      <p>{doctors.find(d => d.id === selectedInvoice.doctorId)?.address}</p>
                      <p>{doctors.find(d => d.id === selectedInvoice.doctorId)?.phone}</p>
                    </div>
                  </div>
                  <div className="bg-background-alt p-4 sm:p-6 rounded-2xl flex flex-col justify-center items-start sm:items-end print:items-end">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Total Amount Due</p>
                    <h2 className="text-2xl sm:text-4xl font-black text-primary">{currencySymbol}{selectedInvoice.amount.toLocaleString()}</h2>
                    <p className={`mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      selectedInvoice.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      Status: {selectedInvoice.status}
                    </p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border rounded-2xl overflow-hidden overflow-x-auto custom-scrollbar mt-8">
                  <table className="w-full text-left min-w-[450px] sm:min-w-0">
                    <thead className="bg-background-alt text-text-muted text-[10px] uppercase font-bold tracking-widest">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4">Patient Name</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4">Case Details</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs sm:text-sm divide-y">
                      {selectedInvoice.isMEI ? (
                        <>
                          {/* Show Consolidated Invoices */}
                          {invoices.filter(inv => inv.consolidatedIntoMEIId === selectedInvoice.id).map(inv => (
                            <tr key={inv.id} className="bg-orange-50/30 dark:bg-orange-900/5">
                              <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-text-main italic">
                                Invoice Consolidation
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 text-text-muted">
                                {inv.invoiceNumber || inv.billNo} • {inv.createdAt?.toDate ? format(inv.createdAt.toDate(), 'MMM dd') : ''}
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 text-right font-bold">{currencySymbol}{inv.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                          {/* Show New Cases in MEI */}
                          {cases.filter(c => 
                            selectedInvoice.caseIds?.includes(c.id || '') && 
                            !invoices.some(inv => inv.consolidatedIntoMEIId === selectedInvoice.id && inv.caseIds.includes(c.id || ''))
                          ).map(c => (
                            <tr key={c.id}>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-text-main">{c.patientName}</td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 text-text-muted">
                                {c.caseType} • Tooth: {c.toothNumber} (New)
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4 text-right font-bold">{currencySymbol}{c.price.toLocaleString()}</td>
                            </tr>
                          ))}
                        </>
                      ) : (
                        cases.filter(c => selectedInvoice.caseIds?.includes(c.id || '')).map(c => (
                          <tr key={c.id}>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-text-main">{c.patientName}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-text-muted">
                              {c.caseType} • Tooth: {c.toothNumber}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-right font-bold">{currencySymbol}{c.price.toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                      {cases.filter(c => selectedInvoice.caseIds?.includes(c.id || '')).length === 0 && !selectedInvoice.isMEI && (
                        <tr>
                          <td colSpan={3} className="px-6 py-6 text-center text-text-muted italic">
                            Multiple cases included in this summary invoice.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-background-alt font-bold text-xs sm:text-sm">
                      <tr>
                        <td colSpan={2} className="px-4 sm:px-6 py-3 sm:py-4 text-right text-text-muted uppercase tracking-widest text-[10px]">Subtotal</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">{currencySymbol}{selectedInvoice.amount.toLocaleString()}</td>
                      </tr>
                      <tr className="text-base sm:text-lg">
                        <td colSpan={2} className="px-4 sm:px-6 py-4 sm:py-6 text-right text-text-main uppercase tracking-widest text-xs">Total Amount</td>
                        <td className="px-4 sm:px-6 py-4 sm:py-6 text-right text-primary font-black">{currencySymbol}{selectedInvoice.amount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Footer */}
                <div className="pt-6 border-t text-center space-y-1 mt-8">
                  <p className="text-sm font-bold text-text-main">Thank you for your business!</p>
                  <p className="text-[10px] sm:text-xs text-text-muted italic">This is a computer-generated invoice and does not require a physical signature.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-3xl shadow-2xl p-8 border border-border-light dark:border-dark-border animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-text-main dark:text-dark-text text-center mb-2">Delete Invoice?</h3>
            <p className="text-text-muted dark:text-dark-muted text-center mb-8">
              Are you sure you want to delete this invoice? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-6 py-3 bg-background-alt dark:bg-dark-bg text-text-main dark:text-dark-text rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
