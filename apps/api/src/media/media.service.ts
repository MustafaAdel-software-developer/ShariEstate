import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  private uploadDir: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.uploadDir = this.config.get('UPLOAD_DIR', './uploads');
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getUploadUrl(filename: string) {
    const publicUrl = this.config.get('PUBLIC_URL', 'http://localhost:3001');
    return `${publicUrl}/uploads/${filename}`;
  }

  async saveListingImage(
    listingId: string,
    file: Express.Multer.File,
    userId: string,
    isCover = false,
  ) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, deletedAt: null },
      include: { agent: true },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    const agent = await this.prisma.agentProfile.findUnique({ where: { userId } });
    if (listing.agentId !== agent?.id) {
      throw new ForbiddenException('Not your listing');
    }

    const filename = `${uuidv4()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const filepath = join(this.uploadDir, filename);
    const fs = await import('fs/promises');
    await fs.writeFile(filepath, file.buffer);

    const count = await this.prisma.listingImage.count({ where: { listingId } });

    if (isCover) {
      await this.prisma.listingImage.updateMany({
        where: { listingId },
        data: { isCover: false },
      });
    }

    return this.prisma.listingImage.create({
      data: {
        listingId,
        url: this.getUploadUrl(filename),
        sortOrder: count,
        isCover: isCover || count === 0,
      },
    });
  }

  async reorderImages(listingId: string, imageIds: string[], userId: string) {
    await this.assertOwnership(listingId, userId);
    await Promise.all(
      imageIds.map((id, index) =>
        this.prisma.listingImage.update({ where: { id }, data: { sortOrder: index } }),
      ),
    );
    return this.prisma.listingImage.findMany({
      where: { listingId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async deleteImage(imageId: string, userId: string) {
    const image = await this.prisma.listingImage.findUnique({
      where: { id: imageId },
      include: { listing: true },
    });
    if (!image) throw new NotFoundException('Image not found');
    await this.assertOwnership(image.listingId, userId);
    await this.prisma.listingImage.delete({ where: { id: imageId } });
    return { success: true };
  }

  private async assertOwnership(listingId: string, userId: string) {
    const agent = await this.prisma.agentProfile.findUnique({ where: { userId } });
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing || listing.agentId !== agent?.id) {
      throw new ForbiddenException('Not your listing');
    }
  }
}
