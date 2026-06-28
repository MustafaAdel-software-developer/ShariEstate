import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { SavedSearchAlertsService } from './saved-search-alerts.service';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(UserRole.admin)
@Controller('admin/jobs')
export class JobsController {
  constructor(private alertsService: SavedSearchAlertsService) {}

  @Post('saved-search-alerts')
  runSavedSearchAlerts() {
    return this.alertsService.processAlerts();
  }
}
