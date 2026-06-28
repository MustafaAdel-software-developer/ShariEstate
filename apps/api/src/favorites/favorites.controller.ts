import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  list(@CurrentUser('sub') userId: string) {
    return this.favoritesService.list(userId);
  }

  @Post(':listingId')
  add(@CurrentUser('sub') userId: string, @Param('listingId') listingId: string) {
    return this.favoritesService.add(userId, listingId);
  }

  @Delete(':listingId')
  remove(@CurrentUser('sub') userId: string, @Param('listingId') listingId: string) {
    return this.favoritesService.remove(userId, listingId);
  }
}
