import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryInput } from '@real-estate/shared';

@Injectable()
export class InquiriesService {
  constructor(private prisma: PrismaService) {}

  async create(input: CreateInquiryInput, userId?: string) {
    return this.prisma.inquiry.create({
      data: {
        listingId: input.listingId,
        userId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        message: input.message,
      },
      include: { listing: { select: { title: true, address: true } } },
    });
  }

  async getForAgent(userId: string) {
    const agent = await this.prisma.agentProfile.findUnique({ where: { userId } });
    if (!agent) return [];

    return this.prisma.inquiry.findMany({
      where: { listing: { agentId: agent.id } },
      include: { listing: { select: { id: true, title: true, address: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
