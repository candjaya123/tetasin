import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { OnboardingService } from '../onboarding.service';
import { JwtAuthGuard } from '../../business-profile/guards/jwt-auth.guard';

@Controller('api/v1/onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('setup')
  async setup(@Body() body: { industry: string; scale: string; complexity: string }, @Request() req: any) {
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
