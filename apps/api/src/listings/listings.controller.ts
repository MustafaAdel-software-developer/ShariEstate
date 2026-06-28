import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  createListingSchema,
  updateListingSchema,
  listingSearchSchema,
} from '@real-estate/shared';
import { ListingsService } from './listings.service';
import { Public } from '../common/decorators/roles.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(private listingsService: ListingsService) {}

  @Public()
  @Get('search')
  search(@Query(new ZodValidationPipe(listingSearchSchema)) query: unknown) {
    return this.listingsService.search(query as Parameters<ListingsService['search']>[0]);
  }

  @Public()
  @Get('featured')
  featured(@Query('state') state?: string) {
    return this.listingsService.getFeatured(state);
  }

  @ApiBearerAuth()
  @Get('mine')
  myListings(@CurrentUser('sub') userId: string) {
    return this.listingsService.getMyListings(userId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @Get('pending')
  pending() {
    return this.listingsService.getPendingListings();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('sub') userId?: string) {
    return this.listingsService.findById(id, userId);
  }

  @ApiBearerAuth()
  @Post()
  create(
    @Body(new ZodValidationPipe(createListingSchema)) body: unknown,
    @CurrentUser('sub') userId: string,
  ) {
    return this.listingsService.create(body as Parameters<ListingsService['create']>[0], userId);
  }

  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateListingSchema)) body: unknown,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.listingsService.update(id, body as Parameters<ListingsService['update']>[1], userId, role);
  }

  @ApiBearerAuth()
  @Post(':id/submit')
  submit(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.listingsService.submitForReview(id, userId);
  }

  @ApiBearerAuth()
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.listingsService.remove(id, userId, role);
  }

  @ApiBearerAuth()
  @Get(':id/analytics')
  analytics(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.listingsService.getAnalytics(id, userId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentUser('sub') adminId: string) {
    return this.listingsService.approve(id, adminId);
  }

  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @Post(':id/reject')
  reject(@Param('id') id: string, @CurrentUser('sub') adminId: string) {
    return this.listingsService.reject(id, adminId);
  }
}
