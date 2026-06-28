import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ListingsModule } from '../listings/listings.module';
import { EmailModule } from '../email/email.module';
import { SavedSearchAlertsService } from './saved-search-alerts.service';
import { JobsController } from './jobs.controller';

@Module({
  imports: [ScheduleModule.forRoot(), ListingsModule, EmailModule],
  controllers: [JobsController],
  providers: [SavedSearchAlertsService],
})
export class JobsModule {}
