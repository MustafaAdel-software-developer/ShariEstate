import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GeoModule } from './geo/geo.module';
import { ListingsModule } from './listings/listings.module';
import { MediaModule } from './media/media.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { FavoritesModule } from './favorites/favorites.module';
import { AgentsModule } from './agents/agents.module';
import { ToursModule } from './tours/tours.module';
import { MessagesModule } from './messages/messages.module';
import { SearchModule } from './search/search.module';
import { StripeModule } from './stripe/stripe.module';
import { AdminModule } from './admin/admin.module';
import { JobsModule } from './jobs/jobs.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    GeoModule,
    ListingsModule,
    MediaModule,
    InquiriesModule,
    FavoritesModule,
    AgentsModule,
    ToursModule,
    MessagesModule,
    SearchModule,
    StripeModule,
    AdminModule,
    JobsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
