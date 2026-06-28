import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ListingsService } from '../listings/listings.service';
import { EmailService } from '../email/email.service';
import { ListingSearchInput } from '@real-estate/shared';

@Injectable()
export class SavedSearchAlertsService {
  private readonly logger = new Logger(SavedSearchAlertsService.name);

  constructor(
    private prisma: PrismaService,
    private listingsService: ListingsService,
    private emailService: EmailService,
    private config: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async runScheduled() {
    if (this.config.get('DISABLE_SAVED_SEARCH_CRON') === 'true') return;
    await this.processAlerts();
  }

  async processAlerts() {
    const searches = await this.prisma.savedSearch.findMany({
      where: { emailAlerts: true },
      include: { user: { select: { email: true, firstName: true } } },
    });

    let sent = 0;

    for (const search of searches) {
      const filters = search.filters as Record<string, unknown>;
      const stateSlug = (filters.stateSlug as string) || 'california';
      const params: ListingSearchInput = {
        state: stateSlug,
        city: filters.citySlug as string | undefined,
        neighborhood: filters.neighborhoodSlug as string | undefined,
        listingType: filters.listingType as ListingSearchInput['listingType'],
        propertyType: filters.propertyType as ListingSearchInput['propertyType'],
        minPrice: filters.minPrice as number | undefined,
        maxPrice: filters.maxPrice as number | undefined,
        beds: filters.beds as number | undefined,
        baths: filters.baths as number | undefined,
        keywords: filters.keywords as string | undefined,
        page: 1,
        limit: 50,
        sort: 'newest',
      };

      const since = search.lastNotifiedAt ?? search.createdAt;
      const result = await this.listingsService.search(params);
      const newListings = result.data.filter(
        (listing): listing is NonNullable<typeof listing> =>
          listing != null && new Date(listing.createdAt) > since,
      );

      if (newListings.length === 0) continue;

      const webUrl = this.config.get('WEB_URL') || 'http://localhost:3000';
      const listingLines = newListings
        .slice(0, 10)
        .map(
          (l) =>
            `<li><a href="${webUrl}/listing/${l.id}">${l.title}</a> — $${Number(l.price).toLocaleString()}</li>`,
        )
        .join('');

      const ok = await this.emailService.send({
        to: search.user.email,
        subject: `${newListings.length} new listing${newListings.length === 1 ? '' : 's'} for "${search.name}"`,
        html: `
          <p>Hi ${search.user.firstName},</p>
          <p>We found ${newListings.length} new match${newListings.length === 1 ? '' : 'es'} for your saved search <strong>${search.name}</strong>:</p>
          <ul>${listingLines}</ul>
          <p><a href="${webUrl}/dashboard/searches">Manage saved searches</a></p>
        `,
      });

      if (ok) {
        await this.prisma.savedSearch.update({
          where: { id: search.id },
          data: { lastNotifiedAt: new Date() },
        });
        sent++;
      }
    }

    this.logger.log(`Saved search alerts: ${sent} email(s) sent`);
    return { processed: searches.length, sent };
  }
}
