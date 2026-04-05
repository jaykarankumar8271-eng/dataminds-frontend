import React from 'react';
import { Tenant } from '../services/firestoreService';
import { CreditCard, CheckCircle2, Calendar, Shield, Zap, Package } from 'lucide-react';
import { format } from 'date-fns';

interface SubscriptionProps {
  tenant: Tenant | null;
}

const Subscription: React.FC<SubscriptionProps> = ({ tenant }) => {
  if (!tenant) return null;

  const planFeatures = {
    Basic: ['Up to 500 cases/month', 'Basic reporting', 'Single user access', 'Email support'],
    Pro: ['Up to 2000 cases/month', 'Advanced analytics', 'Multi-user access', 'Priority support', 'Inventory management'],
    Enterprise: ['Unlimited cases', 'Custom reporting', 'Dedicated account manager', '24/7 support', 'API access']
  };

  const currentFeatures = planFeatures[tenant.plan] || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-main dark:text-dark-text">Subscription Plan</h1>
          <p className="text-text-muted dark:text-dark-muted mt-1">Manage your lab's active subscription and billing details.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full border border-green-200 dark:border-green-800 font-bold text-sm">
          <Shield size={16} />
          <span>{tenant.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Current Plan Card */}
          <div className="bg-white dark:bg-dark-card rounded-3xl border border-border-light dark:border-dark-border shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-light p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-primary-light/80 font-bold uppercase tracking-widest text-xs mb-2">Current Plan</p>
                  <h2 className="text-4xl font-black">{tenant.plan}</h2>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                  <Zap size={32} className="text-white" />
                </div>
              </div>
              
              <div className="mt-8 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary-light/80" />
                  <span className="text-sm font-medium">
                    Expires: {tenant.planExpiry?.toDate ? format(tenant.planExpiry.toDate(), 'MMM dd, yyyy') : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-primary-light/80" />
                  <span className="text-sm font-medium">
                    Status: {tenant.paymentStatus || 'Paid'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <h3 className="text-lg font-bold text-text-main dark:text-dark-text mb-6">Plan Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-text-main dark:text-dark-text text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Billing Info */}
          <div className="bg-white dark:bg-dark-card rounded-3xl border border-border-light dark:border-dark-border p-8 shadow-sm">
            <h3 className="text-lg font-bold text-text-main dark:text-dark-text mb-6 flex items-center gap-2">
              <Package size={20} className="text-primary" />
              Billing Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-widest mb-2">Lab Name</p>
                <p className="text-text-main dark:text-dark-text font-bold">{tenant.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-widest mb-2">Subscription ID</p>
                <p className="text-text-main dark:text-dark-text font-mono text-sm">{tenant.razorpaySubscriptionId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-widest mb-2">Registration No</p>
                <p className="text-text-main dark:text-dark-text font-medium">{tenant.registrationNo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted dark:text-dark-muted uppercase tracking-widest mb-2">PAN Number</p>
                <p className="text-text-main dark:text-dark-text font-medium">{tenant.panNo || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-primary/5 dark:bg-accent/5 rounded-3xl border border-primary/10 dark:border-accent/10 p-6">
            <h3 className="text-lg font-bold text-primary dark:text-accent mb-4">Need to Upgrade?</h3>
            <p className="text-sm text-text-muted dark:text-dark-muted mb-6 leading-relaxed">
              Looking for more features or higher limits? Contact our support team to upgrade your plan.
            </p>
            <button className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-primary/20">
              Contact Support
            </button>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-3xl border border-border-light dark:border-dark-border p-6">
            <h3 className="text-lg font-bold text-text-main dark:text-dark-text mb-4">Payment Methods</h3>
            <div className="flex items-center justify-between p-4 bg-background-alt dark:bg-dark-bg rounded-2xl border border-border-light dark:border-dark-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white dark:bg-dark-card rounded-xl flex items-center justify-center border border-border-light dark:border-dark-border">
                  <CreditCard size={20} className="text-text-muted dark:text-dark-muted" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-main dark:text-dark-text">Razorpay</p>
                  <p className="text-xs text-text-muted dark:text-dark-muted">Default Method</p>
                </div>
              </div>
              <CheckCircle2 size={18} className="text-green-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
