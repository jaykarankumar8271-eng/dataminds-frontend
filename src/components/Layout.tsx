import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'motion/react';
import { User, Settings, LogOut, ChevronDown, Bell, Search, Edit2, Eye, Lock, Unlock, Check, X, CreditCard } from 'lucide-react';
import { Tenant } from '../services/firestoreService';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
  userRole?: string;
  userEmail?: string;
  userStatus?: string;
  pendingApprovalsCount?: number;
  pendingCasesCount?: number;
  readyForInvoiceCount?: number;
  tenant?: Tenant | null;
  isImpersonating?: boolean;
  onExitImpersonation?: () => void;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  isInvoiceMode?: boolean;
  onToggleInvoiceMode?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  children, 
  userRole, 
  userEmail, 
  userStatus, 
  pendingApprovalsCount, 
  pendingCasesCount, 
  readyForInvoiceCount,
  tenant,
  isImpersonating,
  onExitImpersonation,
  isEditMode,
  onToggleEditMode,
  isInvoiceMode = false,
  onToggleInvoiceMode
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isPrivileged = userRole === 'admin' || userRole === 'super_admin';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-200">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
        userRole={userRole} 
        userStatus={isPrivileged ? 'approved' : userStatus}
        pendingApprovalsCount={pendingApprovalsCount}
        pendingCasesCount={pendingCasesCount}
        readyForInvoiceCount={readyForInvoiceCount}
        tenant={tenant}
        isInvoiceMode={isInvoiceMode}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      
      <main className={`flex-1 overflow-y-auto relative transition-all duration-500 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 transition-all">
          <div className="flex items-center gap-4">
            <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Portal</span>
                <ChevronDown size={10} className="-rotate-90" />
                <span className="text-slate-600 dark:text-slate-300">{activeTab.replace('-', ' ')}</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white capitalize tracking-tight">
                {activeTab.replace('-', ' ')}
              </h2>
            </div>

            {((tenant && tenant.id !== 'platform') || userRole === 'super_admin') && (
              <div className="hidden sm:flex items-center gap-3 ml-6 pl-6 border-l border-slate-200 dark:border-slate-800">
                {/* Invoice Mode Button */}
                {userRole === 'admin' && (
                  <button
                    onClick={onToggleInvoiceMode}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all border shadow-sm ${
                      isInvoiceMode 
                        ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-blue-200' 
                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                    }`}
                  >
                    <CreditCard size={12} />
                    <span>{isInvoiceMode ? 'Exit Invoice Mode' : 'Invoice Mode'}</span>
                  </button>
                )}

                {/* Edit Mode Toggle Switch */}
                {userRole === 'super_admin' && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onToggleEditMode}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 flex items-center p-1 ${
                        isEditMode 
                          ? 'bg-green-500 shadow-inner' 
                          : 'bg-gray-200 dark:bg-dark-bg'
                      }`}
                      title={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                    >
                      {isEditMode && (
                        <div className="absolute left-2 text-green-800/60">
                          <Check size={12} strokeWidth={4} />
                        </div>
                      )}
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`w-4 h-4 rounded-full bg-white shadow-lg flex items-center justify-center ${
                          isEditMode ? 'ml-auto' : 'ml-0'
                        }`}
                      >
                      </motion.div>
                      {!isEditMode && (
                        <div className="absolute right-2 opacity-30">
                          <Lock size={10} className="text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                    </button>
                    
                    {isImpersonating && (
                      <button
                        onClick={onExitImpersonation}
                        className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/30 transition-all border border-red-200 dark:border-red-800 shadow-sm"
                      >
                        <X size={12} />
                        <span>Exit Lab</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 lg:gap-6">
            <div className="hidden md:flex items-center bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl px-3 py-1.5 gap-2 w-32 focus-within:w-64 transition-all duration-300">
              <Search size={16} className="text-text-muted dark:text-dark-muted" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-text-muted dark:placeholder:text-dark-muted text-text-main dark:text-dark-text"
              />
            </div>

            <button className="p-2 text-text-muted dark:text-dark-muted hover:bg-background-alt dark:hover:bg-dark-bg rounded-xl transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white dark:border-dark-card"></span>
            </button>

            <div className="h-8 w-[1px] bg-border-light dark:bg-dark-border hidden sm:block"></div>

            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 p-1 hover:bg-background-alt dark:hover:bg-dark-bg rounded-2xl transition-all group"
              >
                <div className="w-10 h-10 bg-primary/10 dark:bg-accent/20 rounded-full flex items-center justify-center border-2 border-primary/20 dark:border-accent/30 shadow-sm group-hover:shadow-md transition-all overflow-hidden">
                  {/* Professional Avatar Placeholder */}
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-light dark:from-accent dark:to-accent/80 text-white">
                    <span className="font-bold text-lg">
                      {(userEmail || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <ChevronDown size={16} className={`text-text-muted dark:text-dark-muted transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-border-light dark:border-dark-border py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-border-light dark:border-dark-border mb-1">
                      <p className="text-[10px] font-bold text-text-muted dark:text-dark-muted uppercase tracking-widest mb-1">
                        Signed in as {userRole === 'super_admin' ? 'Super Admin' : (userRole?.replace('_', ' ') || 'User')}
                      </p>
                      <p className="text-sm font-bold text-text-main dark:text-dark-text truncate">{userEmail}</p>
                    </div>
                    
                    <button 
                      onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-background-alt dark:hover:bg-dark-bg transition-colors text-text-main dark:text-dark-text font-medium"
                    >
                      <User size={18} className="text-primary dark:text-accent" />
                      <span>My Profile</span>
                    </button>
                    
                    {userRole === 'admin' && (
                      <button 
                        onClick={() => { setActiveTab('subscription'); setShowProfileMenu(false); }}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-background-alt dark:hover:bg-dark-bg transition-colors text-text-main dark:text-dark-text font-medium"
                      >
                        <CreditCard size={18} className="text-blue-500" />
                        <span>Subscription</span>
                      </button>
                    )}
                    
                    <button 
                      onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-background-alt dark:hover:bg-dark-bg transition-colors text-text-main dark:text-dark-text font-medium"
                    >
                      <Settings size={18} className="text-accent" />
                      <span>Settings</span>
                    </button>
                    
                    <div className="h-[1px] bg-border-light dark:bg-dark-border my-1"></div>
                    
                    <button 
                      onClick={() => { onLogout(); setShowProfileMenu(false); }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 transition-colors text-red-600 font-bold"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
