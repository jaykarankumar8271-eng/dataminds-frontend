import React, { useState, useEffect } from 'react';
import { 
  Tenant, 
  getTenant, 
  updateTenant 
} from '../services/firestoreService';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ShieldCheck, 
  Crown,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface BillingProps {
  tenantId: string;
  userRole: string;
}

const PLANS = [
  {
    id: 'Basic',
    name: 'Basic',
    price: 2999,
    description: 'Perfect for small labs starting out',
    features: ['Up to 50 cases/month', 'Basic reporting', 'Email support', 'Lab Admin account'],
    icon: Zap,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    id: 'Pro',
    name: 'Pro',
    price: 7999,
    description: 'Best for growing labs with multiple doctors',
    features: ['Unlimited cases', 'Advanced analytics', 'Priority support', 'Doctor portal'],
    icon: ShieldCheck,
    color: 'text-primary',
    bg: 'bg-primary/10',
    popular: true
  },
  {
    id: 'Enterprise',
    name: 'Enterprise',
    price: 19999,
    description: 'For large-scale lab operations',
    features: ['Custom workflows', 'Dedicated account manager', 'API access', 'White-labeling'],
    icon: Crown,
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  }
];

const SERVICES = [
  { name: 'Cases Management', basic: true, pro: true, enterprise: true },
  { name: 'Doctors (Clients) Management', basic: true, pro: true, enterprise: true },
  { name: 'Invoices', basic: true, pro: true, enterprise: true },
  { name: 'Expenses Tracking', basic: false, pro: true, enterprise: true },
  { name: 'Advanced Analytics', basic: false, pro: true, enterprise: true },
  { name: 'Doctor Portal', basic: false, pro: true, enterprise: true },
  { name: 'Custom Workflows', basic: false, pro: false, enterprise: true },
  { name: 'White-labeling', basic: false, pro: false, enterprise: true },
  { name: 'API Access', basic: false, pro: false, enterprise: true },
];

