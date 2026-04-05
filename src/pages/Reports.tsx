import React, { useState, useEffect, useMemo } from 'react';
import { 
  subscribeToCases, 
  subscribeToInvoices, 
  Case, 
  Invoice, 
  subscribeToMyCases, 
  subscribeToMyInvoices,
  subscribeToDoctors,
  Doctor,
  subscribeToExpenses,
  Expense
} from '../services/firestoreService';
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Legend
} from 'recharts';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  subMonths, 
  isWithinInterval, 
  startOfDay, 
  endOfDay,
  subDays,
  differenceInDays,
  parseISO,
  isAfter
} from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Briefcase, 
  Clock, 
  Filter, 
  Download, 
  Calendar,
  ChevronDown,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart as PieChartIcon,
  BarChart3 as BarChartIcon,
  AlertCircle,
  Sparkles,
  Timer,
  UserCheck,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface ReportsProps {
  tenantId?: string;
  userRole?: string;
  userId?: string;
  currency?: string;
}

const Reports: React.FC<ReportsProps> = ({ tenantId, userRole, userId, currency = 'INR' }) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });
  const [selectedDoctor, setSelectedDoctor] = useState('All');
  const [selectedCaseType, setSelectedCaseType] = useState('All');
  const [filterType, setFilterType] = useState('This Month');

  const currencySymbol = currency === 'NPR' ? 'रू' : '₹';

  useEffect(() => {
    let unsubCases = () => {};
    let unsubInvoices = () => {};
    let unsubDoctors = () => {};
    let unsubExpenses = () => {};

    if (userRole === 'admin' || userRole === 'super_admin') {
      unsubCases = subscribeToCases(tenantId, setCases);
      unsubInvoices = subscribeToInvoices(tenantId, setInvoices);
      unsubDoctors = subscribeToDoctors(tenantId, setDoctors);
      unsubExpenses = subscribeToExpenses(tenantId, setExpenses);
    } else {
      unsubCases = subscribeToMyCases(tenantId, userRole || '', userId || '', setCases);
      unsubInvoices = subscribeToMyInvoices(tenantId, userRole || '', userId || '', setInvoices);
    }

    return () => {
      unsubCases();
      unsubInvoices();
      unsubDoctors();
      unsubExpenses();
    };
  }, [tenantId, userRole, userId]);

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    const now = new Date();
    if (type === 'This Month') {
      setDateRange({ start: startOfMonth(now), end: endOfMonth(now) });
    } else if (type === 'Last Month') {
      const lastMonth = subMonths(now, 1);
      setDateRange({ start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) });
    } else if (type === 'Last 3 Months') {
      setDateRange({ start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) });
    }
  };

  // Filtered Data based on Date Range, Doctor, and Case Type
  const filteredData = useMemo(() => {
    const filteredCases = cases.filter(c => {
      const date = c.createdAt?.toDate ? c.createdAt.toDate() : null;
      if (!date) return false;
      const inRange = isWithinInterval(date, { start: startOfDay(dateRange.start), end: endOfDay(dateRange.end) });
      const matchesDoctor = selectedDoctor === 'All' || c.doctorId === selectedDoctor;
      const matchesType = selectedCaseType === 'All' || c.caseType === selectedCaseType;
      return inRange && matchesDoctor && matchesType;
    });

    const filteredInvoices = invoices.filter(i => {
      const date = i.createdAt?.toDate ? i.createdAt.toDate() : null;
      if (!date) return false;
      const inRange = isWithinInterval(date, { start: startOfDay(dateRange.start), end: endOfDay(dateRange.end) });
      const matchesDoctor = selectedDoctor === 'All' || i.doctorId === selectedDoctor;
      return inRange && matchesDoctor;
    });

    const filteredExpenses = expenses.filter(e => {
      const date = parseISO(e.date);
      return isWithinInterval(date, { start: startOfDay(dateRange.start), end: endOfDay(dateRange.end) });
    });

    return { filteredCases, filteredInvoices, filteredExpenses };
  }, [cases, invoices, expenses, dateRange, selectedDoctor, selectedCaseType]);

  // Previous Period Data for Growth Calculation
  const previousPeriodData = useMemo(() => {
    const daysDiff = differenceInDays(dateRange.end, dateRange.start) + 1;
    const prevStart = subDays(dateRange.start, daysDiff);
    const prevEnd = subDays(dateRange.end, daysDiff);

    const prevCases = cases.filter(c => {
      const date = c.createdAt?.toDate ? c.createdAt.toDate() : null;
      if (!date) return false;
      return isWithinInterval(date, { start: startOfDay(prevStart), end: endOfDay(prevEnd) });
    });

    const prevInvoices = invoices.filter(i => {
      const date = i.createdAt?.toDate ? i.createdAt.toDate() : null;
      if (!date) return false;
      return isWithinInterval(date, { start: startOfDay(prevStart), end: endOfDay(prevEnd) }) && i.status === 'Paid';
    });

    const prevExpenses = expenses.filter(e => {
      const date = parseISO(e.date);
      return isWithinInterval(date, { start: startOfDay(prevStart), end: endOfDay(prevEnd) });
    });

    return { prevCases, prevInvoices, prevExpenses };
  }, [cases, invoices, expenses, dateRange]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const { filteredCases, filteredInvoices, filteredExpenses } = filteredData;
    const { prevCases, prevInvoices, prevExpenses } = previousPeriodData;

    const totalRevenue = filteredInvoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
    const prevRevenue = prevInvoices.reduce((acc, curr) => acc + curr.amount, 0);
    const revenueGrowth = prevRevenue === 0 ? 100 : ((totalRevenue - prevRevenue) / prevRevenue) * 100;

    const totalCases = filteredCases.length;
    const prevCasesCount = prevCases.length;
    const casesGrowth = prevCasesCount === 0 ? 100 : ((totalCases - prevCasesCount) / prevCasesCount) * 100;

    const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const prevExpensesAmount = prevExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const expenseGrowth = prevExpensesAmount === 0 ? 100 : ((totalExpenses - prevExpensesAmount) / prevExpensesAmount) * 100;

    const avgCaseValue = totalCases === 0 ? 0 : totalRevenue / totalCases;
    const pendingPayments = filteredInvoices.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);

    return [
      { label: 'Total Revenue', value: `${currencySymbol}${totalRevenue.toLocaleString()}`, growth: revenueGrowth, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Total Cases', value: totalCases.toString(), growth: casesGrowth, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Total Expenses', value: `${currencySymbol}${totalExpenses.toLocaleString()}`, growth: expenseGrowth, icon: BarChartIcon, color: 'text-rose-600', bg: 'bg-rose-50' },
      { label: 'Pending Payments', value: `${currencySymbol}${pendingPayments.toLocaleString()}`, growth: null, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];
  }, [filteredData, previousPeriodData, currencySymbol]);

  // Chart Data
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    return days.map(day => {
      const caseCount = filteredData.filteredCases.filter(c => c.createdAt?.toDate && isSameDay(c.createdAt.toDate(), day)).length;
      const revenue = filteredData.filteredInvoices
        .filter(i => i.status === 'Paid' && i.createdAt?.toDate && isSameDay(i.createdAt.toDate(), day))
        .reduce((acc, curr) => acc + curr.amount, 0);
      const expense = filteredData.filteredExpenses
        .filter(e => isSameDay(parseISO(e.date), day))
        .reduce((acc, curr) => acc + curr.amount, 0);
      
      return {
        name: format(day, days.length > 31 ? 'MMM dd' : 'dd'),
        cases: caseCount,
        revenue: revenue,
        expense: expense
      };
    });
  }, [filteredData, dateRange]);

  const topDoctors = useMemo(() => {
    const doctorRevenue: { [key: string]: { name: string; revenue: number; cases: number } } = {};
    
    filteredData.filteredInvoices.filter(i => i.status === 'Paid').forEach(i => {
      if (!doctorRevenue[i.doctorId]) {
        doctorRevenue[i.doctorId] = { name: i.doctorName || 'Unknown', revenue: 0, cases: 0 };
      }
      doctorRevenue[i.doctorId].revenue += i.amount;
    });

    filteredData.filteredCases.forEach(c => {
      if (doctorRevenue[c.doctorId]) {
        doctorRevenue[c.doctorId].cases += 1;
      }
    });

    return Object.values(doctorRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredData]);

  const topCaseTypes = useMemo(() => {
    const typeStats: { [key: string]: { name: string; count: number; revenue: number } } = {};
    
    filteredData.filteredCases.forEach(c => {
      if (!typeStats[c.caseType]) {
        typeStats[c.caseType] = { name: c.caseType, count: 0, revenue: 0 };
      }
      typeStats[c.caseType].count += 1;
      typeStats[c.caseType].revenue += c.price;
    });

    return Object.values(typeStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredData]);

  const agingReport = useMemo(() => {
    const now = new Date();
    const pending = filteredData.filteredInvoices.filter(i => i.status === 'Pending');
    
    return pending.map(i => {
      const created = i.createdAt?.toDate ? i.createdAt.toDate() : now;
      const daysOld = differenceInDays(now, created);
      return { ...i, daysOld };
    }).sort((a, b) => b.daysOld - a.daysOld);
  }, [filteredData]);

  const caseStatusData = useMemo(() => {
    const statuses = ['Received', 'In Progress', 'Ready', 'Delivered'];
    return statuses.map(status => ({
      name: status,
      value: filteredData.filteredCases.filter(c => c.status === status).length
    }));
  }, [filteredData]);

  // Turnaround Time (TAT) Calculation
  const avgTAT = useMemo(() => {
    const deliveredCases = filteredData.filteredCases.filter(c => c.status === 'Delivered' && c.deliveryDate);
    if (deliveredCases.length === 0) return 0;
    const totalDays = deliveredCases.reduce((acc, c) => {
      const start = c.createdAt?.toDate ? c.createdAt.toDate() : null;
      const end = c.deliveryDate?.toDate ? c.deliveryDate.toDate() : null;
      if (start && end) {
        return acc + Math.max(0, differenceInDays(end, start));
      }
      return acc;
    }, 0);
    return (totalDays / deliveredCases.length).toFixed(1);
  }, [filteredData]);

  // Doctor Retention Rate
  const retentionRate = useMemo(() => {
    const activeDoctorIds = new Set(filteredData.filteredCases.map(c => c.doctorId));
    if (activeDoctorIds.size === 0) return 0;
    const repeatDoctors = Array.from(activeDoctorIds).filter(docId => {
      return filteredData.filteredCases.filter(c => c.doctorId === docId).length >= 2;
    });
    return Math.round((repeatDoctors.length / activeDoctorIds.size) * 100);
  }, [filteredData]);

  // AI Insights Generator
  const aiInsights = useMemo(() => {
    const insights = [];
    const { filteredCases, filteredInvoices } = filteredData;
    
    // Revenue Insight
    const totalRevenue = filteredInvoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
    if (totalRevenue > 0 && topDoctors.length > 0) {
      insights.push({
        text: `Dr. ${topDoctors[0].name} is your top contributor, accounting for ${Math.round((topDoctors[0].revenue / totalRevenue) * 100)}% of revenue.`,
        type: 'success'
      });
    }

    // Product Insight
    if (topCaseTypes.length > 0) {
      insights.push({
        text: `${topCaseTypes[0].name} is currently your most in-demand product with ${topCaseTypes[0].count} orders.`,
        type: 'info'
      });
    }

    // Efficiency Insight
    if (parseFloat(avgTAT) > 5) {
      insights.push({
        text: `Average TAT is ${avgTAT} days. Consider optimizing lab workflow to reduce delivery time.`,
        type: 'warning'
      });
    } else if (parseFloat(avgTAT) > 0) {
      insights.push({
        text: `Excellent TAT of ${avgTAT} days! Your lab efficiency is above industry average.`,
        type: 'success'
      });
    }

    // Payment Insight
    const pendingAmount = filteredInvoices.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + curr.amount, 0);
    if (pendingAmount > 100000) {
      insights.push({
        text: `High outstanding balance detected (${currencySymbol}${pendingAmount.toLocaleString()}). Follow up on aging invoices.`,
        type: 'danger'
      });
    }

    return insights;
  }, [filteredData, topDoctors, topCaseTypes, avgTAT, currencySymbol]);

  const STATUS_COLORS = ['#94a3b8', '#3b82f6', '#f59e0b', '#10b981'];
  const PIE_COLORS = ['#3FBF9B', '#1F4E79', '#F59E0B', '#EF4444'];

  const caseTypes = useMemo(() => {
    const types = new Set(cases.map(c => c.caseType));
    return Array.from(types);
  }, [cases]);

  const handleDownload = () => {
    const csvContent = [
      ['Type', 'ID', 'Patient/Doctor', 'Amount/Price', 'Status', 'Date'],
      ...filteredData.filteredCases.map(c => ['Case', c.id, c.patientName, c.price, c.status, c.createdAt?.toDate ? format(c.createdAt.toDate(), 'yyyy-MM-dd') : '']),
      ...filteredData.filteredInvoices.map(i => ['Invoice', i.id, i.doctorName, i.amount, i.status, i.createdAt?.toDate ? format(i.createdAt.toDate(), 'yyyy-MM-dd') : ''])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `DentalLab_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('reports-content');
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `DentalLab_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-text-main dark:text-zinc-100 tracking-tight">Business Intelligence</h1>
          <p className="text-[11px] text-text-muted dark:text-zinc-400 mt-0.5">Deep insights into your lab's performance and growth</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white dark:bg-zinc-900 border border-border-light dark:border-zinc-800 rounded-xl p-0.5 shadow-sm">
            {['This Month', 'Last Month', 'Last 3 Months'].map((type) => (
              <button
                key={type}
                onClick={() => handleFilterChange(type)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  filterType === type 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-text-muted hover:text-text-main dark:hover:text-zinc-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 text-text-main dark:text-zinc-100 border border-border-light dark:border-zinc-800 px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm"
            >
              <Download size={14} className="text-text-muted" />
              CSV
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:opacity-90 shadow-sm"
            >
              <Download size={14} />
              PDF Report
            </button>
          </div>
        </div>
      </div>

      <div id="reports-content" className="space-y-5">
        {/* Advanced Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-2xl border border-border-light dark:border-zinc-800">
        <div className="space-y-0.5">
          <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Doctor / Clinic</label>
          <div className="relative">
            <Users className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
            <select 
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full pl-7 pr-4 py-1 bg-white dark:bg-zinc-900 border border-border-light dark:border-zinc-800 rounded-lg text-[10px] font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
            >
              <option value="All">All Doctors</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
          </div>
        </div>

        <div className="space-y-0.5">
          <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Case Type</label>
          <div className="relative">
            <Package className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
            <select 
              value={selectedCaseType}
              onChange={(e) => setSelectedCaseType(e.target.value)}
              className="w-full pl-7 pr-4 py-1 bg-white dark:bg-zinc-900 border border-border-light dark:border-zinc-800 rounded-lg text-[10px] font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
            >
              <option value="All">All Types</option>
              {caseTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
          </div>
        </div>

        <div className="space-y-0.5">
          <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Date Range</label>
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
              <input 
                type="date"
                value={format(dateRange.start, 'yyyy-MM-dd')}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                className="w-full pl-7 pr-1 py-1 bg-white dark:bg-zinc-900 border border-border-light dark:border-zinc-800 rounded-lg text-[10px] font-bold outline-none"
              />
            </div>
            <span className="text-text-muted font-bold text-[9px]">to</span>
            <div className="relative flex-1">
              <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted" />
              <input 
                type="date"
                value={format(dateRange.end, 'yyyy-MM-dd')}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                className="w-full pl-7 pr-1 py-1 bg-white dark:bg-zinc-900 border border-border-light dark:border-zinc-800 rounded-lg text-[10px] font-bold outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-border-light dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className={`p-1.5 rounded-lg ${kpi.bg} dark:bg-opacity-10 group-hover:scale-105 transition-transform`}>
                <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              {kpi.growth !== null && (
                <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-wider ${
                  kpi.growth >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
                }`}>
                  {kpi.growth >= 0 ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}
                  {Math.abs(Math.round(kpi.growth))}%
                </div>
              )}
            </div>
            <div>
              <p className="text-text-muted dark:text-zinc-400 text-[7px] font-black uppercase tracking-[0.2em] mb-0.5">{kpi.label}</p>
              <h3 className="text-base font-black text-text-main dark:text-zinc-100">{kpi.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expense Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-border-light dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-black text-text-main dark:text-zinc-100 tracking-tight">Financial Overview</h3>
              <p className="text-[9px] text-text-muted font-bold">Revenue vs Expenses comparison</p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span className="text-[7px] font-black text-text-muted uppercase tracking-widest">Revenue</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                <span className="text-[7px] font-black text-text-muted uppercase tracking-widest">Expense</span>
              </div>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-light)" className="dark:stroke-zinc-800" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 8, fontWeight: 700, fill: 'var(--color-text-muted)'}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 8, fontWeight: 700, fill: 'var(--color-text-muted)'}}
                  tickFormatter={(value) => `${currencySymbol}${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '10px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: 'var(--color-background-main)',
                    padding: '6px',
                    fontSize: '9px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  fill="var(--color-primary)" 
                  fillOpacity={0.05} 
                  stroke="var(--color-primary)" 
                  strokeWidth={1.5} 
                />
                <Bar 
                  dataKey="expense" 
                  fill="#f43f5e" 
                  radius={[2, 2, 0, 0]} 
                  barSize={10} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Case Status Distribution */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-border-light dark:border-zinc-800 shadow-sm">
          <h3 className="text-sm font-black text-text-main dark:text-zinc-100 tracking-tight mb-0.5">Case Status</h3>
          <p className="text-[9px] text-text-muted font-bold mb-5">Operational workflow distribution</p>
          <div className="h-40 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={caseStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {caseStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '10px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: 'var(--color-background-main)',
                    fontSize: '9px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[7px] text-text-muted uppercase font-black tracking-widest leading-none">Total</p>
              <p className="text-lg font-black text-text-main dark:text-zinc-100">
                {filteredData.filteredCases.length}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-5">
            {caseStatusData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/50 p-1.5 rounded-xl border border-border-light dark:border-zinc-800">
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: STATUS_COLORS[index] }}></div>
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-text-muted uppercase tracking-wider leading-none mb-0.5">{entry.name}</span>
                  <span className="text-[10px] font-bold text-text-main dark:text-zinc-100 leading-none">{entry.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Doctors & Top Products */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-border-light dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-1.5 mb-4">
            <Users className="w-3.5 h-3.5 text-primary" />
            <h3 className="text-sm font-black text-text-main dark:text-zinc-100 tracking-tight">Top Doctors</h3>
          </div>
          <div className="space-y-2">
            {topDoctors.length > 0 ? topDoctors.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-border-light dark:border-zinc-800">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-text-main dark:text-zinc-100">{doc.name}</span>
                  <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest">{doc.cases} Cases</span>
                </div>
                <span className="text-[10px] font-black text-emerald-600">{currencySymbol}{doc.revenue.toLocaleString()}</span>
              </div>
            )) : (
              <p className="text-[10px] text-text-muted text-center py-5">No revenue data available</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-border-light dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-1.5 mb-4">
            <Package className="w-3.5 h-3.5 text-amber-500" />
            <h3 className="text-sm font-black text-text-main dark:text-zinc-100 tracking-tight">Top Products</h3>
          </div>
          <div className="space-y-2">
            {topCaseTypes.length > 0 ? topCaseTypes.map((type, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-border-light dark:border-zinc-800">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-text-main dark:text-zinc-100">{type.name}</span>
                  <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest">{type.count} Orders</span>
                </div>
                <span className="text-[10px] font-black text-blue-600">{currencySymbol}{type.revenue.toLocaleString()}</span>
              </div>
            )) : (
              <p className="text-[10px] text-text-muted text-center py-5">No product data available</p>
            )}
          </div>
        </div>

        {/* Efficiency & Retention Metrics */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-border-light dark:border-zinc-800 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
              <h3 className="text-sm font-black text-text-main dark:text-zinc-100 tracking-tight">Efficiency Metrics</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center gap-2 mb-1">
                  <Timer className="w-3 h-3 text-indigo-600" />
                  <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Avg. Turnaround</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-indigo-700">{avgTAT}</span>
                  <span className="text-[10px] font-bold text-indigo-600">Days</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Doctor Retention</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-emerald-700">{retentionRate}%</span>
                  <span className="text-[10px] font-bold text-emerald-600">Repeat Clients</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-border-light dark:border-zinc-800">
            <p className="text-[9px] text-text-muted font-bold leading-relaxed">
              <span className="text-primary">Tip:</span> Faster TAT usually leads to 15% higher doctor retention.
            </p>
          </div>
        </div>

        {/* Revenue by Case Type Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-border-light dark:border-zinc-800 shadow-sm">
          <h3 className="text-sm font-black text-text-main dark:text-zinc-100 tracking-tight mb-5">Revenue by Case Type</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCaseTypes} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border-light)" className="dark:stroke-zinc-800" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 8, fontWeight: 700, fill: 'var(--color-text-muted)'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 8, fontWeight: 700, fill: 'var(--color-text-muted)'}} width={70} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '10px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: 'var(--color-background-main)',
                    fontSize: '9px'
                  }}
                />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[0, 3, 3, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Summary */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-border-light dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-1.5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <h3 className="text-sm font-black text-text-main dark:text-zinc-100 tracking-tight">AI Insights</h3>
          </div>
          <div className="space-y-2.5">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className={`p-3 rounded-2xl border flex gap-3 ${
                insight.type === 'success' ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' :
                insight.type === 'warning' ? 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30' :
                insight.type === 'danger' ? 'bg-rose-50/50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30' :
                'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30'
              }`}>
                <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                  insight.type === 'success' ? 'bg-emerald-500' :
                  insight.type === 'warning' ? 'bg-amber-500' :
                  insight.type === 'danger' ? 'bg-rose-500' :
                  'bg-blue-500'
                }`} />
                <p className="text-[10px] font-bold text-text-main dark:text-zinc-200 leading-relaxed">
                  {insight.text}
                </p>
              </div>
            ))}
            {aiInsights.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Zap className="w-8 h-8 text-zinc-200 mb-2" />
                <p className="text-[10px] text-text-muted font-bold">Collecting data for insights...</p>
              </div>
            )}
          </div>
        </div>

        {/* Aging Report */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-border-light dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-1.5 mb-4">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <h3 className="text-sm font-black text-text-main dark:text-zinc-100 tracking-tight">Aging Report</h3>
          </div>
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
            {agingReport.length > 0 ? agingReport.map((inv, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-border-light dark:border-zinc-800">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-text-main dark:text-zinc-100">{inv.doctorName}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest">{inv.invoiceNumber}</span>
                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase ${
                      inv.daysOld > 30 ? 'bg-rose-100 text-rose-600' : 
                      inv.daysOld > 15 ? 'bg-amber-100 text-amber-600' : 
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {inv.daysOld} Days
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-text-main dark:text-zinc-100">{currencySymbol}{inv.amount.toLocaleString()}</span>
              </div>
            )) : (
              <p className="text-[10px] text-text-muted text-center py-5">No pending invoices</p>
            )}
          </div>
        </div>

        {/* Daily Case Volume */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-border-light dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-black text-text-main dark:text-zinc-100 tracking-tight">Case Volume</h3>
              <p className="text-[9px] text-text-muted font-bold">Daily workload intensity</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-light)" className="dark:stroke-zinc-800" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 8, fontWeight: 700, fill: 'var(--color-text-muted)'}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 8, fontWeight: 700, fill: 'var(--color-text-muted)'}}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '10px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: 'var(--color-background-main)',
                    fontSize: '9px'
                  }}
                  cursor={{ fill: 'var(--color-background-alt)', opacity: 0.4 }}
                />
                <Bar dataKey="cases" fill="var(--color-accent)" radius={[3, 3, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Reports;
