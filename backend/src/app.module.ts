import { MiddlewareConsumer, Module, Global, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { SupabaseStrategy } from './core/auth/supabase.strategy';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { SupabaseService } from './shared/supabase.service';
import { RoleGuard } from './core/auth/role.guard';
import { AccountTypeGuard } from './core/auth/account-type.guard';
import { JwtAuthGuard } from './modules/business-profile/guards/jwt-auth.guard';
import { SalesModule } from './modules/sales/sales.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { BusinessProfileModule } from './modules/business-profile/business-profile.module';
import { BullModule } from '@nestjs/bullmq';
import { AiModule } from './modules/ai/ai.module';
import { ReportModule } from './modules/report/report.module';
import { IdempotencyMiddleware } from './core/middlewares/idempotency.middleware';
import { CqrsModule } from '@nestjs/cqrs';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { OrderModule } from './modules/order/order.module';
import { PromoModule } from './modules/promo/promo.module';
import { InsightModule } from './modules/insight/insight.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CoreModule } from './core/core.module';
import { ReceiptModule } from './modules/receipt/receipt.module';
import { ErpModule } from './modules/erp/erp.module';
import { RecoveryModule } from './modules/recovery/recovery.module';
import { IndustryModule } from './modules/industry/industry.module';
import { PersonalFinanceModule } from './modules/personal-finance/personal-finance.module';
import { BillTrackerModule } from './modules/bill-tracker/bill-tracker.module';
import { TransactionsModule } from './modules/transactions/transactions.module';


import { LoggerModule } from 'nestjs-pino';
import { TraceIdMiddleware } from './core/middlewares/trace.middleware';
import { ResponseEnvelopeInterceptor } from './core/interceptors/response-envelope.interceptor';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: (req) => ({
          traceId: (req as any)['traceId'],
        }),
        transport: process.env.NODE_ENV !== 'production' 
          ? { target: 'pino-pretty' } 
          : undefined,
      },
    }),
    BullModule.forRoot({
      connection: process.env.USE_MOCK_REDIS === 'true' 
        ? new (require('ioredis-mock'))() 
        : {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379') || 6379,
          },
    }),
    CqrsModule,
    SalesModule,
    AccountingModule,
    BusinessProfileModule,
    ReportModule,
    AiModule,
    OnboardingModule,
    WarehouseModule,
    OrderModule,
    PromoModule,
    InsightModule,
    ProcurementModule,
    InventoryModule,
    ReceiptModule,
    ErpModule,
    RecoveryModule,
    IndustryModule,
    PersonalFinanceModule,
    BillTrackerModule,
    TransactionsModule,
    CoreModule,

    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SupabaseStrategy,
    SupabaseService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AccountTypeGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseEnvelopeInterceptor,
    },
  ],
  exports: [SupabaseService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TraceIdMiddleware)
      .forRoutes('*');
    
    consumer
      .apply(IdempotencyMiddleware)
      .forRoutes('api/v1/sales', 'api/v1/accounting/journal-entries');
  }
}
