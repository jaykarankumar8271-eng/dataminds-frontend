import React, { useState, useEffect } from 'react';
import { 
  Tenant, 
  createTenant, 
  subscribeToTenants,
  seedDemoData,
  updateTenant,
  deleteTenant
} from '../services/firestoreService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Edit,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  X,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

interface TenantsProps {
  onSwitchTenant?: (tenantId: string) => void;
  userRole?: string;
  tenantId?: string;
  canEdit?: boolean;
}

const Tenants: React.FC<TenantsProps> = ({ onSwitchTenant, userRole, tenantId, canEdit = true }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [newTenant, setNewTenant] = useState<Omit<Tenant, 'id' | 'createdAt'>>({
    name: '',
    subdomain: '',
    ownerEmail: '',
    address: '',
    phone: '',
    panNo: '',
    registrationNo: '',
    plan: 'Basic',
    status: 'Pending Approval',
    currency: 'INR'
  });

  useEffect(() => {
    const unsubscribe = subscribeToTenants((data) => {
      setTenants(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTenant(newTenant);
      toast.success('Tenant created successfully');
      setShowAddModal(false);
      setNewTenant({
        name: '',
        subdomain: '',
        ownerEmail: '',
        plan: 'Basic',
        status: 'Active'
      });
    } catch (error) {
      toast.error('Failed to create tenant');
    }
  };

  const handleEditTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant?.id) return;
    try {
      await updateTenant(selectedTenant.id, {
        name: selectedTenant.name,
        subdomain: selectedTenant.subdomain,
        ownerEmail: selectedTenant.ownerEmail,
        address: selectedTenant.address,
        phone: selectedTenant.phone,
        panNo: selectedTenant.panNo,
        registrationNo: selectedTenant.registrationNo,
        plan: selectedTenant.plan,
        status: selectedTenant.status,
        currency: selectedTenant.currency
      });
      toast.success('Tenant updated successfully');
      setShowEditModal(false);
      setSelectedTenant(null);
    } catch (error) {
      toast.error('Failed to update tenant');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    const toastId = toast.loading(`Deleting ${selectedIds.length} labs...`);
    try {
      await Promise.all(selectedIds.map(id => deleteTenant(id)));
      toast.success(`Successfully deleted ${selectedIds.length} labs`, { id: toastId });
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
    } catch (error) {
      toast.error('Failed to delete some labs', { id: toastId });
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!window.confirm('Are you sure you want to delete this lab? This action cannot be undone and will delete all associated data.')) return;
    try {
      await deleteTenant(tenantId);
      toast.success('Tenant deleted successfully');
    } catch (error) {
      toast.error('Failed to delete tenant');
    }
  };

  const handleToggleStatus = async (tenant: Tenant) => {
    const newStatus = tenant.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await updateTenant(tenant.id!, { status: newStatus });
      toast.success(`Tenant ${newStatus === 'Active' ? 'activated' : 'suspended'} successfully`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSeedData = async (tenantId: string) => {
    try {
      toast.promise(seedDemoData(tenantId), {
        loading: 'Seeding demo data...',
        success: 'Demo data seeded successfully',
        error: 'Failed to seed demo data'
      });
    } catch (error) {
      console.error('Seed error:', error);
    }
  };

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subdomain.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (userRole === 'admin') {
      return matchesSearch && t.id === tenantId;
    }
    return matchesSearch;
  });

  const isAllSelected = filteredTenants.length > 0 && filteredTenants.every(t => selectedIds.includes(t.id!));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const filteredIds = filteredTenants.map(t => t.id!);
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      const filteredIds = filteredTenants.map(t => t.id!);
      setSelectedIds(prev => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl lg:text-5xl font-black text-text-main dark:text-zinc-100 tracking-tight">
            Labs <span className="text-primary">(Tenants)</span>
          </h1>
          <p className="text-text-muted dark:text-zinc-400 mt-2 text-lg font-medium">Manage labs and platform subscriptions with precision.</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          {filteredTenants.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-zinc-900 border border-border-light dark:border-zinc-800 rounded-2xl text-sm font-black text-text-main dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
            >
              <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isAllSelected ? 'bg-primary border-primary' : 'border-zinc-300 dark:border-zinc-600'}`}>
                {isAllSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={4} />}
              </div>
              <span>{isAllSelected ? 'Deselect All' : 'Select All'}</span>
            </button>
          )}
          {userRole === 'super_admin' && canEdit && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-3 bg-primary hover:bg-primary-light text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 text-lg"
            >
              <Plus className="w-6 h-6" />
              Add New Lab
            </button>
          )}
        </motion.div>
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-border-light dark:border-zinc-800 rounded-[32px] shadow-2xl p-4 flex items-center gap-6"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Labs', value: tenants.length, icon: Building2, color: 'blue' },
          { label: 'Active Subscriptions', value: tenants.filter(t => t.status === 'Active').length, icon: CheckCircle2, color: 'green' },
          { label: 'Platform Plan', value: 'SaaS Pro', icon: Database, color: 'purple' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-border-light dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700`} />
            <div className="flex items-center gap-6 relative z-10">
              <div className={`p-4 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-2xl text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-text-muted dark:text-zinc-500 font-black uppercase tracking-widest text-xs mb-1">{stat.label}</p>
                <p className="text-4xl font-black text-text-main dark:text-zinc-100">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="relative flex-1 max-w-2xl group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search labs, owners, or subdomains..."
              className="w-full pl-16 pr-6 py-5 bg-white dark:bg-zinc-900 border-2 border-border-light dark:border-zinc-800 rounded-[24px] text-lg focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm outline-none text-text-main dark:text-zinc-100 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-[40px] border border-border-light dark:border-zinc-800 shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-800/50">
                  <th className="px-8 py-6 text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={toggleSelectAll}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isAllSelected ? 'bg-primary border-primary' : 'border-zinc-300 dark:border-zinc-600'}`}
                      >
                        {isAllSelected && <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={4} />}
                      </button>
                      Lab Name
                    </div>
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em]">Owner</th>
                  <th className="px-8 py-6 text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em]">Plan</th>
                  <th className="px-8 py-6 text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                    No labs found matching your search.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <motion.tr 
                    key={tenant.id} 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all ${selectedIds.includes(tenant.id!) ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => toggleSelect(tenant.id!)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedIds.includes(tenant.id!) ? 'bg-primary border-primary' : 'border-zinc-300 dark:border-zinc-600'}`}
                        >
                          {selectedIds.includes(tenant.id!) && <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={4} />}
                        </button>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:bg-primary group-hover:text-white transition-all">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            {userRole === 'super_admin' ? (
                              <button 
                                onClick={() => onSwitchTenant?.(tenant.id!)}
                                className="font-black text-text-main dark:text-zinc-100 hover:text-primary dark:hover:text-primary-light transition-colors flex items-center gap-2 group/link text-lg"
                              >
                                {tenant.name}
                                <ExternalLink className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-all -translate-x-2 group-hover/link:translate-x-0" />
                              </button>
                            ) : (
                              <div className="font-black text-text-main dark:text-zinc-100 text-lg">{tenant.name}</div>
                            )}
                            <div className="text-xs text-text-muted dark:text-zinc-500 flex items-center gap-1.5 mt-1 font-bold">
                              <Globe className="w-3.5 h-3.5" />
                              {tenant.subdomain}.dentallab.pro
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-text-main dark:text-zinc-200">{tenant.ownerEmail}</span>
                        <span className="text-[10px] text-text-muted dark:text-zinc-500 font-bold uppercase tracking-wider mt-1">Lab Owner</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        tenant.plan === 'Enterprise' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                        tenant.plan === 'Pro' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                        'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400'
                      }`}>
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        tenant.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        tenant.status === 'Suspended' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          tenant.status === 'Active' ? 'bg-green-500' :
                          tenant.status === 'Suspended' ? 'bg-red-500' :
                          'bg-orange-500'
                        }`} />
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleSeedData(tenant.id!)}
                          className="p-3 text-text-muted dark:text-zinc-500 hover:text-primary dark:hover:text-primary-light hover:bg-primary/10 dark:hover:bg-primary/20 rounded-2xl transition-all active:scale-90"
                          title="Seed Demo Data"
                        >
                          <Database className="w-6 h-6" />
                        </button>
                        <div className="relative">
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === tenant.id ? null : tenant.id!)}
                            className={`p-3 rounded-2xl transition-all active:scale-90 ${activeMenuId === tenant.id ? 'bg-zinc-100 dark:bg-zinc-800 text-text-main dark:text-zinc-100' : 'text-text-muted dark:text-zinc-500 hover:text-text-main dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                          >
                            <MoreVertical className="w-6 h-6" />
                          </button>
                          
                          <AnimatePresence>
                            {activeMenuId === tenant.id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={() => setActiveMenuId(null)}
                                />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 top-full mt-4 w-64 bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl border border-border-light dark:border-zinc-800 z-20 py-4 overflow-hidden"
                                >
                                  <button
                                    onClick={() => {
                                      onSwitchTenant?.(tenant.id!);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-4 px-6 py-4 text-sm text-primary dark:text-primary-light font-black hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors uppercase tracking-widest text-xs"
                                  >
                                    <ExternalLink className="w-5 h-5" />
                                    Manage Lab
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (!canEdit) {
                                        toast.error('Edit mode is locked. Please unlock from the header to make changes.');
                                        return;
                                      }
                                      setSelectedTenant(tenant);
                                      setShowEditModal(true);
                                      setActiveMenuId(null);
                                    }}
                                    className={`w-full flex items-center gap-4 px-6 py-4 text-sm transition-colors uppercase tracking-widest text-xs ${
                                      canEdit ? 'text-text-main dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-black' : 'text-text-muted dark:text-zinc-600 cursor-not-allowed'
                                    }`}
                                  >
                                    <Edit className={`w-5 h-5 ${canEdit ? 'text-blue-500' : 'text-text-muted'}`} />
                                    Edit Lab
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (!canEdit) {
                                        toast.error('Edit mode is locked. Please unlock from the header to make changes.');
                                        return;
                                      }
                                      handleToggleStatus(tenant);
                                      setActiveMenuId(null);
                                    }}
                                    className={`w-full flex items-center gap-4 px-6 py-4 text-sm transition-colors uppercase tracking-widest text-xs ${
                                      canEdit ? 'text-text-main dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-black' : 'text-text-muted dark:text-zinc-600 cursor-not-allowed'
                                    }`}
                                  >
                                    {tenant.status === 'Active' ? (
                                      <>
                                        <ShieldAlert className={`w-5 h-5 ${canEdit ? 'text-orange-500' : 'text-text-muted'}`} />
                                        Suspend Lab
                                      </>
                                    ) : (
                                      <>
                                        <ShieldCheck className={`w-5 h-5 ${canEdit ? 'text-green-500' : 'text-text-muted'}`} />
                                        Activate Lab
                                      </>
                                    )}
                                  </button>
                                  <div className="h-px bg-border-light dark:bg-zinc-800 my-2 mx-4" />
                                  <button
                                    onClick={() => {
                                      if (!canEdit) {
                                        toast.error('Edit mode is locked. Please unlock from the header to make changes.');
                                        return;
                                      }
                                      handleDeleteTenant(tenant.id!);
                                      setActiveMenuId(null);
                                    }}
                                    className={`w-full flex items-center gap-4 px-6 py-4 text-sm transition-colors uppercase tracking-widest text-xs ${
                                      canEdit ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-black' : 'text-text-muted dark:text-zinc-600 cursor-not-allowed'
                                    }`}
                                  >
                                    <Trash2 className="w-5 h-5" />
                                    Delete Lab
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
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
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl overflow-hidden border border-border-light dark:border-zinc-800"
            >
              <div className="p-10 text-center">
                <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-[32px] flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-8 animate-pulse">
                  <Trash2 className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-black text-text-main dark:text-zinc-100 mb-4 tracking-tight">Bulk Delete</h3>
                <p className="text-text-muted dark:text-zinc-400 text-lg font-medium leading-relaxed">
                  Are you absolutely sure you want to delete <span className="text-red-600 dark:text-red-400 font-black">{selectedIds.length}</span> labs? This action is irreversible.
                </p>
              </div>
              <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 flex gap-4">
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="flex-1 px-8 py-4 bg-white dark:bg-zinc-900 border border-border-light dark:border-zinc-700 text-text-main dark:text-zinc-200 font-black rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95 uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-lg shadow-red-600/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
                >
                  Delete All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Tenant Modal */}
      <AnimatePresence>
        {showEditModal && selectedTenant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowEditModal(false);
                setSelectedTenant(null);
              }}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-zinc-900 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col border border-border-light dark:border-zinc-800 max-h-[90vh]"
            >
              <div className="p-10 bg-primary text-white relative flex-shrink-0">
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTenant(null);
                  }}
                  className="absolute right-8 top-8 p-3 hover:bg-white/20 rounded-2xl transition-all active:scale-90"
                >
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-4xl font-black tracking-tight">Edit Lab</h2>
                <p className="text-white/80 text-lg font-medium mt-2">Update lab details and subscription</p>
              </div>
              <form onSubmit={handleEditTenant} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Lab Name</label>
                      <input 
                        type="text"
                        required
                        className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg"
                        placeholder="e.g. City Dental Lab"
                        value={selectedTenant.name}
                        onChange={(e) => setSelectedTenant({...selectedTenant, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Subdomain</label>
                      <div className="relative group">
                        <input 
                          type="text"
                          required
                          disabled={userRole !== 'super_admin'}
                          className={`w-full pl-6 pr-32 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg ${userRole !== 'super_admin' ? 'opacity-60 cursor-not-allowed' : ''}`}
                          placeholder="city-dental"
                          value={selectedTenant.subdomain}
                          onChange={(e) => setSelectedTenant({...selectedTenant, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted dark:text-zinc-500 font-black text-sm">.dentallab.pro</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Owner Email</label>
                    <input 
                      type="email"
                      required
                      disabled={userRole !== 'super_admin'}
                      className={`w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg ${userRole !== 'super_admin' ? 'opacity-60 cursor-not-allowed' : ''}`}
                      placeholder="owner@example.com"
                      value={selectedTenant.ownerEmail}
                      onChange={(e) => setSelectedTenant({...selectedTenant, ownerEmail: e.target.value})}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Lab Address</label>
                    <textarea 
                      className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg min-h-[120px] resize-none"
                      placeholder="Full lab address"
                      value={selectedTenant.address || ''}
                      onChange={(e) => setSelectedTenant({...selectedTenant, address: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                      <input 
                        type="text"
                        className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg"
                        placeholder="Phone number"
                        value={selectedTenant.phone || ''}
                        onChange={(e) => setSelectedTenant({...selectedTenant, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Currency</label>
                      <select 
                        className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg appearance-none cursor-pointer"
                        value={selectedTenant.currency || 'INR'}
                        onChange={(e) => setSelectedTenant({...selectedTenant, currency: e.target.value as any})}
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="NPR">NPR (रू)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">PAN No</label>
                      <input 
                        type="text"
                        className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg"
                        placeholder="PAN Number"
                        value={selectedTenant.panNo || ''}
                        onChange={(e) => setSelectedTenant({...selectedTenant, panNo: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Registration No</label>
                      <input 
                        type="text"
                        className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg"
                        placeholder="Registration Number"
                        value={selectedTenant.registrationNo || ''}
                        onChange={(e) => setSelectedTenant({...selectedTenant, registrationNo: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Subscription Plan</label>
                      <select 
                        disabled={userRole !== 'super_admin'}
                        className={`w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg appearance-none cursor-pointer ${userRole !== 'super_admin' ? 'opacity-60 cursor-not-allowed' : ''}`}
                        value={selectedTenant.plan}
                        onChange={(e) => setSelectedTenant({...selectedTenant, plan: e.target.value as any})}
                      >
                        <option value="Basic">Basic Plan</option>
                        <option value="Pro">Pro Plan</option>
                        <option value="Enterprise">Enterprise Plan</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Lab Status</label>
                      <select 
                        disabled={userRole !== 'super_admin'}
                        className={`w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg appearance-none cursor-pointer ${userRole !== 'super_admin' ? 'opacity-60 cursor-not-allowed' : ''}`}
                        value={selectedTenant.status}
                        onChange={(e) => setSelectedTenant({...selectedTenant, status: e.target.value as any})}
                      >
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Trial">Trial</option>
                        <option value="Pending Approval">Pending Approval</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="p-10 bg-zinc-50 dark:bg-zinc-800/50 flex gap-6 flex-shrink-0">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedTenant(null);
                    }}
                    className="flex-1 px-8 py-5 bg-white dark:bg-zinc-900 border-2 border-border-light dark:border-zinc-700 text-text-main dark:text-zinc-200 font-black rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95 uppercase tracking-widest text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-8 py-5 bg-primary hover:bg-primary-light text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Tenant Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-zinc-900 rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col border border-border-light dark:border-zinc-800 max-h-[90vh]"
            >
              <div className="p-10 bg-primary text-white relative flex-shrink-0">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="absolute right-8 top-8 p-3 hover:bg-white/20 rounded-2xl transition-all active:scale-90"
                >
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-4xl font-black tracking-tight">Add New Lab</h2>
                <p className="text-white/80 text-lg font-medium mt-2">Create a new lab instance on the platform</p>
              </div>
              <form onSubmit={handleAddTenant} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Lab Name</label>
                      <input 
                        type="text"
                        required
                        className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg"
                        placeholder="e.g. City Dental Lab"
                        value={newTenant.name}
                        onChange={(e) => setNewTenant({...newTenant, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Subdomain</label>
                      <div className="relative group">
                        <input 
                          type="text"
                          required
                          className="w-full pl-6 pr-32 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg"
                          placeholder="city-dental"
                          value={newTenant.subdomain}
                          onChange={(e) => setNewTenant({...newTenant, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted dark:text-zinc-500 font-black text-sm">.dentallab.pro</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Owner Email</label>
                    <input 
                      type="email"
                      required
                      className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg"
                      placeholder="owner@example.com"
                      value={newTenant.ownerEmail}
                      onChange={(e) => setNewTenant({...newTenant, ownerEmail: e.target.value})}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Lab Address</label>
                    <textarea 
                      className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg min-h-[120px] resize-none"
                      placeholder="Full lab address"
                      value={newTenant.address}
                      onChange={(e) => setNewTenant({...newTenant, address: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                      <input 
                        type="text"
                        className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg"
                        placeholder="Phone number"
                        value={newTenant.phone}
                        onChange={(e) => setNewTenant({...newTenant, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Currency</label>
                      <select 
                        className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg appearance-none cursor-pointer"
                        value={newTenant.currency}
                        onChange={(e) => setNewTenant({...newTenant, currency: e.target.value as any})}
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="NPR">NPR (रू)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">PAN No</label>
                      <input 
                        type="text"
                        className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg"
                        placeholder="PAN Number"
                        value={newTenant.panNo}
                        onChange={(e) => setNewTenant({...newTenant, panNo: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Registration No</label>
                      <input 
                        type="text"
                        className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg"
                        placeholder="Registration Number"
                        value={newTenant.registrationNo}
                        onChange={(e) => setNewTenant({...newTenant, registrationNo: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Subscription Plan</label>
                      <select 
                        className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg appearance-none cursor-pointer"
                        value={newTenant.plan}
                        onChange={(e) => setNewTenant({...newTenant, plan: e.target.value as any})}
                      >
                        <option value="Basic">Basic Plan</option>
                        <option value="Pro">Pro Plan</option>
                        <option value="Enterprise">Enterprise Plan</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-text-muted dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Initial Status</label>
                      <select 
                        className="w-full px-6 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-zinc-900 rounded-[24px] transition-all outline-none text-text-main dark:text-zinc-100 font-bold text-lg appearance-none cursor-pointer"
                        value={newTenant.status}
                        onChange={(e) => setNewTenant({...newTenant, status: e.target.value as any})}
                      >
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Trial">Trial</option>
                        <option value="Pending Approval">Pending Approval</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="p-10 bg-zinc-50 dark:bg-zinc-800/50 flex gap-6 flex-shrink-0">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-8 py-5 bg-white dark:bg-zinc-900 border-2 border-border-light dark:border-zinc-700 text-text-main dark:text-zinc-200 font-black rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-95 uppercase tracking-widest text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-8 py-5 bg-primary hover:bg-primary-light text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
                  >
                    Create Lab
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

export default Tenants;
