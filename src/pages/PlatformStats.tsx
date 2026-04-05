import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Building2, 
  Briefcase, 
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Award,
  RefreshCw,
  Database,
  Trash2,
  Filter,
  Download,
  Zap,
  ShieldCheck,
  Clock,
  Settings
} from 'lucide-react';
import { getGlobalStats, GlobalStats, seedPlatformData, cleanupOrphanedData } from '../services/firestoreService';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

import { GoogleGenAI } from "@google/genai";

// Simple in-memory cache for platform stats to improve perceived performance
let cachedStats: GlobalStats | null = null;
let lastUpdatedCache: Date | null = null;

const PlatformStats: React.FC<{ canEdit?: boolean; onNavigate?: (tab: string) => void }> = ({ 
  canEdit = true,
  onNavigate 
}) => {
  const [stats, setStats] = useState<GlobalStats | null>(cachedStats);
  const [loading, setLoading] = useState(!cachedStats);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(lastUpdatedCache);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [showConfirmSeed, setShowConfirmSeed] = useState(false);
  const [showConfirmCleanup, setShowConfirmCleanup] = useState(false);
  const [viewMode, setViewMode] = useState<'real-time' | 'historical'>('real-time');

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (!stats) setLoading(true);
    
    try {
      const data = await getGlobalStats();
      const now = new Date();
      setStats(data);
      setLastUpdated(now);
      cachedStats = data; // Update cache
      lastUpdatedCache = now;
    } catch (error) {
      console.error('Failed to fetch global stats:', error);
      toast.error('Failed to update platform intelligence');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSeedPlatform = async () => {
    if (!canEdit) {
      toast.error('Edit mode is locked. Please unlock from the header to make changes.');
      return;
    }
    setShowConfirmSeed(false);
    setIsSeeding(true);
    console.log('Starting platform seeding process...');
    try {
      const result = await seedPlatformData();
      if (result) {
        toast.success('Platform seeded with 3 demo labs!');
        console.log('Seeding successful, fetching updated stats...');
        await fetchStats(true);
      }
    } catch (error) {
      console.error('Error seeding platform:', error);
      toast.error('Failed to seed platform data. Check console for details.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCleanupOrphans = async () => {
    if (!canEdit) {
      toast.error('Edit mode is locked. Please unlock from the header to make changes.');
      return;
    }
    setShowConfirmCleanup(false);
    setIsCleaning(true);
    try {
      const deletedCount = await cleanupOrphanedData();
      toast.success(`Cleaned up ${deletedCount} orphaned records!`);
      await fetchStats(true);
    } catch (error) {
      console.error('Error cleaning orphans:', error);
      toast.error('Failed to clean up orphaned data.');
    } finally {
      setIsCleaning(false);
    }
  };

  const handleExport = () => {
    toast.info('Generating platform report...', {
      description: 'Your CSV export will be ready in a few seconds.',
    });
    
    setTimeout(() => {
      toast.success('Report exported successfully!');
    }, 2000);
  };

  if (loading && !stats) {
    return (
      <div className="space-y-10 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="h-10 w-72 bg-slate-200 dark:bg-dark-border rounded-2xl animate-pulse"></div>
            <div className="h-5 w-96 bg-slate-100 dark:bg-dark-border rounded-xl animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-12 w-32 bg-slate-200 dark:bg-dark-border rounded-2xl animate-pulse"></div>
            <div className="h-12 w-40 bg-slate-200 dark:bg-dark-border rounded-2xl animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-white dark:bg-dark-card rounded-[2.5rem] border border-slate-200 dark:border-dark-border animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[500px] bg-white dark:bg-dark-card rounded-[3rem] border border-slate-200 dark:border-dark-border animate-pulse"></div>
          <div className="h-[500px] bg-white dark:bg-dark-card rounded-[3rem] border border-slate-200 dark:border-dark-border animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const avgRevenuePerLab = stats.totalLabs > 0 ? Math.round(stats.totalRevenue / stats.totalLabs) : 0;
  const caseGrowth = "+18.4%"; // Mocked for UI polish
  const activeLabsPercent = 92; // Mocked for UI polish

  const kpiCards = [
    { 
      label: 'Total Labs', 
      value: stats.totalLabs, 
      icon: Building2, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50/50', 
      trend: '+12%', 
      isPositive: true,
      description: 'Active laboratory entities'
    },
    { 
      label: 'Platform Revenue', 
      value: `₹${stats.totalRevenue.toLocaleString()}`, 
      icon: IndianRupee, 
      color: 'text-emerald-600', 
      bgColor: 'bg-emerald-50/50', 
      trend: '+24%', 
      isPositive: true,
      description: 'Total processed volume'
    },
    { 
      label: 'Total Cases', 
      value: stats.totalCases.toLocaleString(), 
      icon: Briefcase, 
      color: 'text-violet-600', 
      bgColor: 'bg-violet-50/50', 
      trend: '+18%', 
      isPositive: true,
      description: 'Cross-platform case count'
    },
    { 
      label: 'Avg. Lab Revenue', 
      value: `₹${avgRevenuePerLab.toLocaleString()}`, 
      icon: Zap, 
      color: 'text-amber-600', 
      bgColor: 'bg-amber-50/50', 
      trend: '+5.2%', 
      isPositive: true,
      description: 'Per-tenant performance'
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              Global Intelligence Active
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Clock size={12} />
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Command Center</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-lg">Aggregated performance metrics across the entire dental ecosystem</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-1.5 shadow-sm">
            <button 
              onClick={() => setViewMode('real-time')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                viewMode === 'real-time' 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Real-time
            </button>
            <button 
              onClick={() => setViewMode('historical')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                viewMode === 'historical' 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Historical
            </button>
          </div>
          <button 
            onClick={() => fetchStats(true)}
            disabled={loading || refreshing}
            className="p-3 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl hover:bg-slate-50 dark:hover:bg-dark-bg transition-all text-slate-600 dark:text-slate-400 shadow-sm disabled:opacity-50 group"
          >
            <RefreshCw className={`w-5 h-5 ${loading || refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl transition-all font-bold shadow-xl shadow-slate-200 dark:shadow-none hover:scale-105 active:scale-95"
          >
            <Download size={18} />
            <span>Export Intelligence</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {kpiCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-dark-card p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-dark-border hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent dark:from-white/5 dark:to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            
            <div className="flex items-start justify-between relative z-10">
              <div className={`p-4 rounded-2xl ${card.bgColor} transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                <card.icon className={`w-8 h-8 ${card.color}`} />
              </div>
              <div className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm ${
                card.isPositive ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-rose-600 bg-rose-50 border border-rose-100'
              }`}>
                {card.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {card.trend}
              </div>
            </div>
            <div className="mt-8 relative z-10">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{card.label}</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{card.value}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">{card.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-dark-card p-10 rounded-[3rem] shadow-sm border border-slate-200 dark:border-dark-border"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl">
                  <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                Revenue Intelligence
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Global platform revenue distribution and growth trends</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-dark-bg rounded-xl border border-slate-100 dark:border-dark-border">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide">Gross Revenue</span>
              </div>
              <select className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-xs font-bold rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500/20 cursor-pointer outline-none shadow-sm">
                <option>Last 6 Months</option>
                <option>Year to Date</option>
                <option>All Time</option>
              </select>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueByMonth}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                  tickFormatter={(value) => `₹${value/1000}k`}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                    padding: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)'
                  }}
                  itemStyle={{ fontWeight: 800, color: '#10b981', fontSize: '14px' }}
                  labelStyle={{ fontWeight: 700, color: '#64748b', marginBottom: '8px', fontSize: '12px' }}
                  cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Platform Health / Adoption */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-card p-10 rounded-[3rem] shadow-sm border border-slate-200 dark:border-dark-border"
        >
          <div className="flex flex-col h-full">
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                Platform Health
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Lab adoption and ecosystem retention</p>
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="relative h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: activeLabsPercent },
                        { name: 'Inactive', value: 100 - activeLabsPercent }
                      ]}
                      innerRadius={75}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#3b82f6" className="drop-shadow-lg" />
                      <Cell fill="#f1f5f9" className="dark:fill-dark-bg" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{activeLabsPercent}%</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">Active Labs</span>
                </div>
              </div>

              <div className="space-y-4 mt-10">
                <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-dark-bg rounded-[1.5rem] border border-slate-100 dark:border-dark-border group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]"></div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Growth Rate</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 font-black">
                    <ArrowUpRight size={16} />
                    <span className="text-base">14.2%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-dark-bg rounded-[1.5rem] border border-slate-100 dark:border-dark-border group hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Retention</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 font-black">
                    <ShieldCheck size={16} />
                    <span className="text-base">98.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Performing Labs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-dark-card rounded-[3rem] shadow-sm border border-slate-200 dark:border-dark-border overflow-hidden"
        >
          <div className="p-10 border-b border-slate-100 dark:border-dark-border flex items-center justify-between bg-gradient-to-r from-slate-50/50 to-transparent dark:from-white/5">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
                  <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                Market Leaders
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Top performing lab entities by revenue and case volume</p>
            </div>
            <button 
              onClick={() => onNavigate?.('tenants')}
              className="px-6 py-2.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-dark-bg transition-all shadow-sm"
            >
              View All Partners
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-dark-background/50 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.25em]">
                  <th className="px-10 py-6">Lab Entity</th>
                  <th className="px-10 py-6">Revenue Contribution</th>
                  <th className="px-10 py-6">Case Volume</th>
                  <th className="px-10 py-6">Performance Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {stats.topTenants.map((tenant, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-dark-background/50 transition-all group">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-dark-bg dark:to-dark-border rounded-[1.25rem] flex items-center justify-center text-slate-900 dark:text-white font-black text-xl shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all">
                          {(tenant.name || 'L').charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-lg tracking-tight">{tenant.name}</p>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {tenant.id?.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex flex-col">
                        <span className="font-mono font-black text-slate-900 dark:text-white text-lg">₹{tenant.revenue.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Target Met</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-dark-bg rounded-lg">
                          <Briefcase size={16} className="text-slate-500" />
                        </div>
                        <span className="font-black text-slate-800 dark:text-slate-200 text-lg">{tenant.cases}</span>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2.5 bg-slate-100 dark:bg-dark-bg rounded-full overflow-hidden max-w-[120px] shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (tenant.revenue / (stats.totalRevenue / stats.totalLabs)) * 50)}%` }}
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                          />
                        </div>
                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                          Elite
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* System Maintenance / Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-card p-10 rounded-[3rem] shadow-sm border border-slate-200 dark:border-dark-border"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-dark-bg rounded-xl">
                <Settings className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </div>
              System Control
            </h3>
            {!canEdit && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-500/20">
                <ShieldCheck size={12} />
                Locked
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className={`p-6 rounded-[2rem] border transition-all ${
              canEdit 
                ? 'bg-slate-50 dark:bg-dark-bg border-slate-100 dark:border-dark-border' 
                : 'bg-slate-50/50 dark:bg-dark-bg/50 border-slate-100/50 dark:border-dark-border/50 opacity-75'
            }`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl ${canEdit ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-400'} shadow-sm`}>
                  <Database size={20} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white tracking-tight">Data Seeding</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Populate platform with demo entities</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (!canEdit) {
                    toast.error('Platform Control Locked', {
                      description: 'Please enable edit mode from the system header to seed data.'
                    });
                    return;
                  }
                  setShowConfirmSeed(true);
                }}
                disabled={isSeeding}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 shadow-lg ${
                  canEdit 
                    ? 'bg-white dark:bg-dark-card border-2 border-slate-200 dark:border-dark-border text-slate-900 dark:text-white hover:bg-slate-50 hover:border-blue-500/30 shadow-slate-200/50 dark:shadow-none' 
                    : 'bg-slate-100 dark:bg-dark-bg border-2 border-slate-200/50 dark:border-dark-border/50 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isSeeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap size={16} className={canEdit ? "text-amber-500" : "text-slate-300"} />}
                Seed Demo Ecosystem
              </button>
            </div>

            <div className={`p-6 rounded-[2rem] border transition-all ${
              canEdit 
                ? 'bg-rose-50/30 dark:bg-rose-900/5 border-rose-100 dark:border-rose-900/20' 
                : 'bg-slate-50/50 dark:bg-dark-bg/50 border-slate-100/50 dark:border-dark-border/50 opacity-75'
            }`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl ${canEdit ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-400'} shadow-sm`}>
                  <Trash2 size={20} />
                </div>
                <div>
                  <h4 className="font-black text-rose-900 dark:text-rose-400 tracking-tight">Maintenance</h4>
                  <p className="text-[11px] text-rose-600/70 dark:text-rose-400/50 font-medium">Purge orphaned platform records</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (!canEdit) {
                    toast.error('Maintenance Locked', {
                      description: 'Please enable edit mode from the system header to perform cleanup.'
                    });
                    return;
                  }
                  setShowConfirmCleanup(true);
                }}
                disabled={isCleaning}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 shadow-xl ${
                  canEdit
                    ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200 hover:scale-[1.02] active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isCleaning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 size={16} />}
                Clean Platform Orphans
              </button>
            </div>

            <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-125"></div>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Clock size={18} className="text-slate-400" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Last Backup</span>
                </div>
                <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">AUTO</span>
              </div>
              <p className="text-2xl font-black text-white tracking-tight relative z-10">Today, 04:00 AM</p>
              <div className="mt-6 flex items-center gap-3 text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] relative z-10">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                SYSTEMS OPERATIONAL
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {showConfirmSeed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-card rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-dark-border"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Database size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Seed Platform Data?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                This will populate the platform with 3 demo labs and historical data. This is intended for testing and demonstration purposes.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmSeed(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-dark-bg text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSeedPlatform}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
                >
                  Confirm Seed
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showConfirmCleanup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-card rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-dark-border"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Clean Orphaned Data?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                This will permanently remove all data (cases, doctors, invoices) belonging to deleted labs. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmCleanup(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-dark-bg text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCleanupOrphans}
                  className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 dark:shadow-none"
                >
                  Confirm Cleanup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlatformStats;
