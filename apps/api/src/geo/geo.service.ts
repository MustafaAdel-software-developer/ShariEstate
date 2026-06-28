import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateStateInput, CreateCityInput } from '@real-estate/shared';

@Injectable()
export class GeoService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getStates(enabledOnly = true) {
    const cacheKey = `geo:states:${enabledOnly}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const states = await this.prisma.state.findMany({
      where: enabledOnly ? { enabled: true } : undefined,
      orderBy: { name: 'asc' },
      include: { _count: { select: { cities: true, listings: { where: { status: 'active', deletedAt: null } } } } },
    });

    await this.redis.set(cacheKey, JSON.stringify(states), 600);
    return states;
  }

  async getStateBySlug(slug: string) {
    const state = await this.prisma.state.findUnique({
      where: { slug },
      include: {
        cities: {
          orderBy: { name: 'asc' },
          include: { _count: { select: { listings: { where: { status: 'active', deletedAt: null } } } } },
        },
        _count: { select: { listings: { where: { status: 'active', deletedAt: null } } } },
      },
    });
    if (!state) throw new NotFoundException('State not found');
    return state;
  }

  async getCitiesByStateSlug(stateSlug: string) {
    const state = await this.prisma.state.findUnique({ where: { slug: stateSlug } });
    if (!state) throw new NotFoundException('State not found');

    return this.prisma.city.findMany({
      where: { stateId: state.id },
      orderBy: { name: 'asc' },
      include: { _count: { select: { listings: { where: { status: 'active', deletedAt: null } } } } },
    });
  }

  async getCityBySlug(stateSlug: string, citySlug: string) {
    const state = await this.prisma.state.findUnique({ where: { slug: stateSlug } });
    if (!state) throw new NotFoundException('State not found');

    const city = await this.prisma.city.findUnique({
      where: { stateId_slug: { stateId: state.id, slug: citySlug } },
      include: {
        state: true,
        neighborhoods: {
          orderBy: { name: 'asc' },
          include: { _count: { select: { listings: { where: { status: 'active', deletedAt: null } } } } },
        },
        _count: { select: { listings: { where: { status: 'active', deletedAt: null } } } },
      },
    });
    if (!city) throw new NotFoundException('City not found');
    return city;
  }

  async getNeighborhoodBySlug(stateSlug: string, citySlug: string, neighborhoodSlug: string) {
    const city = await this.getCityBySlug(stateSlug, citySlug);
    const neighborhood = await this.prisma.neighborhood.findUnique({
      where: { cityId_slug: { cityId: city.id, slug: neighborhoodSlug } },
      include: {
        city: { include: { state: true } },
        _count: { select: { listings: { where: { status: 'active', deletedAt: null } } } },
      },
    });
    if (!neighborhood) throw new NotFoundException('Neighborhood not found');
    return neighborhood;
  }

  async getNeighborhoodsByCity(stateSlug: string, citySlug: string) {
    const city = await this.getCityBySlug(stateSlug, citySlug);
    return city.neighborhoods;
  }

  async createState(input: CreateStateInput) {
    await this.redis.del('geo:states:true');
    await this.redis.del('geo:states:false');
    return this.prisma.state.create({ data: input });
  }

  async createCity(input: CreateCityInput) {
    await this.redis.del('geo:states:true');
    await this.redis.del('geo:states:false');
    return this.prisma.city.create({ data: input });
  }

  async updateState(id: string, data: Partial<CreateStateInput>) {
    await this.redis.del('geo:states:true');
    await this.redis.del('geo:states:false');
    return this.prisma.state.update({ where: { id }, data });
  }
}
