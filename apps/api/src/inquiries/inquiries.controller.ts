import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { createInquirySchema } from '@real-estate/shared';
import { InquiriesService } from './inquiries.service';
import { Public } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('inquiries')
@Controller('inquiries')
export class InquiriesController {
  constructor(private inquiriesService: InquiriesService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  create(
    @Body(new ZodValidationPipe(createInquirySchema)) body: unknown,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.inquiriesService.create(body as Parameters<InquiriesService['create']>[0], userId);
  }

  @Get('mine')
  mine(@CurrentUser('sub') userId: string) {
    return this.inquiriesService.getForAgent(userId);
  }
}
