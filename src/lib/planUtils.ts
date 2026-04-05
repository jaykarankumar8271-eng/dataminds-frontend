import { PLAN_LIMITS, PlanType } from '../constants';
import { collection, query, where, getDocs, count } from 'firebase/firestore';
import { db } from '../firebase';

export interface PlanStatus {
  isLimited: boolean;
  limit: number;
  current: number;
  message?: string;
}

export const checkPlanLimit = async (
  tenantId: string,
  plan: PlanType,
  resource: 'doctors' | 'cases'
): Promise<PlanStatus> => {
  const limits = PLAN_LIMITS[plan];
  let currentCount = 0;

  try {
    if (resource === 'doctors') {
      const q = query(collection(db, 'doctors'), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      currentCount = snapshot.size;
      
      return {
        isLimited: currentCount >= limits.doctors,
        limit: limits.doctors,
        current: currentCount,
        message: currentCount >= limits.doctors ? `You have reached the limit of ${limits.doctors} doctors for your ${plan} plan.` : undefined
      };
    }

    if (resource === 'cases') {
      // For cases, we usually check per month. 
      // Let's get cases created in the current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const q = query(
        collection(db, 'cases'), 
        where('tenantId', '==', tenantId),
        where('createdAt', '>=', startOfMonth)
      );
      const snapshot = await getDocs(q);
      currentCount = snapshot.size;

      return {
        isLimited: currentCount >= limits.casesPerMonth,
        limit: limits.casesPerMonth,
        current: currentCount,
        message: currentCount >= limits.casesPerMonth ? `You have reached the monthly limit of ${limits.casesPerMonth} cases for your ${plan} plan.` : undefined
      };
    }
  } catch (error) {
    console.error('Error checking plan limits:', error);
  }

  return { isLimited: false, limit: Infinity, current: 0 };
};

export const getPlanStatus = async (
  tenantId: string,
  plan: PlanType,
  resource: 'doctors' | 'cases'
): Promise<PlanStatus & { percentage: number }> => {
  const status = await checkPlanLimit(tenantId, plan, resource);
  const percentage = status.limit === Infinity ? 0 : (status.current / status.limit) * 100;
  return { ...status, percentage };
};
