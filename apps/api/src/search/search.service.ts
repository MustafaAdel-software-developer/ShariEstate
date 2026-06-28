import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch, Index } from 'meilisearch';

@Injectable()
export class SearchService implements OnModuleInit {
  private client: MeiliSearch | null = null;
  private index: Index | null = null;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    const host = this.config.get<string>('MEILISEARCH_HOST');
    if (!host) return;

    try {
      this.client = new MeiliSearch({
        host,
        apiKey: this.config.get('MEILISEARCH_API_KEY') || undefined,
      });
      this.index = this.client.index('listings');
      await this.index.updateFilterableAttributes([
        'stateSlug', 'citySlug', 'listingType', 'propertyType', 'status', 'price', 'beds', 'baths', 'isFeatured',
      ]);
      await this.index.updateSortableAttributes(['price', 'createdAt', 'sqft']);
    } catch {
      this.client = null;
      this.index = null;
    }
  }

  isEnabled() {
    return !!this.index;
  }

  async indexListing(listing: Record<string, unknown>) {
    if (!this.index) return;
    try {
      await this.index.addDocuments([listing]);
    } catch {
      // search optional
    }
  }

  async removeListing(id: string) {
    if (!this.index) return;
    try {
      await this.index.deleteDocument(id);
    } catch {
      // search optional
    }
  }

  async search(params: Record<string, unknown>) {
    if (!this.index) return null;

    const filters: string[] = ['status = active'];
    if (params.state) filters.push(`stateSlug = "${params.state}"`);
    if (params.city) filters.push(`citySlug = "${params.city}"`);
    if (params.listingType) filters.push(`listingType = ${params.listingType}`);
    if (params.propertyType) filters.push(`propertyType = ${params.propertyType}`);
    if (params.minPrice) filters.push(`price >= ${params.minPrice}`);
    if (params.maxPrice) filters.push(`price <= ${params.maxPrice}`);
    if (params.beds) filters.push(`beds >= ${params.beds}`);
    if (params.baths) filters.push(`baths >= ${params.baths}`);
    if (params.isFeatured) filters.push('isFeatured = true');

    const sort = params.sort === 'price_asc' ? ['price:asc']
      : params.sort === 'price_desc' ? ['price:desc']
      : params.sort === 'sqft_desc' ? ['sqft:desc']
      : ['createdAt:desc'];

    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;

    return this.index.search(String(params.keywords || ''), {
      filter: filters.join(' AND '),
      sort,
      limit,
      offset: (page - 1) * limit,
    });
  }
}
