import {
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('listings/:listingId/images')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadImage(
    @Param('listingId') listingId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('sub') userId: string,
    @Body('isCover') isCover?: string,
  ) {
    return this.mediaService.saveListingImage(listingId, file, userId, isCover === 'true');
  }

  @Post('listings/:listingId/images/reorder')
  reorder(
    @Param('listingId') listingId: string,
    @Body('imageIds') imageIds: string[],
    @CurrentUser('sub') userId: string,
  ) {
    return this.mediaService.reorderImages(listingId, imageIds, userId);
  }

  @Delete('images/:imageId')
  delete(@Param('imageId') imageId: string, @CurrentUser('sub') userId: string) {
    return this.mediaService.deleteImage(imageId, userId);
  }
}
