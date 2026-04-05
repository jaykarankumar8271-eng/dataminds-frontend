import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreVertical,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  X,
  ChevronRight,
  TrendingUp,
  Box
} from 'lucide-react';
import { 
  subscribeToInventory, 
  addInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem, 
  recordMaterialUsage,
  subscribeToMaterialUsage,
  InventoryItem,
  MaterialUsage,
  subscribeToCases,
  Case
} from '../services/firestoreService';
import { toast } from 'sonner';

interface InventoryProps {
  tenantId?: string;
  userRole?: string;
  userId?: string;
  currency?: string;
}

const Inventory: React.FC<InventoryProps> = ({ tenantId, userRole, userId, currency = 'INR' }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const currencySymbol = currency === 'NPR' ? 'रू' : '₹';
  const [usageHistory, setUsageHistory] = useState<MaterialUsage[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'stock' | 'usage'>('stock');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    category: 'Blocks',
    unit: 'pcs',
    quantity: 0,
    minThreshold: 5,
    costPerUnit: 0,
    supplier: ''
  });

  const [usageData, setUsageData] = useState({
    itemId: '',
    caseId: '',
    quantityUsed: 1
  });

  useEffect(() => {
    if (!tenantId) return;

    const unsubInventory = subscribeToInventory(tenantId, (data) => {
      setItems(data);
      setLoading(false);
    });

    const unsubUsage = subscribeToMaterialUsage(tenantId, undefined, (data) => {
      setUsageHistory(data);
    });

    const unsubCases = subscribeToCases(tenantId, (data) => {
      setCases(data.filter(c => c.status === 'In Progress'));
    });

    return () => {
      unsubInventory();
      unsubUsage();
      unsubCases();
    };
  }, [tenantId, userId]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id!, {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Item updated successfully');
      } else {
        await addInventoryItem({
          ...formData,
          tenantId,
          updatedAt: new Date().toISOString()
        });
        toast.success('Item added to inventory');
      }
      setShowAddModal(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to save item');
    }
  };

  const handleRecordUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    const selectedItem = items.find(i => i.id === usageData.itemId);
    const selectedCase = cases.find(c => c.id === usageData.caseId);

    try {
      await recordMaterialUsage({
        ...usageData,
        tenantId,
        itemName: selectedItem?.name,
        timestamp: new Date().toISOString()
      });
      toast.success('Usage recorded successfully');
      setShowUsageModal(false);
      setUsageData({ itemId: '', caseId: '', quantityUsed: 1 });
    } catch (error: any) {
      toast.error(error.message || 'Failed to record usage');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteInventoryItem(id);
        toast.success('Item deleted');
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Blocks',
      unit: 'pcs',
      quantity: 0,
      minThreshold: 5,
      costPerUnit: 0,
      supplier: ''
    });
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = items.filter(item => item.quantity <= item.minThreshold);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main dark:text-dark-text">Inventory Management</h1>
          <p className="text-text-muted dark:text-dark-muted">Track lab materials, stock levels, and usage.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowUsageModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-card border border-border-light dark:border-dark-border rounded-xl text-text-main dark:text-dark-text font-bold hover:bg-background-alt dark:hover:bg-dark-bg transition-all shadow-sm"
          >
            <TrendingUp size={18} className="text-accent" />
            <span>Record Usage</span>
          </button>
          {userRole === 'admin' && (
            <button 
              onClick={() => { setEditingItem(null); resetForm(); setShowAddModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-light transition-all shadow-lg"
            >
              <Plus size={18} />
              <span>Add Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-border-light dark:border-dark-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Package className="text-primary" size={24} />
            </div>
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">+12% this month</span>
          </div>
          <p className="text-sm font-medium text-text-muted dark:text-dark-muted uppercase tracking-wider">Total Items</p>
          <h3 className="text-3xl font-bold text-text-main dark:text-dark-text mt-1">{items.length}</h3>
        </div>

        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-border-light dark:border-dark-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/10 rounded-2xl">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            {lowStockItems.length > 0 && (
              <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-full">Action Required</span>
            )}
          </div>
          <p className="text-sm font-medium text-text-muted dark:text-dark-muted uppercase tracking-wider">Low Stock Alerts</p>
          <h3 className="text-3xl font-bold text-text-main dark:text-dark-text mt-1">{lowStockItems.length}</h3>
        </div>

        <div className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-border-light dark:border-dark-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-accent/10 rounded-2xl">
              <History className="text-accent" size={24} />
            </div>
          </div>
          <p className="text-sm font-medium text-text-muted dark:text-dark-muted uppercase tracking-wider">Usage Records (30d)</p>
          <h3 className="text-3xl font-bold text-text-main dark:text-dark-text mt-1">{usageHistory.length}</h3>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-dark-card rounded-3xl border border-border-light dark:border-dark-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border-light dark:border-dark-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-background-alt dark:bg-dark-bg rounded-xl border border-border-light dark:border-dark-border w-fit">
            <button 
              onClick={() => setActiveTab('stock')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'stock' ? 'bg-white dark:bg-dark-card text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
            >
              Current Stock
            </button>
            <button 
              onClick={() => setActiveTab('usage')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'usage' ? 'bg-white dark:bg-dark-card text-primary shadow-sm' : 'text-text-muted hover:text-text-main'}`}
            >
              Usage History
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text" 
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm w-full md:w-64"
              />
            </div>
            <button className="p-2 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl text-text-muted hover:text-text-main transition-all">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'stock' ? (
            <table className="w-full">
              <thead>
                <tr className="bg-background-alt dark:bg-dark-bg/50 border-b border-border-light dark:border-dark-border">
                  <th className="px-6 py-4 text-left text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Stock Level</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Unit Cost</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-dark-border">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-background-alt/50 dark:hover:bg-dark-bg/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${item.quantity <= item.minThreshold ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
                          <Box size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-text-main dark:text-dark-text">{item.name}</p>
                          {item.quantity <= item.minThreshold && (
                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Low Stock</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-secondary dark:bg-primary/20 text-primary dark:text-accent rounded-lg text-xs font-bold">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${item.quantity <= item.minThreshold ? 'text-red-500' : 'text-text-main dark:text-dark-text'}`}>
                          {item.quantity}
                        </span>
                        <span className="text-xs text-text-muted dark:text-dark-muted">{item.unit}</span>
                      </div>
                      <div className="w-24 h-1.5 bg-background-alt dark:bg-dark-bg rounded-full mt-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${item.quantity <= item.minThreshold ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min((item.quantity / (item.minThreshold * 3)) * 100, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-text-main dark:text-dark-text">
                      {currencySymbol}{item.costPerUnit}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted dark:text-dark-muted">
                      {item.supplier || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingItem(item); setFormData(item as any); setShowAddModal(true); }}
                          className="p-2 hover:bg-white dark:hover:bg-dark-card rounded-lg text-text-muted hover:text-primary transition-all shadow-sm border border-transparent hover:border-border-light dark:hover:border-dark-border"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id!)}
                          className="p-2 hover:bg-red-50 rounded-lg text-text-muted hover:text-red-600 transition-all shadow-sm border border-transparent hover:border-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="max-w-xs mx-auto">
                        <Package size={48} className="mx-auto text-text-muted/20 mb-4" />
                        <p className="text-text-main dark:text-dark-text font-bold">No items found</p>
                        <p className="text-text-muted dark:text-dark-muted text-sm">Try adjusting your search or add a new item to the inventory.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-background-alt dark:bg-dark-bg/50 border-b border-border-light dark:border-dark-border">
                  <th className="px-6 py-4 text-left text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Item</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Case ID</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-dark-border">
                {usageHistory.map((usage) => (
                  <tr key={usage.id} className="hover:bg-background-alt/50 dark:hover:bg-dark-bg/20 transition-colors">
                    <td className="px-6 py-4 text-sm text-text-muted dark:text-dark-muted">
                      {new Date(usage.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-text-main dark:text-dark-text">
                      {usage.itemName || 'Unknown Item'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-red-500">-{usage.quantityUsed}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono bg-background-alt dark:bg-dark-bg px-2 py-1 rounded border border-border-light dark:border-dark-border">
                        #{usage.caseId.slice(-6)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="flex items-center justify-end gap-1 text-green-500 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle2 size={14} />
                        Recorded
                      </span>
                    </td>
                  </tr>
                ))}
                {usageHistory.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="max-w-xs mx-auto">
                        <History size={48} className="mx-auto text-text-muted/20 mb-4" />
                        <p className="text-text-main dark:text-dark-text font-bold">No usage history</p>
                        <p className="text-text-muted dark:text-dark-muted text-sm">Material usage records will appear here once recorded.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border-light dark:border-dark-border flex items-center justify-between">
                <h3 className="text-xl font-bold text-text-main dark:text-dark-text">
                  {editingItem ? 'Edit Inventory Item' : 'Add New Item'}
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-background-alt dark:hover:bg-dark-bg rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddItem} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Item Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Zirconia Block A2"
                    className="w-full px-4 py-3 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-dark-text"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-dark-text"
                    >
                      <option>Blocks</option>
                      <option>Porcelain</option>
                      <option>Alloy</option>
                      <option>Implants</option>
                      <option>Supplies</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Unit</label>
                    <select 
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full px-4 py-3 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-dark-text"
                    >
                      <option>pcs</option>
                      <option>grams</option>
                      <option>ml</option>
                      <option>packs</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Initial Quantity</label>
                    <input 
                      required
                      type="number" 
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-dark-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Min Threshold</label>
                    <input 
                      required
                      type="number" 
                      value={formData.minThreshold}
                      onChange={(e) => setFormData({...formData, minThreshold: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-dark-text"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Cost per Unit</label>
                    <input 
                      type="number" 
                      value={formData.costPerUnit}
                      onChange={(e) => setFormData({...formData, costPerUnit: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-dark-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Supplier</label>
                    <input 
                      type="text" 
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      className="w-full px-4 py-3 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-dark-text"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-light transition-all shadow-lg shadow-primary/20"
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Usage Modal */}
      <AnimatePresence>
        {showUsageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUsageModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border-light dark:border-dark-border flex items-center justify-between">
                <h3 className="text-xl font-bold text-text-main dark:text-dark-text">Record Material Usage</h3>
                <button onClick={() => setShowUsageModal(false)} className="p-2 hover:bg-background-alt dark:hover:bg-dark-bg rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleRecordUsage} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Select Item</label>
                  <select 
                    required
                    value={usageData.itemId}
                    onChange={(e) => setUsageData({...usageData, itemId: e.target.value})}
                    className="w-full px-4 py-3 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-dark-text"
                  >
                    <option value="">Select an item...</option>
                    {items.map(item => (
                      <option key={item.id} value={item.id} disabled={item.quantity <= 0}>
                        {item.name} ({item.quantity} {item.unit} available)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Associate with Case</label>
                  <select 
                    required
                    value={usageData.caseId}
                    onChange={(e) => setUsageData({...usageData, caseId: e.target.value})}
                    className="w-full px-4 py-3 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-dark-text"
                  >
                    <option value="">Select active case...</option>
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>
                        #{c.id?.slice(-6)} - {c.patientName} ({c.caseType})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Quantity Used</label>
                    <input 
                      required
                      type="number" 
                      min="1"
                      value={usageData.quantityUsed}
                      onChange={(e) => setUsageData({...usageData, quantityUsed: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-dark-text"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full py-4 bg-accent text-white rounded-2xl font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
                  >
                    Record Usage
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

export default Inventory;
