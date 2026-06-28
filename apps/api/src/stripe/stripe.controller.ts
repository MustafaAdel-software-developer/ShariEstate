import { Body, Controller, Headers, Param, Post, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { Public } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('payments')
@Controller('payments')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @ApiBearerAuth()
  @Post('featured/:listingId')
  createFeaturedCheckout(
    @Param('listingId') listingId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.stripeService.createFeaturedCheckout(listingId, userId);
  }

  @Public()
  @Post('webhook')
  webhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    return this.stripeService.handleWebhook(req.rawBody ?? Buffer.from(''), signature);
  }
}
