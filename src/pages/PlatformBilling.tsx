import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Github, 
  Globe, 
  TrendingUp, 
  Zap, 
  CreditCard,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Loader2
} from 'lucide-react';

const PlatformBilling: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState<any>(null);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const response = await fetch('/api/billing');
        const data = await response.json();
        setBillingData(data);
      } catch (error) {
        console.error('Failed to fetch billing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBilling();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Platform Cost', value: billingData?.totalCost || '$0.00', change: '+12%', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Subscriptions', value: billingData?.activeSubscriptions || '0', change: '+2', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Projected Monthly', value: billingData?.projectedMonthly || '$0.00', change: '+5%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const services = [
    {
      name: 'Firebase',
      icon: Database,
      color: 'text-orange-500',
      plan: 'Blaze (Pay-as-you-go)',
      usage: billingData?.firebase?.usage || [],
      cost: billingData?.firebase?.cost || '$0.00'
    },
    {
      name: 'GitHub',
      icon: Github,
      color: 'text-zinc-900',
      plan: 'Team Plan',
      usage: billingData?.github?.usage || [],
      cost: billingData?.github?.cost || '$0.00'
    },
    {
      name: 'Vercel',
      icon: Globe,
      color: 'text-black',
      plan: 'Pro Plan',
      usage: billingData?.vercel?.usage || [],
      cost: billingData?.vercel?.cost || '$0.00'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text-main dark:text-zinc-100 tracking-tight">Infrastructure Billing</h1>
        <p className="text-[11px] text-text-muted dark:text-zinc-400 mt-0.5">Real-time monitoring of infrastructure costs and usage limits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-border-light dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} dark:bg-opacity-10`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-text-muted text-[8px] font-black uppercase tracking-[0.2em] mb-0.5">{stat.label}</p>
              <div className="flex items-baseline gap-1.5">
                <h3 className="text-lg font-black text-text-main dark:text-zinc-100">{stat.value}</h3>
                <span className="text-[9px] font-bold text-green-500">{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {services.map((service, idx) => (
          <div key={idx} className="bg-white dark:bg-zinc-900 rounded-2xl border border-border-light dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border-light dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                  <service.icon className={`w-5 h-5 ${service.color}`} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-text-main dark:text-zinc-100">{service.name}</h3>
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">{service.plan}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Current Cost</p>
                <p className="text-sm font-black text-text-main dark:text-zinc-100">{service.cost}</p>
              </div>
            </div>
            
            <div className="p-4 space-y-4 flex-1">
              {service.usage.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-text-main dark:text-zinc-300">{item.label}</span>
                    <span className="text-text-muted">{item.current} / {item.limit}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        item.percent > 90 ? 'bg-red-500' : 
                        item.percent > 70 ? 'bg-amber-500' : 
                        'bg-blue-500'
                      }`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">{item.percent}% Used</span>
                    {item.percent > 80 && (
                      <span className="flex items-center gap-1 text-[8px] font-black text-red-500 uppercase tracking-widest">
                        <AlertCircle size={8} /> Near Limit
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/30 border-t border-border-light dark:border-zinc-800">
              <button className="w-full py-1.5 text-[9px] font-black text-text-muted hover:text-text-main uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5">
                <BarChart3 size={12} /> View Detailed Usage
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 dark:bg-zinc-100 rounded-2xl p-6 text-white dark:text-zinc-900 relative overflow-hidden shadow-xl shadow-zinc-500/10">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 dark:bg-zinc-900/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-black tracking-tight">Infrastructure Health</h2>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 max-w-md">All systems are operational. Usage is within expected parameters for the current billing cycle.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white/10 dark:bg-zinc-900/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 dark:border-zinc-900/20">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="font-black text-[10px] uppercase tracking-widest">Healthy</span>
            </div>
            <button className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg">
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformBilling;
