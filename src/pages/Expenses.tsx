import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  Plus, 
  Search, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreVertical,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  X,
  Calendar,
  Tag,
  CreditCard,
  ShieldAlert,
  Check
} from 'lucide-react';
import { 
  subscribeToExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  Expense
} from '../services/firestoreService';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ExpensesProps {
  tenantId?: string;
  userRole?: string;
  currency?: string;
}

const CATEGORIES = [
  'Materials',
  'Rent',
  'Utilities',
  'Salaries',
  'Marketing',
  'Equipment',
  'Maintenance',
  'Other'
];

const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'Credit Card',
  'UPI',
  'Cheque'
];

const Expenses: React.FC<ExpensesProps> = ({ tenantId, userRole, currency = 'INR' }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const currencySymbol = currency === 'NPR' ? 'रू' : '₹';

  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category: 'Materials',
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'Cash',
    notes: ''
  });

  useEffect(() => {
    if (!tenantId) return;

    const unsubscribe = subscribeToExpenses(tenantId, (data) => {
      setExpenses(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tenantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id!, {
          ...formData,
          amount: Number(formData.amount)
        });
        toast.success('Expense updated successfully');
      } else {
        await addExpense({
          ...formData,
          amount: Number(formData.amount),
          tenantId
        });
        toast.success('Expense added successfully');
      }
      setShowAddModal(false);
      setEditingExpense(null);
      resetForm();
    } catch (error) {
      console.error('Error saving expense:', error);
      // Error is already logged by handleFirestoreError
      toast.error('Failed to save expense. Please check your permissions.');
    }
  };

  const handleDelete = (id: string) => {
    setExpenseToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await deleteExpense(expenseToDelete);
      toast.success('Expense deleted');
      setShowDeleteConfirm(false);
      setExpenseToDelete(null);
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      category: 'Materials',
      date: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'Cash',
      notes: ''
    });
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exp.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || exp.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const isAllSelected = filteredExpenses.length > 0 && filteredExpenses.every(e => selectedIds.includes(e.id!));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const filteredIds = filteredExpenses.map(e => e.id!);
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      const filteredIds = filteredExpenses.map(e => e.id!);
      setSelectedIds(prev => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    const toastId = toast.loading(`Deleting ${selectedIds.length} expenses...`);
    try {
      await Promise.all(selectedIds.map(id => deleteExpense(id)));
      toast.success(`Successfully deleted ${selectedIds.length} expenses`, { id: toastId });
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      toast.error('Failed to delete some expenses', { id: toastId });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-main dark:text-zinc-100 tracking-tight">Expenses</h1>
          <p className="text-text-muted dark:text-zinc-400 mt-1">Track and manage your lab's operational costs.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {userRole === 'super_admin' && filteredExpenses.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-zinc-100 dark:bg-zinc-800 border border-border-light dark:border-zinc-700 rounded-2xl text-sm font-black text-text-main dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
            >
              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isAllSelected ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'border-zinc-300 dark:border-zinc-600'}`}>
                {isAllSelected && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
              </div>
              <span>{isAllSelected ? 'Deselect All' : 'Select All'}</span>
            </button>
          )}
          <button 
            onClick={() => { setEditingExpense(null); resetForm(); setShowAddModal(true); }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary-light transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            <Plus size={24} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {(userRole === 'super_admin' || userRole === 'admin') && selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-50 bg-white dark:bg-zinc-900 border border-border-light dark:border-zinc-800 rounded-[32px] shadow-2xl p-4 flex items-center gap-6 backdrop-blur-xl bg-white/90 dark:bg-zinc-900/90"
          >
            <div className="flex items-center gap-4 px-4 border-r border-border-light dark:border-zinc-800 mr-2">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-lg">
                {selectedIds.length}
              </div>
              <span className="text-sm font-black text-text-main dark:text-zinc-100 uppercase tracking-widest">Selected</span>
            </div>
            <div className="flex items-center gap-3 pr-2">
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-2xl font-black transition-all active:scale-95"
              >
                <Trash2 size={18} />
                <span>Delete Selected</span>
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-6 py-3 text-text-muted dark:text-zinc-500 hover:text-text-main dark:hover:text-zinc-200 font-black transition-all active:scale-95 uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-border-light dark:border-zinc-800 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <p className="text-text-muted dark:text-zinc-500 text-xs font-bold uppercase tracking-widest">Total Expenses</p>
          <h3 className="text-4xl font-black text-red-600 dark:text-red-400 mt-3 tracking-tighter">
            {currencySymbol}{totalExpenses.toLocaleString()}
          </h3>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
            <TrendingDown size={14} />
            <span className="px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-lg text-[10px]">Operational Costs</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-border-light dark:border-zinc-800 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <p className="text-text-muted dark:text-zinc-500 text-xs font-bold uppercase tracking-widest">Categories</p>
          <h3 className="text-4xl font-black text-blue-600 dark:text-blue-400 mt-3 tracking-tighter">{CATEGORIES.length}</h3>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
            <Tag size={14} />
            <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-[10px]">Expense Types</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-border-light dark:border-zinc-800 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
          <p className="text-text-muted dark:text-zinc-500 text-xs font-bold uppercase tracking-widest">Total Records</p>
          <h3 className="text-4xl font-black text-accent mt-3 tracking-tighter">{expenses.length}</h3>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-accent">
            <Calendar size={14} />
            <span className="px-2 py-1 bg-accent/10 rounded-lg text-[10px]">Logged Entries</span>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-[24px] border border-border-light dark:border-zinc-800 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search expenses by description or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-background-alt dark:bg-zinc-800/50 border border-border-light dark:border-zinc-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main dark:text-zinc-200 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-5 h-5 text-text-muted dark:text-zinc-500 hidden sm:block" />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex-1 sm:flex-none px-6 py-3 bg-background-alt dark:bg-zinc-800/50 border border-border-light dark:border-zinc-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main dark:text-zinc-200"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredExpenses.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-20 text-center border border-border-light dark:border-zinc-800 shadow-sm">
              <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="text-zinc-300 dark:text-zinc-600" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-text-main dark:text-zinc-100">No expenses found</h3>
              <p className="text-text-muted dark:text-zinc-400 mt-2 max-w-xs mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredExpenses.map((exp, index) => (
                  <motion.div
                    layout
                    key={exp.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    className={`group bg-white dark:bg-zinc-900 p-6 rounded-[24px] border transition-all hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none hover:-translate-y-1 ${
                      selectedIds.includes(exp.id!) 
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/5' 
                        : 'border-border-light dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-start gap-5 min-w-0 flex-1">
                        {(userRole === 'super_admin' || userRole === 'admin') && (
                          <button
                            onClick={() => toggleSelect(exp.id!)}
                            className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                              selectedIds.includes(exp.id!) 
                                ? 'bg-primary border-primary shadow-lg shadow-primary/20' 
                                : 'border-zinc-300 dark:border-zinc-600 hover:border-primary'
                            }`}
                          >
                            {selectedIds.includes(exp.id!) && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
                          </button>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="font-black text-text-main dark:text-zinc-100 text-xl truncate group-hover:text-primary transition-colors">
                              {exp.description}
                            </h4>
                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                              {exp.category}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-2 text-sm text-text-muted dark:text-zinc-500 font-medium">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(exp.date), 'dd MMM yyyy')}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5" />
                              {exp.paymentMethod}
                            </span>
                            {exp.notes && (
                              <span className="text-xs italic truncate max-w-[200px]">
                                "{exp.notes}"
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between lg:justify-end gap-6 pl-11 lg:pl-0">
                        <div className="text-left sm:text-right">
                          <p className="text-2xl font-black text-red-600 dark:text-red-400 tracking-tight">
                            {currencySymbol}{exp.amount.toLocaleString()}
                          </p>
                          <p className="text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest mt-1">
                            Expense Amount
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => { setEditingExpense(exp); setFormData(exp as any); setShowAddModal(true); }}
                            className="p-4 bg-primary/5 hover:bg-primary/10 rounded-2xl text-primary transition-all active:scale-90"
                            title="Edit Expense"
                          >
                            <Edit2 className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={() => handleDelete(exp.id!)}
                            className="p-4 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-2xl text-red-500 transition-all active:scale-90"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
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

      {/* Modals */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl p-10 text-center border border-border-light dark:border-zinc-800"
            >
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/10">
                <ShieldAlert size={40} />
              </div>
              <h3 className="text-2xl font-black text-text-main dark:text-zinc-100 mb-2 tracking-tight">Delete Record?</h3>
              <p className="text-text-muted dark:text-zinc-400 font-medium mb-8">
                This action will permanently remove this expense record. This cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95"
                >
                  Yes, Delete Record
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-text-main dark:text-zinc-300 font-black rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showBulkDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBulkDeleteConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl p-10 text-center border border-border-light dark:border-zinc-800"
            >
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/10">
                <ShieldAlert size={40} />
              </div>
              <h3 className="text-2xl font-black text-text-main dark:text-zinc-100 mb-2 tracking-tight">Delete {selectedIds.length} Records?</h3>
              <p className="text-text-muted dark:text-zinc-400 font-medium mb-8">
                This action will permanently remove all selected expenses. This cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleBulkDelete}
                  className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95"
                >
                  Yes, Delete All
                </button>
                <button 
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-text-main dark:text-zinc-300 font-black rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl overflow-hidden border border-border-light dark:border-zinc-800"
            >
              <div className="p-8 border-b border-border-light dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/50">
                <div>
                  <h3 className="text-2xl font-black text-text-main dark:text-zinc-100 tracking-tight">
                    {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                  </h3>
                  <p className="text-sm text-text-muted dark:text-zinc-400 font-medium mt-1">Track your laboratory's operational costs.</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="p-3 hover:bg-white dark:hover:bg-zinc-800 rounded-2xl transition-all active:scale-90 text-text-muted dark:text-zinc-500 hover:text-red-500"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest ml-1">Description</label>
                  <input 
                    required
                    type="text" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="e.g. Monthly Rent, Material Purchase"
                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-border-light dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-zinc-100 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest ml-1">Amount ({currencySymbol})</label>
                    <input 
                      required
                      type="number" 
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                      className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-border-light dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-zinc-100 font-black text-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest ml-1">Date</label>
                    <input 
                      required
                      type="date" 
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-border-light dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-zinc-100 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-border-light dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-zinc-100 font-bold"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest ml-1">Payment Method</label>
                    <select 
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-border-light dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-zinc-100 font-bold"
                    >
                      {PAYMENT_METHODS.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-widest ml-1">Notes (Optional)</label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional details about this expense..."
                    rows={3}
                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-border-light dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-zinc-100 font-bold resize-none"
                  />
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    className="w-full py-5 bg-primary text-white rounded-[24px] font-black text-lg hover:bg-primary-light transition-all shadow-xl shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    <span>{editingExpense ? 'Update Expense' : 'Save Expense'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Expenses;
