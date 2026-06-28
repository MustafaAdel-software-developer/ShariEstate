import { Body, Controller, Get, Post, Delete, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { scheduleTourSchema, savedSearchSchema } from '@real-estate/shared';
import { ToursService, SavedSearchesService } from './tours.service';
import { Public } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('tours')
@Controller('tours')
export class ToursController {
  constructor(private toursService: ToursService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  create(
    @Body(new ZodValidationPipe(scheduleTourSchema)) body: unknown,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.toursService.create(body as Parameters<ToursService['create']>[0], userId);
  }

  @Get('my-requests')
  myRequests(@CurrentUser('sub') userId: string) {
    return this.toursService.getForBuyer(userId);
  }

  @Get('mine')
  mine(@CurrentUser('sub') userId: string) {
    return this.toursService.getForAgent(userId);
  }
}

@ApiTags('saved-searches')
@Controller('saved-searches')
export class SavedSearchesController {
  constructor(private savedSearchesService: SavedSearchesService) {}

  @Get()
  list(@CurrentUser('sub') userId: string) {
    return this.savedSearchesService.list(userId);
  }

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body(new ZodValidationPipe(savedSearchSchema)) body: unknown,
  ) {
    return this.savedSearchesService.create(userId, body as Parameters<SavedSearchesService['create']>[1]);
  }

  @Delete(':id')
  remove(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.savedSearchesService.remove(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() body: { name?: string; emailAlerts?: boolean },
  ) {
    return this.savedSearchesService.update(userId, id, body);
  }
}
