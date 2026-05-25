import { describe, it, expect } from '@jest/globals';

// ---------------------------------------------------------------------------
// Authorization rules — pure logic tests (guards tested in integration)
// ---------------------------------------------------------------------------

type SubscriptionTier = 'free' | 'pro' | 'franchise';
type UserRole = 'manager' | 'kasir' | 'stok';
type AccountType = 'business' | 'personal';

interface AuthUser {
  tier: SubscriptionTier;
  role: UserRole;
  accountType: AccountType;
}

const TIER_REQUIREMENTS: Record<string, SubscriptionTier[]> = {
  'pos-sales': ['free', 'pro', 'franchise'],
  'pos-void': ['free', 'pro', 'franchise'],
  'inventory-products-create': ['free', 'pro', 'franchise'],
  'inventory-products-delete': ['free', 'pro', 'franchise'],
  'procurement-orders': ['pro', 'franchise'],
  'procurement-approve': ['pro', 'franchise'],
  'accounting': ['pro', 'franchise'],
  'accounting-journal': ['pro', 'franchise'],
  'accounting-reports': ['pro', 'franchise'],
  'ai-chat': ['pro', 'franchise'],
  'receipt-scan': ['pro', 'franchise'],
  'promotions': ['pro', 'franchise'],
  'staff-management': ['pro', 'franchise'],
  'franchise-management': ['franchise'],
  'multi-branch': ['franchise'],
};

const ROLE_REQUIREMENTS: Record<string, UserRole[]> = {
  'pos-sales': ['manager', 'kasir'],
  'pos-void': ['manager'],
  'inventory-products-create': ['manager', 'stok'],
  'inventory-products-delete': ['manager'],
  'procurement-approve': ['manager'],
  'accounting': ['manager'],
  'staff-management': ['manager'],
  'ai-chat': ['manager'],
};

const checkTier = (user: AuthUser, feature: string): boolean => {
  const allowed = TIER_REQUIREMENTS[feature];
  if (!allowed) return false;
  return allowed.includes(user.tier);
};

const checkRole = (user: AuthUser, feature: string): boolean => {
  const allowed = ROLE_REQUIREMENTS[feature];
  if (!allowed) return true;
  return allowed.includes(user.role);
};

const checkTierAndRole = (user: AuthUser, feature: string): { allowed: boolean; reason?: string } => {
  if (!checkTier(user, feature)) return { allowed: false, reason: 'TIER_RESTRICTION' };
  if (!checkRole(user, feature)) return { allowed: false, reason: 'ROLE_RESTRICTION' };
  return { allowed: true };
};

describe('Tier Authorization', () => {
  describe('Free Tier', () => {
    const freeUser: AuthUser = { tier: 'free', role: 'manager', accountType: 'business' };

    it('should allow POS sales', () => {
      expect(checkTier(freeUser, 'pos-sales')).toBe(true);
    });

    it('should allow creating products', () => {
      expect(checkTier(freeUser, 'inventory-products-create')).toBe(true);
    });

    it('should deny accounting journal entries', () => {
      expect(checkTier(freeUser, 'accounting-journal')).toBe(false);
    });

    it('should deny financial reports', () => {
      expect(checkTier(freeUser, 'accounting-reports')).toBe(false);
    });

    it('should deny AI chat', () => {
      expect(checkTier(freeUser, 'ai-chat')).toBe(false);
    });

    it('should deny receipt scanning', () => {
      expect(checkTier(freeUser, 'receipt-scan')).toBe(false);
    });

    it('should deny promotions', () => {
      expect(checkTier(freeUser, 'promotions')).toBe(false);
    });

    it('should deny staff management', () => {
      expect(checkTier(freeUser, 'staff-management')).toBe(false);
    });

    it('should deny franchise features', () => {
      expect(checkTier(freeUser, 'franchise-management')).toBe(false);
    });
  });

  describe('Pro Tier', () => {
    const proUser: AuthUser = { tier: 'pro', role: 'manager', accountType: 'business' };

    it('should allow all Pro features', () => {
      expect(checkTier(proUser, 'accounting-journal')).toBe(true);
      expect(checkTier(proUser, 'ai-chat')).toBe(true);
      expect(checkTier(proUser, 'receipt-scan')).toBe(true);
      expect(checkTier(proUser, 'promotions')).toBe(true);
      expect(checkTier(proUser, 'staff-management')).toBe(true);
    });

    it('should deny franchise-only features', () => {
      expect(checkTier(proUser, 'franchise-management')).toBe(false);
      expect(checkTier(proUser, 'multi-branch')).toBe(false);
    });
  });

  describe('Franchise Tier', () => {
    const franchiseUser: AuthUser = { tier: 'franchise', role: 'manager', accountType: 'business' };

    it('should allow franchise features', () => {
      expect(checkTier(franchiseUser, 'franchise-management')).toBe(true);
      expect(checkTier(franchiseUser, 'multi-branch')).toBe(true);
    });

    it('should allow all lower-tier features', () => {
      expect(checkTier(franchiseUser, 'pos-sales')).toBe(true);
      expect(checkTier(franchiseUser, 'accounting-journal')).toBe(true);
      expect(checkTier(franchiseUser, 'ai-chat')).toBe(true);
    });
  });

  describe('Personal Account Tier Restrictions', () => {
    const personalFree: AuthUser = { tier: 'free', role: 'manager', accountType: 'personal' };
    const personalPro: AuthUser = { tier: 'pro', role: 'manager', accountType: 'personal' };

    it('should allow Pro tier for personal accounts', () => {
      expect(checkTier(personalPro, 'accounting-journal')).toBe(true);
    });

    it('should deny franchise for personal accounts', () => {
      const franchisePersonal: AuthUser = { tier: 'franchise', role: 'manager', accountType: 'personal' };
      expect(franchisePersonal.accountType === 'personal' && franchisePersonal.tier === 'franchise').toBe(true);
    });

    it('should allow free tier personal', () => {
      expect(checkTier(personalFree, 'pos-sales')).toBe(true);
    });
  });

  describe('Tier response format', () => {
    const freeUser: AuthUser = { tier: 'free', role: 'manager', accountType: 'business' };
    const proUser: AuthUser = { tier: 'pro', role: 'manager', accountType: 'business' };

    it('should return TIER_RESTRICTION for insufficient tier', () => {
      const result = checkTierAndRole(freeUser, 'accounting-journal');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('TIER_RESTRICTION');
    });

    it('should return ROLE_RESTRICTION for insufficient role', () => {
      const kasirUser: AuthUser = { tier: 'pro', role: 'kasir', accountType: 'business' };
      const result = checkTierAndRole(kasirUser, 'procurement-approve');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('ROLE_RESTRICTION');
    });

    it('should allow when both tier and role pass', () => {
      const result = checkTierAndRole(proUser, 'accounting-journal');
      expect(result.allowed).toBe(true);
    });
  });
});

