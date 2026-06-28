import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe | null = null;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY');
    if (key) {
      this.stripe = new Stripe(key);
    }
  }

  isEnabled() {
    return !!this.stripe;
  }

  async createFeaturedCheckout(listingId: string, userId: string) {
    if (!this.stripe) throw new BadRequestException('Payments not configured');

    const agent = await this.prisma.agentProfile.findUnique({ where: { userId } });
    const listing = await this.prisma.listing.findFirst({
      where: { id: listingId, agentId: agent?.id, deletedAt: null },
    });
    if (!listing) throw new BadRequestException('Listing not found');

    const priceId = this.config.get('STRIPE_FEATURED_PRICE_ID');
    if (!priceId) throw new BadRequestException('Featured price not configured');

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${this.config.get('CORS_ORIGIN')}/dashboard/listings?featured=success`,
      cancel_url: `${this.config.get('CORS_ORIGIN')}/dashboard/listings?featured=cancelled`,
      metadata: { listingId, userId },
    });

    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    if (!this.stripe) return;

    const secret = this.config.get('STRIPE_WEBHOOK_SECRET');
    if (!secret) return;

    const event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const listingId = session.metadata?.listingId;
      if (listingId) {
        await this.prisma.listing.update({
          where: { id: listingId },
          data: { isFeatured: true, isPremium: true },
        });
      }
    }
  }
}
