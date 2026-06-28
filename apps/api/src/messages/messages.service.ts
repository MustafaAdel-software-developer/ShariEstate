import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageInput } from '@real-estate/shared';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async send(senderId: string, input: SendMessageInput) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: input.listingId },
      include: { agent: true },
    });
    if (!listing) throw new ForbiddenException('Invalid listing');

    const isParticipant =
      senderId === input.recipientId ||
      senderId === listing.agent?.userId ||
      listing.agent?.userId === input.recipientId;

    if (!isParticipant && listing.agent?.userId !== senderId) {
      // buyer messaging agent
      if (listing.agent?.userId !== input.recipientId) {
        throw new ForbiddenException('Invalid recipient');
      }
    }

    return this.prisma.message.create({
      data: {
        listingId: input.listingId,
        senderId,
        recipientId: input.recipientId,
        body: input.body,
      },
    });
  }

  async getConversations(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { recipientId: userId }] },
      include: {
        listing: { select: { id: true, title: true, address: true } },
        sender: { select: { id: true, firstName: true, lastName: true } },
        recipient: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const conversationMap = new Map<string, {
      listingId: string;
      listing: typeof messages[0]['listing'];
      otherUser: { id: string; firstName: string; lastName: string };
      lastMessage: typeof messages[0];
      unreadCount: number;
    }>();

    for (const msg of messages) {
      const otherUser = msg.senderId === userId ? msg.recipient : msg.sender;
      const key = `${msg.listingId}-${otherUser.id}`;
      if (!conversationMap.has(key)) {
        const unread = messages.filter(
          (m) => m.listingId === msg.listingId && m.recipientId === userId && !m.readAt,
        ).length;
        conversationMap.set(key, {
          listingId: msg.listingId,
          listing: msg.listing,
          otherUser,
          lastMessage: msg,
          unreadCount: unread,
        });
      }
    }

    return Array.from(conversationMap.values());
  }

  async getThread(listingId: string, userId: string, otherUserId: string) {
    await this.prisma.message.updateMany({
      where: { listingId, recipientId: userId, senderId: otherUserId, readAt: null },
      data: { readAt: new Date() },
    });

    return this.prisma.message.findMany({
      where: {
        listingId,
        OR: [
          { senderId: userId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}
