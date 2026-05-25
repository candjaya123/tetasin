import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { IndustryService } from '../services/industry.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';
import { RequireTier } from '../../../core/auth/tier.decorator';
import { SubscriptionTier } from '../../../core/constants/subscription-tier.enum';
import type { AuthenticatedRequest } from '../../../core/auth/authenticated-request.interface';

@Controller('api/v1/industry')
@UseGuards(JwtAuthGuard)
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}

  @Get('profile')
  @RequireTier(SubscriptionTier.FREE)
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.industryService.getProfile(req.user.tenant_id);
  }

  @Post('profile')
  @RequireTier(SubscriptionTier.PRO)
  async upsertProfile(
    @Request() req: AuthenticatedRequest,
    @Body() body: { industry: string; features_config?: Record<string, boolean>; ui_config?: Record<string, any> },
  ) {
    return this.industryService.upsertProfile(req.user.tenant_id, body);
  }

  @Get('feature/:name')
  @RequireTier(SubscriptionTier.FREE)
  async checkFeature(@Request() req: AuthenticatedRequest, featureName: string) {
    const enabled = await this.industryService.isFeatureEnabled(req.user.tenant_id, featureName);
    return { feature: featureName, enabled };
  }
}
