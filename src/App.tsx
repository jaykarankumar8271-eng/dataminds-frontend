import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { auth, db } from './firebase';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import Doctors from './pages/Doctors';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Approvals from './pages/Approvals';
import Settings from './pages/Settings';
import Tenants from './pages/Tenants';
import Billing from './pages/Billing';
import PlatformBilling from './pages/PlatformBilling';
import Subscription from './pages/Subscription';
import Invite from './pages/Invite';
import PlatformStats from './pages/PlatformStats';
import Expenses from './pages/Expenses';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getUserProfile, 
  UserProfile, 
  seedDemoData as seedServiceData, 
  subscribeToPendingApprovals, 
  subscribeToPendingCasesCount, 
  subscribeToReadyForInvoiceCount,
  subscribeToTenant,
  Tenant
} from './services/firestoreService';
import { doc, setDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { Building2, User as UserIcon, ArrowRight } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { applyTheme, getStoredTheme } from './lib/theme';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [initialModalState, setInitialModalState] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [pendingCasesCount, setPendingCasesCount] = useState(0);
  const [readyForInvoiceCount, setReadyForInvoiceCount] = useState(0);
  const [effectiveTenantId, setEffectiveTenantId] = useState<string | undefined>(undefined);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isInvoiceMode, setIsInvoiceMode] = useState(false);

  const isInvitePage = window.location.pathname === '/invite';

  const handleNavigate = (tab: string, openModal: boolean = false) => {
    setActiveTab(tab);
    setInitialModalState(openModal);
  };

  const toggleInvoiceMode = () => {
    setIsInvoiceMode(!isInvoiceMode);
    if (!isInvoiceMode) {
      setActiveTab('cases'); // Default to cases when entering invoice mode
    }
  };

  useEffect(() => {
    // Reset initialModalState when tab changes if it was consumed
    if (initialModalState) {
      const timer = setTimeout(() => setInitialModalState(false), 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab, initialModalState]);

  useEffect(() => {
    // Initialize theme on load
    const theme = getStoredTheme();
    applyTheme(theme);
  }, []);

  useEffect(() => {
    console.log('App: Starting Auth listener...');
    
    // Safety timeout: if Firebase doesn't respond in 5 seconds, stop loading
    const safetyTimer = setTimeout(() => {
      if (loading) {
        console.warn('App: Auth listener timed out. Stopping loading state.');
        setLoading(false);
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      clearTimeout(safetyTimer);
      console.log('App: Auth state changed. User:', currentUser?.email || 'None');
      
      try {
        setUser(currentUser);
        if (currentUser) {
          console.log('App: Setting up profile listener for:', currentUser.uid);
          
          // Use onSnapshot for real-time profile updates
          const profileUnsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), async (docSnap) => {
            if (docSnap.exists()) {
              let profile = docSnap.data() as UserProfile;
              
              // Auto-create super_admin profile for the owner
              if (currentUser.email === 'theblackman2902@gmail.com') {
                if (profile.role !== 'super_admin' || profile.status !== 'approved') {
                  // Ensure the owner always has super_admin role and approved status
                  profile.role = 'super_admin';
                  profile.status = 'approved';
                  profile.tenantId = 'platform';
                  try {
                    await setDoc(doc(db, 'users', currentUser.uid), { ...profile });
                  } catch (err) {
                    console.error('Error updating super_admin role:', err);
                  }
                }
              }
              
              setUserProfile(profile);
              setEffectiveTenantId(profile?.tenantId);

              // Fetch tenant branding if applicable
              if (profile?.tenantId) {
                const { getTenant } = await import('./services/firestoreService');
                const tenantData = await getTenant(profile.tenantId);
                setCurrentTenant(tenantData);
              }
            } else {
              // No profile found - handle owner auto-creation
              if (currentUser.email === 'theblackman2902@gmail.com') {
                console.log('App: Creating super_admin profile for owner...');
                const profile = {
                  uid: currentUser.uid,
                  role: 'super_admin',
                  status: 'approved',
                  email: currentUser.email || '',
                  tenantId: 'platform'
                };
                try {
                  await setDoc(doc(db, 'users', currentUser.uid), profile);
                  setUserProfile(profile);
                } catch (err) {
                  console.error('Error creating super_admin profile:', err);
                }
              } else {
                console.log('App: No profile found for new user. Waiting for role selection.');
                setUserProfile(null);
              }
            }
            setLoading(false);
          });

          // Store profileUnsubscribe to clean up later
          return () => profileUnsubscribe();
        } else {
          setUserProfile(null);
          setCurrentTenant(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setLoading(false);
      }
    });
    return () => {
      unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  useEffect(() => {
    let unsubApprovals = () => {};
    let unsubPendingCases = () => {};
    let unsubReadyForInvoice = () => {};

    if (userProfile?.role === 'admin' || userProfile?.role === 'super_admin') {
      unsubApprovals = subscribeToPendingApprovals(effectiveTenantId, setPendingApprovalsCount);
      unsubPendingCases = subscribeToPendingCasesCount(effectiveTenantId, setPendingCasesCount);
      unsubReadyForInvoice = subscribeToReadyForInvoiceCount(effectiveTenantId, setReadyForInvoiceCount);
    } else {
      setPendingApprovalsCount(0);
      setPendingCasesCount(0);
      setReadyForInvoiceCount(0);
    }

    let unsubTenant = () => {};
    if (effectiveTenantId && effectiveTenantId !== 'platform') {
      unsubTenant = subscribeToTenant(effectiveTenantId, setCurrentTenant);
    } else {
      setCurrentTenant(null);
    }

    return () => {
      unsubApprovals();
      unsubPendingCases();
      unsubReadyForInvoice();
      unsubTenant();
    };
  }, [userProfile, effectiveTenantId]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab('dashboard');
      setEffectiveTenantId(undefined);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSwitchTenant = (tenantId: string | null) => {
    if (userProfile?.role !== 'super_admin') return;
    const newTenantId = tenantId || 'platform';
    setEffectiveTenantId(newTenantId);
    setIsEditMode(false); // Reset edit mode when switching
    
    if (newTenantId === 'platform') {
      setCurrentTenant(null);
      setActiveTab('platform-stats');
    } else {
      setActiveTab('dashboard');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-alt">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isInvitePage) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <Invite />
      </>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-alt p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-border-light"
        >
          <div className="bg-primary p-10 text-center text-white">
            <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-6">
              <span className="text-white font-bold text-4xl">DL</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">DentalLab SaaS</h1>
            <p className="mt-2 text-white/70">Multi-Tenant Lab Management Platform</p>
          </div>
          <div className="p-10 text-center">
            <h2 className="text-xl font-bold text-text-main mb-2">Welcome Back</h2>
            <p className="text-text-muted mb-8">Please sign in to manage your lab operations.</p>
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-border-light hover:bg-background-alt text-text-main font-bold py-4 px-6 rounded-2xl shadow-sm transition-all duration-200"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                Platform Owner: theblackman2902@gmail.com
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSeedData = async () => {
    if (userProfile?.role !== 'admin' || !userProfile.tenantId) return;
    
    try {
      await seedServiceData(userProfile.tenantId);
      console.log('Demo data seeded successfully!');
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  const renderContent = () => {
    const isImpersonating = userProfile?.role === 'super_admin' && effectiveTenantId !== 'platform';
    const isSuperAdmin = userProfile?.role === 'super_admin';
    // Super Admin can only edit if isEditMode is true
    // Regular Admin can always edit their own lab
    const canEdit = isSuperAdmin ? isEditMode : true;

    const commonProps = {
      tenantId: effectiveTenantId,
      userRole: userProfile?.role,
      userEmail: user.email || '',
      userId: userProfile?.entityId || user.uid,
      initialShowModal: initialModalState,
      plan: currentTenant?.plan || 'Basic',
      tenant: currentTenant,
      canEdit: canEdit,
      isImpersonating: isImpersonating,
      onExitImpersonation: () => handleSwitchTenant(null),
      tenantName: currentTenant?.name,
      currency: currentTenant?.currency || 'INR'
    };

    if (user && !userProfile && user.email !== 'theblackman2902@gmail.com') {
      return (
        <div className="p-6 max-w-4xl mx-auto mt-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-text-main mb-4 tracking-tight">Welcome to DentalLab SaaS</h2>
            <p className="text-text-muted text-lg">Please select your role to request access to the platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Lab Admin Option */}
            <motion.button
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                const newProfile: UserProfile = {
                  uid: user.uid,
                  role: 'admin',
                  status: 'pending',
                  email: user.email || '',
                  requestedAt: Timestamp.now()
                };
                await setDoc(doc(db, 'users', user.uid), newProfile);
                setUserProfile(newProfile);
                toast.success('Request sent as Lab Admin');
              }}
              className="bg-white dark:bg-dark-card p-10 rounded-[2.5rem] border-2 border-border-light dark:border-dark-border hover:border-primary dark:hover:border-accent transition-all text-left shadow-sm hover:shadow-2xl group"
            >
              <div className="w-16 h-16 bg-primary/10 dark:bg-accent/20 rounded-2xl flex items-center justify-center text-primary dark:text-accent mb-8 group-hover:scale-110 transition-transform">
                <Building2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-text-main dark:text-dark-text mb-3">Lab Admin</h3>
              <p className="text-text-muted dark:text-dark-muted leading-relaxed">
                Register your dental laboratory, track cases, and handle billing for your clients.
              </p>
              <div className="mt-8 flex items-center gap-2 text-primary dark:text-accent font-bold">
                <span>Select Role</span>
                <ArrowRight size={18} />
              </div>
            </motion.button>

            {/* Doctor Option */}
            <motion.button
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={async () => {
                const newProfile: UserProfile = {
                  uid: user.uid,
                  role: 'doctor',
                  status: 'pending',
                  email: user.email || '',
                  requestedAt: Timestamp.now()
                };
                await setDoc(doc(db, 'users', user.uid), newProfile);
                setUserProfile(newProfile);
                toast.success('Request sent as Doctor');
              }}
              className="bg-white dark:bg-dark-card p-10 rounded-[2.5rem] border-2 border-border-light dark:border-dark-border hover:border-primary dark:hover:border-accent transition-all text-left shadow-sm hover:shadow-2xl group"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-8 group-hover:scale-110 transition-transform">
                <UserIcon size={32} />
              </div>
              <h3 className="text-2xl font-bold text-text-main dark:text-dark-text mb-3">Doctor / Clinic</h3>
              <p className="text-text-muted dark:text-dark-muted leading-relaxed">
                Connect with labs, submit cases, track progress in real-time, and manage your clinic's dental orders.
              </p>
              <div className="mt-8 flex items-center gap-2 text-accent font-bold">
                <span>Select Role</span>
                <ArrowRight size={18} />
              </div>
            </motion.button>
          </div>

          <div className="mt-16 p-8 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30 text-center">
            <p className="text-blue-700 dark:text-blue-400 font-medium">
              After selecting a role, your request will be sent for approval. 
              Lab Admins are approved by the Platform Super Admin, and Doctors are approved by their respective labs.
            </p>
          </div>
        </div>
      );
    }

    if (userProfile?.status === 'approved' && !userProfile.tenantId && userProfile.role !== 'super_admin' && activeTab !== 'settings') {
      if (userProfile.role === 'admin') {
        return (
          <div className="p-6 max-w-2xl mx-auto mt-20 text-center">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Building2 size={40} />
            </div>
            <h2 className="text-3xl font-bold text-text-main mb-4">Approved! Now Create Your Lab</h2>
            <p className="text-text-muted text-lg leading-relaxed mb-8">
              Your account as a Lab Admin has been approved. To get started, you need to register your dental laboratory.
            </p>
            <button 
              onClick={() => setActiveTab('settings')}
              className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-light transition-all shadow-lg shadow-primary/20"
            >
              Go to Settings to Create Lab
            </button>
          </div>
        );
      } else if (userProfile.role === 'doctor') {
        return (
          <div className="p-6 max-w-2xl mx-auto mt-20 text-center">
            <div className="w-20 h-20 bg-accent/10 text-accent rounded-3xl flex items-center justify-center mx-auto mb-6">
              <UserIcon size={40} />
            </div>
            <h2 className="text-3xl font-bold text-text-main mb-4">Approved! Join a Lab</h2>
            <p className="text-text-muted text-lg leading-relaxed mb-8">
              Your account as a Doctor has been approved. Please contact your dental laboratory to add you to their system using your email: <span className="font-bold text-text-main">{user.email}</span>
            </p>
            <div className="p-6 bg-background-alt rounded-3xl border border-border-light">
              <p className="text-sm text-text-muted">
                Once a lab adds you, you will be able to submit and track cases.
              </p>
            </div>
          </div>
        );
      }
    }

    if (userProfile?.status === 'pending' && userProfile?.role !== 'super_admin') {
      return (
        <div className="p-6 max-w-2xl mx-auto mt-20 text-center">
          <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="text-4xl">⏳</span>
            </motion.div>
          </div>
          <h2 className="text-3xl font-bold text-text-main mb-4">Account Pending Approval</h2>
          <p className="text-text-muted text-lg leading-relaxed">
            Your account is currently pending approval from the lab administrator. 
            Once approved, you will be able to access your dashboard and manage cases.
          </p>
          <div className="mt-8 p-6 bg-background-alt rounded-3xl border border-border-light inline-block">
            <p className="text-sm text-text-muted">
              Registered Email: <span className="font-bold text-text-main">{user.email}</span>
            </p>
          </div>
        </div>
      );
    }

    if (currentTenant?.status === 'Pending Approval' && userProfile?.role !== 'super_admin') {
      return (
        <div className="p-6 max-w-2xl mx-auto mt-20 text-center">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="text-4xl">🏢</span>
            </motion.div>
          </div>
          <h2 className="text-3xl font-bold text-text-main mb-4">Lab Approval Pending</h2>
          <p className="text-text-muted text-lg leading-relaxed">
            The lab <span className="font-bold text-text-main">"{currentTenant.name}"</span> is currently pending approval from the Super Admin. 
            Access to lab operations will be enabled once the lab is approved.
          </p>
          <div className="mt-8 p-6 bg-background-alt rounded-3xl border border-border-light inline-block">
            <p className="text-sm text-text-muted">
              Lab Status: <span className="font-bold text-amber-600">Pending Approval</span>
            </p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard {...commonProps} onSeedData={handleSeedData} onNavigate={handleNavigate} />;
      case 'cases':
        return <Cases {...commonProps} />;
      case 'doctors':
        return <Doctors {...commonProps} />;
      case 'invoices':
        return <Invoices {...commonProps} />;
      case 'expenses':
        return <Expenses {...commonProps} />;
      case 'reports':
        return <Reports {...commonProps} />;
      case 'approvals':
        return <Approvals {...commonProps} />;
      case 'profile':
        return <Profile {...commonProps} authUid={user.uid} />;
      case 'settings':
        return <Settings {...commonProps} />;
      case 'billing':
        return <Billing {...commonProps} />;
      case 'platform-billing':
        return <PlatformBilling />;
      case 'subscription':
        return <Subscription tenant={currentTenant} />;
      case 'tenants':
        return (userProfile?.role === 'super_admin' || userProfile?.role === 'admin') ? <Tenants {...commonProps} onSwitchTenant={handleSwitchTenant} /> : <Dashboard {...commonProps} onNavigate={handleNavigate} />;
      case 'platform-stats':
        return <PlatformStats canEdit={canEdit} onNavigate={handleNavigate} />;
      default:
        return <Dashboard {...commonProps} onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={handleLogout}
      userRole={userProfile?.role}
      userEmail={user.email || ''}
      userStatus={userProfile?.status}
      pendingApprovalsCount={pendingApprovalsCount}
      pendingCasesCount={pendingCasesCount}
      readyForInvoiceCount={readyForInvoiceCount}
      tenant={currentTenant}
      isImpersonating={userProfile?.role === 'super_admin' && effectiveTenantId !== 'platform'}
      onExitImpersonation={() => handleSwitchTenant(null)}
      isEditMode={isEditMode}
      onToggleEditMode={() => setIsEditMode(!isEditMode)}
      isInvoiceMode={isInvoiceMode}
      onToggleInvoiceMode={toggleInvoiceMode}
    >
      <Toaster position="top-right" richColors />
      {currentTenant?.primaryColor && (
        <style>
          {`
            :root {
              --primary: ${currentTenant.primaryColor};
              --primary-light: ${currentTenant.primaryColor}dd;
              --accent: ${currentTenant.accentColor || currentTenant.primaryColor};
            }
          `}
        </style>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

export default App;