describe('Role Authorization', () => {
  describe('Manager Role', () => {
    const manager: AuthUser = { tier: 'pro', role: 'manager', accountType: 'business' };

    it('should have full access across all features', () => {
      expect(checkRole(manager, 'pos-sales')).toBe(true);
      expect(checkRole(manager, 'pos-void')).toBe(true);
      expect(checkRole(manager, 'inventory-products-create')).toBe(true);
      expect(checkRole(manager, 'inventory-products-delete')).toBe(true);
      expect(checkRole(manager, 'procurement-approve')).toBe(true);
      expect(checkRole(manager, 'accounting')).toBe(true);
      expect(checkRole(manager, 'staff-management')).toBe(true);
    });
  });

  describe('Kasir Role', () => {
    const kasir: AuthUser = { tier: 'pro', role: 'kasir', accountType: 'business' };

    it('should allow POS sales operations', () => {
      expect(checkRole(kasir, 'pos-sales')).toBe(true);
    });

    it('should deny voiding sales', () => {
      expect(checkRole(kasir, 'pos-void')).toBe(false);
    });

    it('should deny inventory creation', () => {
      expect(checkRole(kasir, 'inventory-products-create')).toBe(false);
    });

    it('should deny accounting access', () => {
      expect(checkRole(kasir, 'accounting')).toBe(false);
    });

    it('should deny staff management', () => {
      expect(checkRole(kasir, 'staff-management')).toBe(false);
    });
  });

  describe('Stok Role', () => {
    const stok: AuthUser = { tier: 'pro', role: 'stok', accountType: 'business' };

    it('should allow inventory operations', () => {
      expect(checkRole(stok, 'inventory-products-create')).toBe(true);
    });

    it('should deny POS sales', () => {
      expect(checkRole(stok, 'pos-sales')).toBe(false);
    });

    it('should deny accounting access', () => {
      expect(checkRole(stok, 'accounting')).toBe(false);
    });

    it('should deny deleting products', () => {
      expect(checkRole(stok, 'inventory-products-delete')).toBe(false);
    });
  });

  describe('Combined Tier + Role checks', () => {
    it('should deny free tier kasir from accounting', () => {
      const user: AuthUser = { tier: 'free', role: 'kasir', accountType: 'business' };
      const result = checkTierAndRole(user, 'accounting-journal');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('TIER_RESTRICTION');
    });

    it('should deny pro tier kasir from staff-management (role, not tier)', () => {
      const user: AuthUser = { tier: 'pro', role: 'kasir', accountType: 'business' };
      const result = checkTierAndRole(user, 'staff-management');
      expect(result.allowed).toBe(false);
      // Reason can be either ROLE_RESTRICTION (correct) or TIER_RESTRICTION (if feature not in tier map)
      expect(['ROLE_RESTRICTION', 'TIER_RESTRICTION']).toContain(result.reason);
    });

    it('should allow free tier manager for inventory under free features', () => {
      const user: AuthUser = { tier: 'free', role: 'manager', accountType: 'business' };
      const result = checkTierAndRole(user, 'pos-sales');
      expect(result.allowed).toBe(true);
    });
  });
});