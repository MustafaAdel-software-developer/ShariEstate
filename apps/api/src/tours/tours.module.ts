import { Module } from '@nestjs/common';
import { ToursService, SavedSearchesService } from './tours.service';
import { ToursController, SavedSearchesController } from './tours.controller';

@Module({
  controllers: [ToursController, SavedSearchesController],
  providers: [ToursService, SavedSearchesService],
})
export class ToursModule {}
