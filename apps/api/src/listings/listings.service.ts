import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, ListingStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchService } from '../search/search.service';
import { CreateListingInput, UpdateListingInput, ListingSearchInput } from '@real-estate/shared';

const listingInclude = {
  state: true,
  city: true,
  neighborhood: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  features: true,
  agent: {
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      brokerage: true,
    },
  },
  openHouses: { where: { startAt: { gte: new Date() } }, orderBy: { startAt: 'asc' as const } },
};

@Injectable()
export class ListingsService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
  ) {}

  async search(params: ListingSearchInput) {
    if (this.searchService.isEnabled() && !params.lat) {
      const meiliResult = await this.searchService.search(params as Record<string, unknown>);
      if (meiliResult) {
        const ids = meiliResult.hits.map((h: { id: string }) => h.id);
        if (ids.length === 0) {
          return { data: [], total: 0, page: params.page, limit: params.limit, totalPages: 0 };
        }
        const listings = await this.prisma.listing.findMany({
          where: { id: { in: ids }, deletedAt: null },
          include: listingInclude,
        });
        const ordered = ids.map((id) => listings.find((l) => l.id === id)).filter(Boolean);
        return {
          data: ordered,
          total: meiliResult.estimatedTotalHits ?? ordered.length,
          page: params.page,
          limit: params.limit,
          totalPages: Math.ceil((meiliResult.estimatedTotalHits ?? 0) / params.limit),
        };
      }
    }

    const where: Prisma.ListingWhereInput = {
      deletedAt: null,
      status: params.status ?? ListingStatus.active,
    };

    if (params.state) {
      where.state = { slug: params.state };
    }
    if (params.city) {
      where.city = { slug: params.city };
    }
    if (params.neighborhood) {
      where.neighborhood = { slug: params.neighborhood };
    }
    if (params.listingType) where.listingType = params.listingType;
    if (params.propertyType) where.propertyType = params.propertyType;
    if (params.minPrice || params.maxPrice) {
      where.price = {};
      if (params.minPrice) where.price.gte = params.minPrice;
      if (params.maxPrice) where.price.lte = params.maxPrice;
    }
    if (params.beds) where.beds = { gte: params.beds };
    if (params.baths) where.baths = { gte: params.baths };
    if (params.minSqft || params.maxSqft) {
      where.sqft = {};
      if (params.minSqft) where.sqft.gte = params.minSqft;
      if (params.maxSqft) where.sqft.lte = params.maxSqft;
    }
    if (params.isFeatured) where.isFeatured = true;
    if (params.keywords) {
      where.OR = [
        { title: { contains: params.keywords, mode: 'insensitive' } },
        { description: { contains: params.keywords, mode: 'insensitive' } },
        { address: { contains: params.keywords, mode: 'insensitive' } },
      ];
    }
    if (params.lat && params.lng && params.radius) {
      const latDelta = params.radius / 69;
      const lngDelta = params.radius / (69 * Math.cos((params.lat * Math.PI) / 180));
      where.lat = { gte: params.lat - latDelta, lte: params.lat + latDelta };
      where.lng = { gte: params.lng - lngDelta, lte: params.lng + lngDelta };
    }

    const orderBy: Prisma.ListingOrderByWithRelationInput =
      params.sort === 'price_asc' ? { price: 'asc' }
      : params.sort === 'price_desc' ? { price: 'desc' }
      : params.sort === 'sqft_desc' ? { sqft: 'desc' }
      : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: listingInclude,
        orderBy,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async findById(id: string, userId?: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...listingInclude,
        priceHistory: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    await this.prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    if (userId) {
      await this.prisma.listingView.create({ data: { listingId: id, userId } }).catch(() => undefined);
    }

    return listing;
  }

  async create(input: CreateListingInput, userId: string) {
    const agent = await this.prisma.agentProfile.findUnique({ where: { userId } });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !([UserRole.agent, UserRole.seller, UserRole.admin] as UserRole[]).includes(user.role)) {
      throw new ForbiddenException('Only agents and sellers can create listings');
    }

    const listing = await this.prisma.listing.create({
      data: {
        title: input.title,
        description: input.description,
        listingType: input.listingType,
        propertyType: input.propertyType,
        price: input.price,
        beds: input.beds,
        baths: input.baths,
        sqft: input.sqft,
        yearBuilt: input.yearBuilt,
        address: input.address,
        zip: input.zip,
        lat: input.lat,
        lng: input.lng,
        stateId: input.stateId,
        cityId: input.cityId,
        neighborhoodId: input.neighborhoodId,
        source: input.source,
        agentId: agent?.id,
        status: ListingStatus.draft,
        features: input.features?.length
          ? { create: input.features.map((name) => ({ name })) }
          : undefined,
      },
      include: listingInclude,
    });

    await this.syncSearchIndex(listing);
    return listing;
  }

  async update(id: string, input: UpdateListingInput, userId: string, userRole: UserRole) {
    const listing = await this.prisma.listing.findFirst({ where: { id, deletedAt: null } });
    if (!listing) throw new NotFoundException('Listing not found');

    if (userRole !== UserRole.admin) {
      const agent = await this.prisma.agentProfile.findUnique({ where: { userId } });
      if (listing.agentId !== agent?.id) {
        throw new ForbiddenException('You can only edit your own listings');
      }
    }

    const oldPrice = listing.price;
    const oldStatus = listing.status;

    const updated = await this.prisma.listing.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.description && { description: input.description }),
        ...(input.listingType && { listingType: input.listingType }),
        ...(input.propertyType && { propertyType: input.propertyType }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.beds !== undefined && { beds: input.beds }),
        ...(input.baths !== undefined && { baths: input.baths }),
        ...(input.sqft !== undefined && { sqft: input.sqft }),
        ...(input.yearBuilt !== undefined && { yearBuilt: input.yearBuilt }),
        ...(input.address && { address: input.address }),
        ...(input.zip && { zip: input.zip }),
        ...(input.lat !== undefined && { lat: input.lat }),
        ...(input.lng !== undefined && { lng: input.lng }),
        ...(input.stateId && { stateId: input.stateId }),
        ...(input.cityId && { cityId: input.cityId }),
        ...(input.neighborhoodId !== undefined && { neighborhoodId: input.neighborhoodId }),
        ...(input.status && { status: input.status }),
        ...(input.isFeatured !== undefined && userRole === UserRole.admin && { isFeatured: input.isFeatured }),
        ...(input.features && {
          features: {
            deleteMany: {},
            create: input.features.map((name) => ({ name })),
          },
        }),
      },
      include: listingInclude,
    });

    if (input.price !== undefined && Number(oldPrice) !== input.price) {
      await this.prisma.priceHistory.create({
        data: { listingId: id, price: input.price, status: updated.status, note: 'Price updated' },
      });
    }
    if (input.status && input.status !== oldStatus) {
      await this.prisma.priceHistory.create({
        data: { listingId: id, price: updated.price, status: input.status, note: `Status changed to ${input.status}` },
      });
    }

    await this.syncSearchIndex(updated);
    return updated;
  }

  async submitForReview(id: string, userId: string) {
    const listing = await this.getOwnedListing(id, userId);
    if (listing.status !== ListingStatus.draft) {
      throw new BadRequestException('Only draft listings can be submitted');
    }
    return this.update(id, { status: ListingStatus.pending }, userId, UserRole.agent);
  }

  async approve(id: string, adminId: string) {
    const listing = await this.prisma.listing.findFirst({ where: { id, deletedAt: null } });
    if (!listing) throw new NotFoundException('Listing not found');

    const updated = await this.prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.active },
      include: listingInclude,
    });

    await this.prisma.auditLog.create({
      data: { userId: adminId, action: 'approve_listing', entityType: 'listing', entityId: id },
    });

    await this.syncSearchIndex(updated);
    return updated;
  }

  async reject(id: string, adminId: string) {
    const updated = await this.prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.draft },
      include: listingInclude,
    });

    await this.prisma.auditLog.create({
      data: { userId: adminId, action: 'reject_listing', entityType: 'listing', entityId: id },
    });

    await this.searchService.removeListing(id);
    return updated;
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const listing = await this.prisma.listing.findFirst({ where: { id, deletedAt: null } });
    if (!listing) throw new NotFoundException('Listing not found');

    if (userRole !== UserRole.admin) {
      const agent = await this.prisma.agentProfile.findUnique({ where: { userId } });
      if (listing.agentId !== agent?.id) throw new ForbiddenException();
    }

    await this.prisma.listing.update({ where: { id }, data: { deletedAt: new Date(), status: ListingStatus.off_market } });
    await this.searchService.removeListing(id);
    return { success: true };
  }

  async getMyListings(userId: string) {
    const agent = await this.prisma.agentProfile.findUnique({ where: { userId } });
    if (!agent) return [];

    return this.prisma.listing.findMany({
      where: { agentId: agent.id, deletedAt: null },
      include: listingInclude,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getPendingListings() {
    return this.prisma.listing.findMany({
      where: { status: ListingStatus.pending, deletedAt: null },
      include: listingInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async getFeatured(stateSlug?: string) {
    return this.prisma.listing.findMany({
      where: {
        isFeatured: true,
        status: ListingStatus.active,
        deletedAt: null,
        ...(stateSlug && { state: { slug: stateSlug } }),
      },
      include: listingInclude,
      take: 12,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getAnalytics(listingId: string, userId: string) {
    const listing = await this.getOwnedListing(listingId, userId);
    const [views, inquiries, saves] = await Promise.all([
      this.prisma.listingView.count({ where: { listingId } }),
      this.prisma.inquiry.count({ where: { listingId } }),
      this.prisma.favorite.count({ where: { listingId } }),
    ]);
    return { listingId: listing.id, views, inquiries, saves, viewCount: listing.viewCount };
  }

  private async getOwnedListing(id: string, userId: string) {
    const agent = await this.prisma.agentProfile.findUnique({ where: { userId } });
    const listing = await this.prisma.listing.findFirst({ where: { id, deletedAt: null } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.agentId !== agent?.id) throw new ForbiddenException();
    return listing;
  }

  private async syncSearchIndex(listing: {
    id: string;
    title: string;
    description: string;
    listingType: string;
    propertyType: string;
    status: string;
    price: Prisma.Decimal;
    beds: number;
    baths: Prisma.Decimal;
    sqft: number | null;
    address: string;
    isFeatured: boolean;
    createdAt: Date;
    state?: { slug: string } | null;
    city?: { slug: string } | null;
  }) {
    if (listing.status !== ListingStatus.active) {
      await this.searchService.removeListing(listing.id);
      return;
    }

    await this.searchService.indexListing({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      listingType: listing.listingType,
      propertyType: listing.propertyType,
      status: listing.status,
      price: Number(listing.price),
      beds: listing.beds,
      baths: Number(listing.baths),
      sqft: listing.sqft,
      address: listing.address,
      isFeatured: listing.isFeatured,
      stateSlug: listing.state?.slug,
      citySlug: listing.city?.slug,
      createdAt: listing.createdAt.getTime(),
    });
  }
}
