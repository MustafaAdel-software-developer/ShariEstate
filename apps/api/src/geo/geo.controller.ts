import { Body, Controller, Get, Param, Post, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { createStateSchema, createCitySchema } from '@real-estate/shared';
import { GeoService } from './geo.service';
import { Public } from '../common/decorators/roles.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('geo')
@Controller('geo')
export class GeoController {
  constructor(private geoService: GeoService) {}

  @Public()
  @Get('states')
  getStates() {
    return this.geoService.getStates(true);
  }

  @Public()
  @Get('states/all')
  @Roles(UserRole.admin)
  getAllStates() {
    return this.geoService.getStates(false);
  }

  @Public()
  @Get('states/:slug')
  getState(@Param('slug') slug: string) {
    return this.geoService.getStateBySlug(slug);
  }

  @Public()
  @Get('states/:slug/cities')
  getCities(@Param('slug') slug: string) {
    return this.geoService.getCitiesByStateSlug(slug);
  }

  @Public()
  @Get('states/:stateSlug/cities/:citySlug')
  getCity(@Param('stateSlug') stateSlug: string, @Param('citySlug') citySlug: string) {
    return this.geoService.getCityBySlug(stateSlug, citySlug);
  }

  @Public()
  @Get('states/:stateSlug/cities/:citySlug/neighborhoods')
  getNeighborhoods(@Param('stateSlug') stateSlug: string, @Param('citySlug') citySlug: string) {
    return this.geoService.getNeighborhoodsByCity(stateSlug, citySlug);
  }

  @Public()
  @Get('states/:stateSlug/cities/:citySlug/neighborhoods/:neighborhoodSlug')
  getNeighborhood(
    @Param('stateSlug') stateSlug: string,
    @Param('citySlug') citySlug: string,
    @Param('neighborhoodSlug') neighborhoodSlug: string,
  ) {
    return this.geoService.getNeighborhoodBySlug(stateSlug, citySlug, neighborhoodSlug);
  }

  @Post('states')
  @Roles(UserRole.admin)
  createState(@Body(new ZodValidationPipe(createStateSchema)) body: unknown) {
    return this.geoService.createState(body as Parameters<GeoService['createState']>[0]);
  }

  @Post('cities')
  @Roles(UserRole.admin)
  createCity(@Body(new ZodValidationPipe(createCitySchema)) body: unknown) {
    return this.geoService.createCity(body as Parameters<GeoService['createCity']>[0]);
  }

  @Patch('states/:id')
  @Roles(UserRole.admin)
  updateState(@Param('id') id: string, @Body() body: Partial<{ enabled: boolean; heroTitle: string }>) {
    return this.geoService.updateState(id, body);
  }
}
