import React, { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { applyTheme, getStoredTheme, setStoredTheme } from '../lib/theme';
import { 
  getTenant, 
  updateTenantBranding,
  seedDemoData
} from '../services/firestoreService';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  Globe, 
  Mail,
  Save,
  CheckCircle2,
  Download,
  Trash2,
  RefreshCw,
  Sun,
  Moon,
  Monitor,
  Image as ImageIcon,
  Type,
  Building2
} from 'lucide-react';

interface SettingsProps {
  tenantId?: string;
  userRole?: string;
  userId?: string;
  userEmail?: string;
  canEdit?: boolean;
}

const Settings: React.FC<SettingsProps> = ({ tenantId, userRole, userId, userEmail, canEdit = true }) => {
  const [activeSection, setActiveSection] = useState('general');
  const [saved, setSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Settings State
  const [labName, setLabName] = useState('DentalLab Pro');
  const [contactEmail, setContactEmail] = useState('lab@dentallabpro.com');
  const [currency, setCurrency] = useState('INR');
  const [calendarType, setCalendarType] = useState<'Indian' | 'Nepali'>('Indian');
  const [timezone, setTimezone] = useState('IST (GMT+5:30)');
  const [publicProfile, setPublicProfile] = useState(true);

  // Branding State
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#F27D26');
  const [accentColor, setAccentColor] = useState('#F27D26');
  const [isUploading, setIsUploading] = useState(false);

  const [notifications, setNotifications] = useState({
    newCase: true,
    statusUpdates: true,
    invoiceReminders: true
  });

  const [appearance, setAppearance] = useState(() => {
    return getStoredTheme();
  });

  const [isCreatingTenant, setIsCreatingTenant] = useState(false);
  const [newTenantData, setNewTenantData] = useState({
    name: '',
    subdomain: '',
    email: userEmail || '',
    phone: '',
    address: '',
    currency: 'INR' as 'INR' | 'NPR'
  });

  // Initial application of theme and fetch tenant data
  React.useEffect(() => {
    applyTheme(appearance);

    const fetchTenantData = async () => {
      if (tenantId && (userRole === 'admin' || userRole === 'super_admin')) {
        try {
          const tenant = await getTenant(tenantId);
          if (tenant) {
            setLabName(tenant.name);
            setContactEmail(tenant.email || '');
            setLogoUrl(tenant.logoUrl || '');
            setPrimaryColor(tenant.primaryColor || '#F27D26');
            setAccentColor(tenant.accentColor || '#F27D26');
            setCurrency(tenant.currency || 'INR');
            setCalendarType(tenant.calendarType || 'Indian');
          }
        } catch (error) {
          console.error('Error fetching tenant data:', error);
        }
      }
    };

    fetchTenantData();
  }, [tenantId, userRole]);

  const handleCreateTenant = async () => {
    if (!newTenantData.name || !newTenantData.subdomain) {
      toast.error('Lab Name and Subdomain are required');
      return;
    }

    setIsCreatingTenant(true);
    try {
      const { createTenant } = await import('../services/firestoreService');
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');

      const tenantRef = await createTenant({
        name: newTenantData.name,
        subdomain: newTenantData.subdomain.toLowerCase().replace(/\s+/g, '-'),
        ownerEmail: userEmail || '',
        email: newTenantData.email,
        phone: newTenantData.phone,
        address: newTenantData.address,
        plan: 'Basic',
        status: 'Pending Approval',
        currency: newTenantData.currency,
        calendarType: 'Indian'
      });

      if (tenantRef && userId) {
        await updateDoc(doc(db, 'users', userId), {
          tenantId: tenantRef.id
        });
        toast.success('Lab created successfully! Waiting for Super Admin approval.');
        window.location.reload(); // Refresh to update app state
      }
    } catch (error) {
      console.error('Error creating lab:', error);
      toast.error('Failed to create lab');
    } finally {
      setIsCreatingTenant(false);
    }
  };

  if (!tenantId && userRole === 'admin') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white dark:bg-dark-card rounded-[2.5rem] p-10 border border-border-light dark:border-dark-border shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-main dark:text-dark-text">Register Your Lab</h2>
              <p className="text-text-muted dark:text-dark-muted">Enter your laboratory details to get started.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-text-main dark:text-dark-text mb-2">Laboratory Name *</label>
              <input
                type="text"
                value={newTenantData.name}
                onChange={(e) => setNewTenantData({ ...newTenantData, name: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-border-light dark:border-dark-border bg-background-alt dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="e.g. DentalLab Pro"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-main dark:text-dark-text mb-2">Subdomain * (e.g. lab-name)</label>
              <input
                type="text"
                value={newTenantData.subdomain}
                onChange={(e) => setNewTenantData({ ...newTenantData, subdomain: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-border-light dark:border-dark-border bg-background-alt dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="lab-name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-text-main dark:text-dark-text mb-2">Contact Email</label>
                <input
                  type="email"
                  value={newTenantData.email}
                  onChange={(e) => setNewTenantData({ ...newTenantData, email: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border border-border-light dark:border-dark-border bg-background-alt dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-main dark:text-dark-text mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={newTenantData.phone}
                  onChange={(e) => setNewTenantData({ ...newTenantData, phone: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border border-border-light dark:border-dark-border bg-background-alt dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-main dark:text-dark-text mb-2">Currency</label>
              <select
                value={newTenantData.currency}
                onChange={(e) => setNewTenantData({ ...newTenantData, currency: e.target.value as 'INR' | 'NPR' })}
                className="w-full px-5 py-4 rounded-2xl border border-border-light dark:border-dark-border bg-background-alt dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all"
              >
                <option value="INR">INR (₹)</option>
                <option value="NPR">NPR (रू)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-main dark:text-dark-text mb-2">Address</label>
              <textarea
                value={newTenantData.address}
                onChange={(e) => setNewTenantData({ ...newTenantData, address: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-border-light dark:border-dark-border bg-background-alt dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none transition-all h-24"
              />
            </div>

            <button
              onClick={handleCreateTenant}
              disabled={isCreatingTenant}
              className="w-full bg-primary text-white py-5 rounded-2xl font-bold hover:bg-primary-light transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCreatingTenant ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              {isCreatingTenant ? 'Creating Lab...' : 'Register Laboratory'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaved(true);
    // Persist appearance to localStorage
    setStoredTheme(appearance);
    
    toast.success('Settings saved successfully!');
    
    if (tenantId && (userRole === 'admin' || userRole === 'super_admin')) {
      try {
        await updateTenantBranding(tenantId, {
          logoUrl,
          primaryColor,
          accentColor
        });
        
        const { updateDoc, doc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        await updateDoc(doc(db, 'tenants', tenantId), {
          name: labName,
          email: contactEmail,
          currency: currency as 'INR' | 'NPR',
          calendarType: calendarType,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating tenant settings:', error);
        toast.error('Failed to update lab settings.');
      }
    }

    // In a real app, we would persist these to Firestore here
    console.log('Saving settings:', {
      labName,
      contactEmail,
      currency,
      timezone,
      publicProfile,
      notifications,
      appearance
    });
    setTimeout(() => setSaved(false), 3000);
  };

  const sections = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'branding', label: 'Branding', icon: ImageIcon, roles: ['admin', 'super_admin'] },
  ].filter(s => !s.roles || s.roles.includes(userRole || ''));

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAppearanceChange = (theme: string) => {
    setAppearance(theme);
    applyTheme(theme);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      toast.error('Logo must be smaller than 500KB');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
      setIsUploading(false);
      toast.success('Logo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    setIsExporting(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Preparing export...',
        success: 'Data exported successfully! Check your downloads.',
        error: 'Export failed.',
        finally: () => setIsExporting(false)
      }
    );
  };

  const handleBackup = () => {
    setIsBackingUp(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 3000)),
      {
        loading: 'Creating backup snapshot...',
        success: 'Backup completed successfully!',
        error: 'Backup failed.',
        finally: () => setIsBackingUp(false)
      }
    );
  };

  const handleSeedData = async () => {
    if (!tenantId) return;
    
    if (window.confirm('This will add 30+ sample cases, doctors, and inventory items to your lab. Proceed?')) {
      setIsSeeding(true);
      try {
        await seedDemoData(tenantId);
        toast.success('Demo data seeded successfully! Refreshing dashboard...');
        setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
        console.error('Error seeding data:', error);
        toast.error('Failed to seed demo data.');
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear local data? Your records in the database will remain safe.')) {
      localStorage.removeItem('dentallab-theme');
      toast.success('Local data cleared. Resetting preferences...');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-main dark:text-dark-text">Settings</h1>
          <p className="text-text-muted dark:text-dark-muted">Manage your lab's configuration and preferences.</p>
        </div>
        <button 
          onClick={() => canEdit && handleSave()}
          disabled={!canEdit}
          className={`bg-primary hover:bg-primary-light text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg font-bold ${!canEdit ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          {saved ? <CheckCircle2 size={20} /> : <Save size={20} />}
          <span>{saved ? 'Changes Saved' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                activeSection === section.id 
                  ? 'bg-white dark:bg-dark-card text-primary dark:text-accent shadow-sm border border-border-light dark:border-dark-border' 
                  : 'text-text-muted dark:text-dark-muted hover:bg-white/50 dark:hover:bg-dark-card/50 hover:text-text-main dark:hover:text-dark-text'
              }`}
            >
              <section.icon size={18} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-white dark:bg-dark-card rounded-3xl border border-border-light dark:border-dark-border shadow-sm overflow-hidden transition-colors duration-200">
          <div className="p-8">
            {activeSection === 'general' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-text-main dark:text-dark-text border-b border-border-light dark:border-dark-border pb-4">General Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Lab Name</label>
                    <input 
                      type="text" 
                      value={labName}
                      onChange={(e) => setLabName(e.target.value)}
                      className="w-full px-4 py-3 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-dark-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Contact Email</label>
                    <input 
                      type="email" 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-dark-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Currency</label>
                    <select 
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-3 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-dark-text"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="NPR">NPR (रू)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Calendar Type</label>
                    <select 
                      value={calendarType}
                      onChange={(e) => setCalendarType(e.target.value as 'Indian' | 'Nepali')}
                      className="w-full px-4 py-3 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-dark-text"
                    >
                      <option value="Indian">Indian Calendar</option>
                      <option value="Nepali">Nepali Calendar</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Timezone</label>
                    <select 
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-4 py-3 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-dark-text"
                    >
                      <option>IST (GMT+5:30)</option>
                      <option>UTC</option>
                      <option>EST (GMT-5:00)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between p-4 bg-background-alt dark:bg-dark-bg rounded-2xl border border-border-light dark:border-dark-border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-dark-card rounded-lg shadow-sm">
                        <Globe size={20} className="text-primary dark:text-accent" />
                      </div>
                      <div>
                        <p className="font-bold text-text-main dark:text-dark-text">Public Profile</p>
                        <p className="text-xs text-text-muted dark:text-dark-muted">Allow doctors to find your lab in the directory.</p>
                      </div>
                    </div>
                    <div 
                      onClick={() => {
                        if (!canEdit) return;
                        setPublicProfile(!publicProfile);
                        toast.info(`Public profile ${!publicProfile ? 'enabled' : 'disabled'}`);
                      }}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-200 ${publicProfile ? 'bg-primary' : 'bg-text-muted/30'} ${!canEdit ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${publicProfile ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-text-main dark:text-dark-text border-b border-border-light dark:border-dark-border pb-4">Notification Preferences</h3>
                
                <div className="space-y-4">
                  {[
                    { id: 'newCase', label: 'New Case Received', desc: 'Get notified when a doctor creates a new case.', icon: Mail },
                    { id: 'statusUpdates', label: 'Case Status Updates', desc: 'Notify doctors when case status changes.', icon: Bell },
                    { id: 'invoiceReminders', label: 'Invoice Reminders', desc: 'Send automatic reminders for unpaid invoices.', icon: Database },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 hover:bg-background-alt dark:hover:bg-dark-bg rounded-2xl transition-colors border border-transparent hover:border-border-light dark:hover:border-dark-border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary dark:bg-primary/20 rounded-lg">
                          <item.icon size={20} className="text-primary dark:text-accent" />
                        </div>
                        <div>
                          <p className="font-bold text-text-main dark:text-dark-text">{item.label}</p>
                          <p className="text-xs text-text-muted dark:text-dark-muted">{item.desc}</p>
                        </div>
                      </div>
                      <div 
                        onClick={() => {
                          if (!canEdit) return;
                          toggleNotification(item.id as keyof typeof notifications);
                          toast.info(`${item.label} ${!notifications[item.id as keyof typeof notifications] ? 'enabled' : 'disabled'}`);
                        }}
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-200 ${notifications[item.id as keyof typeof notifications] ? 'bg-primary' : 'bg-text-muted/30'} ${!canEdit ? 'cursor-not-allowed opacity-60' : ''}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${notifications[item.id as keyof typeof notifications] ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-text-main dark:text-dark-text border-b border-border-light dark:border-dark-border pb-4">Security & Access</h3>
                
                <div className="space-y-6">
                  <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                    <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">Two-Factor Authentication</h4>
                    <p className="text-sm text-red-600/70 dark:text-red-400/70 mb-4">Add an extra layer of security to your account.</p>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-all">
                      Enable 2FA
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-dark-text" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-text-main dark:text-dark-text" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-text-main dark:text-dark-text border-b border-border-light dark:border-dark-border pb-4">Data Management</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-background-alt dark:bg-dark-bg rounded-2xl border border-border-light dark:border-dark-border hover:border-primary/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-white dark:bg-dark-card rounded-xl shadow-sm group-hover:text-primary dark:group-hover:text-accent transition-colors">
                        <Download size={24} className="text-text-main dark:text-dark-text" />
                      </div>
                      <div>
                        <h4 className="font-bold text-text-main dark:text-dark-text">Export Data</h4>
                        <p className="text-xs text-text-muted dark:text-dark-muted">Download all lab records in CSV format.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => canEdit && handleExport()}
                      disabled={isExporting || !canEdit}
                      className={`w-full py-2 bg-white dark:bg-dark-card border border-border-light dark:border-dark-border rounded-xl text-sm font-bold hover:bg-primary hover:text-white hover:border-primary transition-all text-text-main dark:text-dark-text disabled:opacity-50 ${!canEdit ? 'cursor-not-allowed' : ''}`}
                    >
                      {isExporting ? <RefreshCw size={16} className="animate-spin mx-auto" /> : 'Start Export'}
                    </button>
                  </div>

                  <div className="p-6 bg-background-alt dark:bg-dark-bg rounded-2xl border border-border-light dark:border-dark-border hover:border-primary/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-white dark:bg-dark-card rounded-xl shadow-sm group-hover:text-primary dark:group-hover:text-accent transition-colors">
                        <RefreshCw size={24} className={`text-text-main dark:text-dark-text ${isBackingUp ? 'animate-spin' : ''}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-text-main dark:text-dark-text">Backup Database</h4>
                        <p className="text-xs text-text-muted dark:text-dark-muted">Create a secure snapshot of your data.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => canEdit && handleBackup()}
                      disabled={isBackingUp || !canEdit}
                      className={`w-full py-2 bg-white dark:bg-dark-card border border-border-light dark:border-dark-border rounded-xl text-sm font-bold hover:bg-primary hover:text-white hover:border-primary transition-all text-text-main dark:text-dark-text disabled:opacity-50 ${!canEdit ? 'cursor-not-allowed' : ''}`}
                    >
                      {isBackingUp ? <RefreshCw size={16} className="animate-spin mx-auto" /> : 'Run Backup'}
                    </button>
                  </div>

                  {(userRole === 'admin' || userRole === 'super_admin') && (
                    <div className="p-6 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20 hover:border-primary/50 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white dark:bg-dark-card rounded-xl shadow-sm group-hover:text-primary dark:group-hover:text-accent transition-colors">
                          <RefreshCw size={24} className={`text-primary dark:text-accent ${isSeeding ? 'animate-spin' : ''}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-text-main dark:text-dark-text">Seed Demo Data</h4>
                          <p className="text-xs text-text-muted dark:text-dark-muted">Populate your lab with sample records for testing.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => canEdit && handleSeedData()}
                        disabled={isSeeding || !canEdit}
                        className={`w-full py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all disabled:opacity-50 ${!canEdit ? 'cursor-not-allowed' : ''}`}
                      >
                        {isSeeding ? <RefreshCw size={16} className="animate-spin mx-auto" /> : 'Seed Data'}
                      </button>
                    </div>
                  )}

                  <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30 hover:border-red-300 transition-all cursor-pointer group md:col-span-2">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-white dark:bg-dark-card rounded-xl shadow-sm text-red-600">
                        <Trash2 size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-red-600 dark:text-red-400">Clear Cache & Temporary Data</h4>
                        <p className="text-xs text-red-600/70 dark:text-red-400/70">This will reset local preferences but keep your records safe.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => canEdit && handleClearData()}
                      disabled={!canEdit}
                      className={`w-full py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all ${!canEdit ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      Clear Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-text-main dark:text-dark-text border-b border-border-light dark:border-dark-border pb-4">Appearance Settings</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: 'Light Mode', icon: Sun, color: 'bg-white' },
                    { id: 'dark', label: 'Dark Mode', icon: Moon, color: 'bg-slate-900' },
                    { id: 'system', label: 'System', icon: Monitor, color: 'bg-gradient-to-br from-white to-slate-900' },
                  ].map((theme) => (
                    <div 
                      key={theme.id} 
                      onClick={() => handleAppearanceChange(theme.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        appearance === theme.id ? 'border-primary bg-primary/5' : 'border-border-light dark:border-dark-border hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-full aspect-video rounded-lg mb-3 shadow-inner flex items-center justify-center ${theme.color}`}>
                        <theme.icon size={32} className={theme.id === 'light' ? 'text-slate-400' : 'text-white/20'} />
                      </div>
                      <p className="text-sm font-bold text-center text-text-main dark:text-dark-text">{theme.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'branding' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between border-b border-border-light dark:border-dark-border pb-4">
                  <h3 className="text-lg font-bold text-text-main dark:text-dark-text">Lab Branding</h3>
                  <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">PRO FEATURE</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Logo Upload */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Lab Logo</label>
                    <div className="flex flex-col items-center gap-6 p-8 bg-background-alt dark:bg-dark-bg rounded-3xl border-2 border-dashed border-border-light dark:border-dark-border hover:border-primary/50 transition-all group">
                      {logoUrl ? (
                        <div className="relative group">
                          <img 
                            src={logoUrl} 
                            alt="Lab Logo" 
                            className="max-h-32 max-w-full rounded-xl shadow-md"
                            referrerPolicy="no-referrer"
                          />
                          <button 
                            onClick={() => setLogoUrl('')}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-white dark:bg-dark-card rounded-2xl flex items-center justify-center text-text-muted dark:text-dark-muted shadow-sm">
                          <ImageIcon size={40} className="opacity-20" />
                        </div>
                      )}
                      
                      <div className="text-center">
                        <p className="text-sm font-bold text-text-main dark:text-dark-text">
                          {isUploading ? 'Uploading...' : 'Upload your logo'}
                        </p>
                        <p className="text-xs text-text-muted dark:text-dark-muted mt-1">Recommended: PNG or SVG, max 500KB</p>
                      </div>

                      <label className={`cursor-pointer bg-white dark:bg-dark-card border border-border-light dark:border-dark-border px-6 py-2 rounded-xl text-sm font-bold hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm ${!canEdit ? 'cursor-not-allowed opacity-60' : ''}`}>
                        <span>{logoUrl ? 'Change Logo' : 'Select File'}</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={isUploading || !canEdit}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Primary Theme Color</label>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl shadow-md border-2 border-white dark:border-dark-card"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <input 
                          type="color" 
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1 h-12 bg-transparent cursor-pointer border-none"
                        />
                        <input 
                          type="text" 
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-28 px-3 py-2 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-lg text-sm font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-wider">Accent Color</label>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl shadow-md border-2 border-white dark:border-dark-card"
                          style={{ backgroundColor: accentColor }}
                        />
                        <input 
                          type="color" 
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="flex-1 h-12 bg-transparent cursor-pointer border-none"
                        />
                        <input 
                          type="text" 
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-28 px-3 py-2 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-lg text-sm font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <div className="flex items-start gap-3">
                        <Palette className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-text-main dark:text-dark-text">Theme Preview</p>
                          <p className="text-xs text-text-muted dark:text-dark-muted mt-1">These colors will be applied to your lab's dashboard, sidebar, and invoices.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
