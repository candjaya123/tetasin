import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { OnboardingService } from '../services/onboarding.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/onboarding')
@UseGuards(JwtAuthGuard)
@RequireTier(SubscriptionTier.FREE)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('setup')
  async setup(@Body() body: { industry: string; scale: string; complexity: string }, @Request() req: AuthenticatedRequest) {
    // Assuming auth middleware attaches user/tenant information to the request
    // In this simplified version, we might need to get tenantId from somewhere
    // For now, let's assume we have a tenantId available (e.g. from a header or test body)
    const tenantId = req.user?.tenant_id || (body as any).tenant_id; 
    
    if (!tenantId) {
      throw new Error('Tenant ID is required for onboarding setup');
    }

    return this.onboardingService.setupSystem(tenantId, body, req.user);
  }
}
