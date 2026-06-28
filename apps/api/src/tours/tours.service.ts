import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScheduleTourInput, SavedSearchInput } from '@real-estate/shared';

@Injectable()
export class ToursService {
  constructor(private prisma: PrismaService) {}

  async create(input: ScheduleTourInput, userId?: string) {
    return this.prisma.tourRequest.create({
      data: {
        listingId: input.listingId,
        userId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        preferredDate: new Date(input.preferredDate),
        preferredTime: input.preferredTime,
        message: input.message,
      },
      include: { listing: { select: { title: true, address: true } } },
    });
  }

  async getForAgent(userId: string) {
    const agent = await this.prisma.agentProfile.findUnique({ where: { userId } });
    if (!agent) return [];

    return this.prisma.tourRequest.findMany({
      where: { listing: { agentId: agent.id } },
      include: { listing: { select: { id: true, title: true, address: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getForBuyer(userId: string) {
    return this.prisma.tourRequest.findMany({
      where: { userId },
      include: { listing: { select: { id: true, title: true, address: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}

@Injectable()
export class SavedSearchesService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, input: SavedSearchInput) {
    const { name, emailAlerts, ...filters } = input;
    return this.prisma.savedSearch.create({
      data: { userId, name, emailAlerts, filters },
    });
  }

  async remove(userId: string, id: string) {
    await this.prisma.savedSearch.deleteMany({ where: { id, userId } });
    return { success: true };
  }

  async update(userId: string, id: string, data: { name?: string; emailAlerts?: boolean }) {
    const existing = await this.prisma.savedSearch.findFirst({ where: { id, userId } });
    if (!existing) return { success: false };
    return this.prisma.savedSearch.update({
      where: { id },
      data,
    });
  }
}
