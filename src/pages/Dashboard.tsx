import React, { useState, useEffect } from 'react';
import { 
  subscribeToCases, 
  subscribeToInvoices, 
  subscribeToDoctors,
  Case,
  Invoice,
  Doctor,
  subscribeToMyCases,
  subscribeToMyInvoices,
  UserProfile,
  subscribeToPendingApprovals
} from '../services/firestoreService';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ArrowUpRight,
  Database,
  UserPlus,
  FilePlus,
  Users,
  Receipt,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  Zap,
  Activity,
  Package,
  Truck,
  BarChart3,
  Search,
  Filter
} from 'lucide-react';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { PLAN_LIMITS, PlanType } from '../constants';
import { getPlanStatus, PlanStatus } from '../lib/planUtils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  tenantId?: string;
  userRole?: string;
  userEmail?: string;
  userId?: string;
  plan?: PlanType;
  onSeedData?: () => void;
  onNavigate: (tab: string, openModal?: boolean) => void;
  isImpersonating?: boolean;
  onExitImpersonation?: () => void;
  tenantName?: string;
  currency?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  tenantId, 
  userRole, 
  userEmail, 
  userId, 
  plan = 'Basic', 
  onSeedData, 
  onNavigate,
  isImpersonating,
  onExitImpersonation,
  tenantName,
  currency = 'INR'
}) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [tenants, setTenants] = useState<string[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<number>(0);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [planUsage, setPlanUsage] = useState<{
    doctors: PlanStatus;
    cases: PlanStatus;
  } | null>(null);

  useEffect(() => {
    if (tenantId && isAdmin) {
      const fetchPlanUsage = async () => {
        const doctorsStatus = await getPlanStatus(tenantId, plan as PlanType, 'doctors');
        const casesStatus = await getPlanStatus(tenantId, plan as PlanType, 'cases');
        setPlanUsage({
          doctors: doctorsStatus,
          cases: casesStatus
        });
      };
      fetchPlanUsage();
    }
  }, [tenantId, plan, cases.length, doctors.length]);

  useEffect(() => {
    let unsubCases = () => {};
    let unsubInvoices = () => {};
    let unsubDoctors = () => {};
    let unsubApprovals = () => {};
    
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';
    
    if (isAdmin) {
      if (userRole === 'super_admin') {
        const unsubTenants = onSnapshot(collection(db, 'tenants'), (snapshot) => {
          setTenants(snapshot.docs.map(d => d.id));
        });
        
        unsubCases = subscribeToCases(tenantId, setCases);
        unsubInvoices = subscribeToInvoices(tenantId, setInvoices);
        unsubDoctors = subscribeToDoctors(tenantId, setDoctors);
        
        return () => {
          unsubTenants();
          unsubCases();
          unsubInvoices();
          unsubDoctors();
        };
      } else {
        unsubCases = subscribeToCases(tenantId, setCases);
        unsubInvoices = subscribeToInvoices(tenantId, setInvoices);
        unsubDoctors = subscribeToDoctors(tenantId, setDoctors);
      }
      
      const effectiveTenantId = userRole === 'super_admin' ? 'platform' : tenantId;
      unsubApprovals = subscribeToPendingApprovals(effectiveTenantId, setPendingApprovals);
    } else {
      unsubCases = subscribeToMyCases(tenantId, userRole, userId || '', setCases);
      unsubInvoices = subscribeToMyInvoices(tenantId, userRole, userId || '', setInvoices);
    }
    
    return () => {
      unsubCases();
      unsubInvoices();
      unsubDoctors();
      unsubApprovals();
    };
  }, [tenantId, userRole, userId]);

  const isSuperAdmin = userRole === 'super_admin';
  const effectiveCases = isSuperAdmin && tenantId === 'platform' 
    ? cases.filter(c => tenants.includes(c.tenantId))
    : cases;
  
  const effectiveInvoices = isSuperAdmin && tenantId === 'platform'
    ? invoices.filter(i => tenants.includes(i.tenantId))
    : invoices;

  const activeCases = effectiveCases.filter(c => c.status !== 'Delivered').length;
  const readyForDelivery = effectiveCases.filter(c => c.status === 'Ready').length;
  const inProduction = effectiveCases.filter(c => c.status === 'In Progress').length;
  const newOrders = effectiveCases.filter(c => c.status === 'Received').length;
  
  const monthlyRevenue = effectiveInvoices
    .filter(i => i.status === 'Paid')
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const pendingRevenue = effectiveInvoices
    .filter(i => i.status === 'Unpaid' || i.status === 'Pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currencySymbol = currency === 'NPR' ? 'रू' : '₹';

  const stats = [
    { 
      label: 'Active Workload', 
      value: activeCases.toString(), 
      subValue: `${newOrders} new orders`,
      icon: Activity, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10',
      trend: '+12%',
      description: 'Total active cases in system'
    },
    { 
      label: 'Production Floor', 
      value: inProduction.toString(), 
      subValue: 'Currently in progress',
      icon: Zap, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10',
      trend: 'Stable',
      description: 'Cases currently being worked on'
    },
    { 
      label: 'Ready to Ship', 
      value: readyForDelivery.toString(), 
      subValue: 'QC passed',
      icon: Package, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      trend: 'High',
      description: 'Completed and ready for delivery'
    },
    { 
      label: 'Revenue Pulse', 
      value: `${currencySymbol}${monthlyRevenue.toLocaleString()}`, 
      subValue: `${currencySymbol}${pendingRevenue.toLocaleString()} pending`,
      icon: TrendingUp, 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-500/10',
      trend: '+8.4%',
      description: 'Total paid revenue this month'
    },
  ];

  const pipelineData = [
    { stage: 'Received', count: newOrders, color: '#3b82f6' },
    { stage: 'Production', count: inProduction, color: '#f59e0b' },
    { stage: 'Ready', count: readyForDelivery, color: '#10b981' },
  ];

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  if (isAdmin && pendingApprovals > 0) {
    stats.push({ 
      label: 'Pending Approvals', 
      value: pendingApprovals.toString(), 
      subValue: 'Requires attention',
      icon: UserCheck, 
      color: 'text-rose-500', 
      bg: 'bg-rose-500/10',
      trend: 'Action',
      description: 'New registrations awaiting approval'
    });
  }

  const displayStats = stats;

  return (
    <div className="space-y-10 pb-12 font-sans selection:bg-blue-500/30">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative flex items-center justify-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute" />
              <div className="w-3 h-3 bg-emerald-500 rounded-full relative" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">System Live</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Command Center <span className="text-slate-300 dark:text-slate-700 font-light">/</span> <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{isAdmin ? 'Admin' : (userRole || 'User')}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mt-1">Operational pulse of {tenantName || 'your dental lab'}.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {isImpersonating && (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-3 shadow-sm backdrop-blur-sm">
              <Activity size={16} className="text-amber-500" />
              <span className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                Viewing: <span className="text-amber-600 dark:text-amber-400">{tenantName}</span>
              </span>
              <button 
                onClick={onExitImpersonation}
                className="ml-2 p-1.5 hover:bg-amber-500/20 rounded-xl transition-all text-amber-600"
              >
                <Zap size={16} fill="currentColor" />
              </button>
            </div>
          )}
          
          <div className="relative flex-1 sm:flex-none">
            <button 
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-[2rem] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-none font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 group"
            >
              <div className="bg-white/20 dark:bg-slate-900/10 p-1 rounded-lg transition-transform duration-500 group-hover:rotate-90">
                <Plus className={`w-4 h-4 transition-transform duration-300 ${showQuickActions ? 'rotate-45' : ''}`} />
              </div>
              <span>Quick Action</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showQuickActions ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showQuickActions && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60]" 
                    onClick={() => setShowQuickActions(false)}
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-72 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-3 z-[70] origin-top-right overflow-hidden backdrop-blur-xl"
                  >
                    {isAdmin && (
                      <div className="space-y-1">
                        <button 
                          onClick={() => { onNavigate('cases', true); setShowQuickActions(false); }}
                          className="w-full px-5 py-4 text-left flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-[1.5rem] transition-all text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest group"
                        >
                          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-sm">
                            <FilePlus size={18} />
                          </div>
                          <span>Add New Case</span>
                        </button>
                        <button 
                          onClick={() => { onNavigate('doctors', true); setShowQuickActions(false); }}
                          className="w-full px-5 py-4 text-left flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-[1.5rem] transition-all text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest group"
                        >
                          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-sm">
                            <UserPlus size={18} />
                          </div>
                          <span>Add New Doctor</span>
                        </button>
                        <button 
                          onClick={() => { onNavigate('invoices', true); setShowQuickActions(false); }}
                          className="w-full px-5 py-4 text-left flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-[1.5rem] transition-all text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest group"
                        >
                          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-sm">
                            <Receipt size={18} />
                          </div>
                          <span>Generate Invoice</span>
                        </button>
                      </div>
                    )}
                    {userRole === 'doctor' && (
                      <div className="space-y-1">
                        <button 
                          onClick={() => { onNavigate('cases', true); setShowQuickActions(false); }}
                          className="w-full px-5 py-4 text-left flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-[1.5rem] transition-all text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest group"
                        >
                          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-sm">
                            <FilePlus size={18} />
                          </div>
                          <span>Create New Case</span>
                        </button>
                        <button 
                          onClick={() => { onNavigate('invoices'); setShowQuickActions(false); }}
                          className="w-full px-5 py-4 text-left flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-[1.5rem] transition-all text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest group"
                        >
                          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl group-hover:scale-110 transition-all duration-300 shadow-sm">
                            <Receipt size={18} />
                          </div>
                          <span>View My Invoices</span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {displayStats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-slate-50 dark:to-slate-800/30 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150" />
            
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className={`p-5 rounded-[1.5rem] ${stat.bg} transition-all group-hover:scale-110 duration-500 shadow-sm`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${
                  stat.trend?.includes('+') 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                    : 'bg-slate-500/10 text-slate-600 border-slate-500/20'
                }`}>
                  {stat.trend}
                </span>
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{stat.value}</h3>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{stat.subValue}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Production Pipeline */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Production Pipeline</h3>
              <p className="text-sm font-bold text-slate-500 mt-1">Real-time workload distribution across stages</p>
            </div>
            <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/20" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">New</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/20" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Prod</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ready</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                <XAxis 
                  dataKey="stage" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                  dy={15}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', radius: 12 }}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', 
                    fontWeight: 900,
                    fontSize: '12px',
                    padding: '12px 20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Bar dataKey="count" radius={[12, 12, 4, 4]} barSize={70}>
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Capacity / Plan Usage */}
        <div className="bg-slate-950 dark:bg-black rounded-[3rem] p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full -mr-40 -mt-40 blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full -ml-32 -mb-32 blur-[80px]" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-10">
              <div className="p-4 bg-white/10 rounded-[1.5rem] backdrop-blur-xl border border-white/10 shadow-inner">
                <ShieldCheck className="w-7 h-7 text-blue-400" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Infrastructure</span>
                <span className="text-[11px] font-black px-4 py-1.5 bg-blue-600 rounded-full uppercase tracking-widest shadow-lg shadow-blue-600/20">
                  {plan} Plan
                </span>
              </div>
            </div>
            
            <h3 className="text-3xl font-black mb-3 tracking-tight">System Capacity</h3>
            <p className="text-slate-400 text-sm font-bold mb-12">Resource utilization for current cycle.</p>
            
            {planUsage && (
              <div className="space-y-10">
                {[
                  { label: 'Doctor Network', status: planUsage.doctors, icon: Users, color: 'from-blue-500 to-indigo-500' },
                  { label: 'Case Throughput', status: planUsage.cases, icon: Activity, color: 'from-blue-400 to-cyan-400' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-xl">
                          <item.icon size={16} className="text-slate-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{item.label}</span>
                      </div>
                      <span className="text-sm font-black tracking-tight">
                        {item.status.current} <span className="text-slate-500 font-medium">/ {item.status.limit === Infinity ? '∞' : item.status.limit}</span>
                      </span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(item.status.percentage, 100)}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${
                          item.status.percentage > 90 ? 'from-rose-500 to-pink-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 
                          item.status.percentage > 75 ? 'from-amber-500 to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 
                          `${item.color} shadow-[0_0_15px_rgba(59,130,246,0.5)]`
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => onNavigate('billing')}
            className="mt-16 w-full py-5 bg-white text-slate-950 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-all flex items-center justify-center gap-3 relative z-10 shadow-xl shadow-white/5 group"
          >
            <Zap size={18} className="group-hover:scale-110 transition-transform" fill="currentColor" />
            Upgrade Infrastructure
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Cases Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm p-10 overflow-hidden flex flex-col relative">
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-32 -mt-32 blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Recent Operations</h3>
              <p className="text-sm font-bold text-slate-500 mt-1">Latest case logs and status updates</p>
            </div>
            <button 
              onClick={() => onNavigate('cases')}
              className="p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800 group"
            >
              <ArrowUpRight size={22} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
          
          <div className="overflow-x-auto -mx-10 px-10 relative z-10">
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-6 pb-2">Case ID</th>
                  <th className="px-6 pb-2">Patient</th>
                  <th className="px-6 pb-2">Doctor</th>
                  <th className="px-6 pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {effectiveCases.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">No operational logs found.</td>
                  </tr>
                ) : (
                  effectiveCases.slice(0, 6).map((c) => (
                    <tr key={c.id} className="group transition-all">
                      <td className="px-6 py-5 bg-slate-50/50 dark:bg-slate-800/30 rounded-l-[1.5rem] font-mono text-[11px] text-slate-400 font-bold border-y border-l border-slate-100/50 dark:border-slate-800/50 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                        #{c.id?.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-5 bg-slate-50/50 dark:bg-slate-800/30 font-black text-slate-900 dark:text-white border-y border-slate-100/50 dark:border-slate-800/50 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                        {c.patientName}
                      </td>
                      <td className="px-6 py-5 bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 font-bold border-y border-slate-100/50 dark:border-slate-800/50 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                        {c.doctorName}
                      </td>
                      <td className="px-6 py-5 bg-slate-50/50 dark:bg-slate-800/30 rounded-r-[1.5rem] border-y border-r border-slate-100/50 dark:border-slate-800/50 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full shadow-sm ${
                            c.status === 'Ready' ? 'bg-emerald-500 shadow-emerald-500/20' : 
                            c.status === 'Delivered' ? 'bg-slate-300 shadow-slate-300/20' :
                            c.status === 'In Progress' ? 'bg-amber-500 shadow-amber-500/20' :
                            'bg-blue-500 shadow-blue-500/20'
                          }`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                            {c.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Clients / Market Share */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm p-10 flex flex-col relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mb-32 blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Market Share</h3>
            <div className="p-4 bg-indigo-500/10 text-indigo-600 rounded-2xl border border-indigo-500/10">
              <Users size={22} />
            </div>
          </div>
          
          <div className="space-y-6 flex-1 relative z-10">
            {doctors.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800">
                  <UserPlus className="text-slate-300 dark:text-slate-600 w-8 h-8" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No client data available.</p>
              </div>
            ) : (
              doctors.slice(0, 5).map((doc, i) => (
                <div key={doc.id} className="flex items-center gap-5 group p-2 rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                  <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white font-black text-[10px] transition-all group-hover:bg-indigo-600 group-hover:text-white shadow-sm">
                    0{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight mb-0.5">{doc.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] truncate">{doc.clinicName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-indigo-600 bg-indigo-500/10 px-2 py-1 rounded-md mb-1">ACTIVE</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PARTNER</div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button 
            onClick={() => onNavigate('doctors')}
            className="w-full mt-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] hover:opacity-90 transition-all shadow-xl shadow-slate-900/10 dark:shadow-none relative z-10"
          >
            View All Partners
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
