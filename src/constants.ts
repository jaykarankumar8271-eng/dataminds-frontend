export const PLAN_LIMITS = {
  Basic: {
    doctors: 2,
    casesPerMonth: 50,
    features: ['Dashboard', 'Basic Reports', 'Email Support'],
  },
  Pro: {
    doctors: 10,
    casesPerMonth: 500,
    features: ['Dashboard', 'Advanced Reports', 'Priority Support', 'Custom Branding'],
  },
  Enterprise: {
    doctors: Infinity,
    casesPerMonth: Infinity,
    features: ['All Features', 'Dedicated Support', 'API Access', 'White Labeling'],
  },
};

export type PlanType = keyof typeof PLAN_LIMITS;
