import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { GeoModule } from '../geo/geo.module';

@Module({
  imports: [GeoModule],
  controllers: [AdminController],
})
export class AdminModule {}
