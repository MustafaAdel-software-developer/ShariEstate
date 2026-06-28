import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgentsService {
  constructor(private prisma: PrismaService) {}

  async list(stateSlug?: string) {
    return this.prisma.agentProfile.findMany({
      where: stateSlug
        ? {
            listings: {
              some: { state: { slug: stateSlug }, status: 'active', deletedAt: null },
            },
          }
        : undefined,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        brokerage: true,
        _count: { select: { listings: { where: { status: 'active', deletedAt: null } } } },
      },
      orderBy: { user: { lastName: 'asc' } },
    });
  }

  async findBySlug(slug: string) {
    const agent = await this.prisma.agentProfile.findUnique({
      where: { slug },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        brokerage: true,
        listings: {
          where: { status: 'active', deletedAt: null },
          include: {
            images: { where: { isCover: true }, take: 1 },
            city: true,
            state: true,
          },
          take: 12,
        },
      },
    });
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }

  async updateProfile(userId: string, data: { bio?: string; phone?: string; licenseNumber?: string; photoUrl?: string }) {
    return this.prisma.agentProfile.update({
      where: { userId },
      data,
      include: { user: { select: { firstName: true, lastName: true, email: true } }, brokerage: true },
    });
  }
}
