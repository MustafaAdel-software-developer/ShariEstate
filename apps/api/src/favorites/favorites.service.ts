import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            images: { where: { isCover: true }, take: 1 },
            city: true,
            state: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => f.listing);
  }

  async add(userId: string, listingId: string) {
    try {
      await this.prisma.favorite.create({ data: { userId, listingId } });
      await this.prisma.listing.update({
        where: { id: listingId },
        data: { saveCount: { increment: 1 } },
      });
    } catch {
      throw new ConflictException('Already in favorites');
    }
    return { success: true };
  }

  async remove(userId: string, listingId: string) {
    await this.prisma.favorite.deleteMany({ where: { userId, listingId } });
    await this.prisma.listing.update({
      where: { id: listingId },
      data: { saveCount: { decrement: 1 } },
    }).catch(() => undefined);
    return { success: true };
  }
}
