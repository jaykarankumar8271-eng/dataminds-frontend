import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  FileText, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  User,
  CheckCircle2,
  Building2,
  CreditCard,
  Package,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tenant } from '../services/firestoreService';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userRole?: string;
  userStatus?: string;
  pendingApprovalsCount?: number;
  pendingCasesCount?: number;
  readyForInvoiceCount?: number;
  tenant?: Tenant | null;
  isInvoiceMode?: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  userRole, 
  userStatus, 
  pendingApprovalsCount = 0, 
  pendingCasesCount = 0, 
  readyForInvoiceCount = 0,
  tenant,
  isInvoiceMode = false,
  isCollapsed,
  setIsCollapsed
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'doctor'] },
    { id: 'platform-stats', label: 'Platform Stats', icon: BarChart3, roles: ['super_admin'] },
    { id: 'tenants', label: 'Labs (Tenants)', icon: Building2, roles: ['super_admin', 'admin'] },
    { id: 'cases', label: 'Cases (Orders)', icon: Briefcase, roles: ['super_admin', 'admin', 'doctor'] },
    { id: 'doctors', label: 'Doctors (Clients)', icon: Users, roles: ['super_admin', 'admin'] },
    { id: 'expenses', label: 'Expenses', icon: Wallet, roles: ['super_admin', 'admin'] },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle2, roles: ['super_admin', 'admin'] },
    { id: 'invoices', label: 'Invoices', icon: FileText, roles: ['super_admin', 'admin', 'doctor'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['super_admin', 'admin'] },
    { id: 'platform-billing', label: 'Platform Billing', icon: CreditCard, roles: ['super_admin'] },
  ];

  const filteredItems = menuItems.filter(item => {
    const hasRole = item.roles.includes(userRole || '');
    
    // If invoice mode is active for admin, only show cases and invoices
    if (isInvoiceMode && userRole === 'admin') {
      return ['cases', 'invoices'].includes(item.id);
    }

    if (userRole === 'super_admin') return hasRole;
    if (userRole === 'admin') return hasRole;
    
    // For doctors, only show dashboard if not approved
    if (userStatus !== 'approved') {
      return item.id === 'dashboard';
    }
    
    return hasRole;
  });

  const toggleSidebar = () => setIsOpen(!isOpen);

  const SidebarContent = () => (
    <div className={`h-full bg-slate-950 flex flex-col text-white shadow-2xl transition-all duration-500 relative ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Collapse Toggle Button (Desktop Only) */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-10 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all z-50 shadow-lg"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo Area */}
      <div className={`p-6 flex items-center gap-3 border-b border-white/5 mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          {tenant?.logoUrl ? (
            <img src={tenant.logoUrl} alt={tenant.name} className="relative w-10 h-10 rounded-xl object-contain bg-white p-1.5 shadow-2xl" referrerPolicy="no-referrer" />
          ) : (
            <div className="relative w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-white/10 shadow-2xl">
              <span className="text-blue-400 font-black text-xl tracking-tighter">
                {(tenant?.name || 'DL').charAt(0)}
              </span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col min-w-0"
          >
            <h1 className="text-sm font-black tracking-tight truncate uppercase text-white">
              {tenant?.name || 'DentalLab'}
            </h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Enterprise</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative ${
                isActive 
                  ? 'bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              <div className={`relative transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-400' : ''}`}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <div className="absolute inset-0 bg-blue-400/20 blur-lg rounded-full" />
                )}
              </div>
              
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`font-bold text-xs tracking-wide ${isActive ? 'text-white' : ''}`}
                >
                  {item.label}
                </motion.span>
              )}

              {/* Badges */}
              {!isCollapsed && (
                <div className="ml-auto flex items-center gap-1.5">
                  {item.id === 'approvals' && pendingApprovalsCount > 0 && (
                    <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg shadow-lg shadow-rose-500/20">
                      {pendingApprovalsCount}
                    </span>
                  )}
                  {item.id === 'cases' && pendingCasesCount > 0 && (
                    <span className="bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg shadow-lg shadow-blue-500/20">
                      {pendingCasesCount}
                    </span>
                  )}
                  {item.id === 'invoices' && readyForInvoiceCount > 0 && (
                    <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg shadow-lg shadow-emerald-500/20">
                      {readyForInvoiceCount}
                    </span>
                  )}
                </div>
              )}

              {/* Active Indicator */}
              {isActive && (
                <motion.div 
                  layoutId="activeTabGlow"
                  className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/5">
        {!isCollapsed ? (
          <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                <Sparkles size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Premium Support</p>
                <p className="text-[9px] text-slate-500 font-bold truncate">24/7 Priority Access</p>
              </div>
            </div>
            <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black rounded-xl transition-all uppercase tracking-widest">
              Contact Concierge
            </button>
          </div>
        ) : (
          <button className="w-full flex justify-center p-3 text-slate-500 hover:text-white transition-colors">
            <Settings2 size={20} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={toggleSidebar}
          className="p-2 bg-primary text-white rounded-lg shadow-lg"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40 transition-all duration-500 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.aside 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 w-64 h-screen z-[70]"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
