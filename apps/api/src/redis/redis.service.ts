import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis | null = null;

  constructor(private config: ConfigService) {}

  getClient(): Redis {
    if (!this.client) {
      const url = this.config.get<string>('REDIS_URL', 'redis://localhost:6379');
      this.client = new Redis(url, { maxRetriesPerRequest: 3, lazyConnect: true });
    }
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.getClient().get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds = 300): Promise<void> {
    try {
      await this.getClient().set(key, value, 'EX', ttlSeconds);
    } catch {
      // cache optional
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.getClient().del(key);
    } catch {
      // cache optional
    }
  }
}
