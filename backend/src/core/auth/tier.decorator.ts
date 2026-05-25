import { SetMetadata } from '@nestjs/common';
import { SubscriptionTier } from '../constants/subscription-tier.enum';

export const TIER_KEY = 'requiredTier';
export const RequireTier = (tier: SubscriptionTier) => SetMetadata(TIER_KEY, tier);