const Billing: React.FC<BillingProps> = ({ tenantId, userRole }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const data = await getTenant(tenantId);
        setTenant(data);
      } catch (error) {
        console.error('Error fetching tenant:', error);
        toast.error('Failed to load billing information');
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchTenantData();
    }
  }, [tenantId]);

  const handlePayment = async (plan: typeof PLANS[0]) => {
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      toast.error('Only administrators can manage subscriptions');
      return;
    }

    setProcessing(plan.id);

    try {
      // 1. Create order on server
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.price,
          currency: 'INR',
          receipt: `receipt_${tenantId}_${Date.now()}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to create order');
      }
      const order = await response.json();

      // 2. Initialize Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order.amount,
        currency: order.currency,
        name: 'DentalLab Pro',
        description: `${plan.name} Plan Subscription`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // 3. Verify payment on server
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.status === 'success') {
              // 4. Update Firestore
              const expiryDate = new Date();
              expiryDate.setMonth(expiryDate.getMonth() + 1);

              await updateTenant(tenantId, {
                plan: plan.id as any,
                status: 'Active',
                paymentStatus: 'Paid',
                planExpiry: expiryDate
              });

              toast.success(`Successfully subscribed to ${plan.name} plan!`);
              // Refresh tenant data
              const updatedTenant = await getTenant(tenantId);
              setTenant(updatedTenant);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.error('Verification error:', error);
            toast.error('Error verifying payment');
          }
        },
        prefill: {
          name: tenant?.name || '',
          email: tenant?.ownerEmail || '',
        },
        theme: {
          color: '#F27D26'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-text-main tracking-tight">Subscription & Invoicing</h1>
        <p className="text-text-muted mt-1">Manage your lab's plan and invoicing details</p>
      </div>

      {/* Current Plan Status */}
      <div className="bg-white rounded-[2.5rem] border border-border-light p-8 mb-12 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Current Plan</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-md uppercase">
                  {tenant?.status || 'Active'}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-text-main">{tenant?.plan || 'Basic'} Plan</h2>
              <p className="text-sm text-text-muted">
                {tenant?.planExpiry 
                  ? `Next billing date: ${new Date(tenant.planExpiry.toDate ? tenant.planExpiry.toDate() : tenant.planExpiry).toLocaleDateString()}`
                  : 'Trial period active'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-text-main">Payment Status</p>
              <p className={`text-xs font-medium ${tenant?.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                {tenant?.paymentStatus || 'Pending'}
              </p>
            </div>
            <button className="px-6 py-3 bg-background-alt hover:bg-border-light text-text-main font-bold rounded-2xl transition-all">
              View Invoices
            </button>
          </div>
        </div>
      </div>

      {/* Plans Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <motion.div 
            key={plan.id}
            whileHover={{ y: -5 }}
            className={`relative bg-white rounded-[2.5rem] border ${
              plan.popular ? 'border-primary shadow-xl shadow-primary/5' : 'border-border-light shadow-sm'
            } p-8 flex flex-col`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                Most Popular
              </div>
            )}

            <div className={`w-12 h-12 ${plan.bg} ${plan.color} rounded-2xl flex items-center justify-center mb-6`}>
              <plan.icon className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-text-main mb-2">{plan.name}</h3>
            <p className="text-sm text-text-muted mb-6 h-10">{plan.description}</p>

            <div className="mb-8">
              <span className="text-4xl font-bold text-text-main">₹{plan.price.toLocaleString()}</span>
              <span className="text-text-muted font-medium">/month</span>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-text-main leading-tight">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handlePayment(plan)}
              disabled={processing !== null || tenant?.plan === plan.id}
              className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                tenant?.plan === plan.id
                  ? 'bg-green-50 text-green-600 cursor-default'
                  : plan.popular
                    ? 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20'
                    : 'bg-background-alt hover:bg-border-light text-text-main'
              }`}
            >
              {processing === plan.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : tenant?.plan === plan.id ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Current Plan
                </>
              ) : (
                <>
                  Upgrade to {plan.name}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Plan Comparison Grid */}
      <div className="mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-main">Compare Plans</h2>
          <p className="text-text-muted mt-2">Choose the best plan for your lab's needs</p>
        </div>
        
        <div className="bg-white rounded-[2.5rem] border border-border-light shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background-alt/50">
                <th className="px-8 py-6 text-sm font-bold text-text-main uppercase tracking-wider">Service / Feature</th>
                <th className="px-8 py-6 text-sm font-bold text-text-main text-center uppercase tracking-wider">Basic</th>
                <th className="px-8 py-6 text-sm font-bold text-primary text-center uppercase tracking-wider">Pro</th>
                <th className="px-8 py-6 text-sm font-bold text-purple-600 text-center uppercase tracking-wider">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {SERVICES.map((service, idx) => (
                <tr key={idx} className="hover:bg-background-alt/30 transition-colors">
                  <td className="px-8 py-5 text-sm font-medium text-text-main">{service.name}</td>
                  <td className="px-8 py-5 text-center">
                    {service.basic ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <div className="w-5 h-5 bg-gray-100 rounded-full mx-auto" />
                    )}
                  </td>
                  <td className="px-8 py-5 text-center bg-primary/5">
                    {service.pro ? (
                      <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
                    ) : (
                      <div className="w-5 h-5 bg-gray-100 rounded-full mx-auto" />
                    )}
                  </td>
                  <td className="px-8 py-5 text-center">
                    {service.enterprise ? (
                      <CheckCircle2 className="w-5 h-5 text-purple-500 mx-auto" />
                    ) : (
                      <div className="w-5 h-5 bg-gray-100 rounded-full mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Badge */}
      <div className="mt-16 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2 text-text-muted mb-2">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-sm font-medium">Secure 256-bit SSL Encrypted Payments</span>
        </div>
        <p className="text-xs text-text-muted max-w-md">
          Payments are processed securely via Razorpay. We do not store your card details on our servers.
        </p>
      </div>
    </div>
  );
};

export default Billing;
