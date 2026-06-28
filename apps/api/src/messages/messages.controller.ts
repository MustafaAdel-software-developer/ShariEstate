import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { sendMessageSchema } from '@real-estate/shared';
import { MessagesService } from './messages.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversations')
  conversations(@CurrentUser('sub') userId: string) {
    return this.messagesService.getConversations(userId);
  }

  @Get('thread/:listingId')
  thread(
    @Param('listingId') listingId: string,
    @Query('userId') otherUserId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.messagesService.getThread(listingId, userId, otherUserId);
  }

  @Post()
  send(
    @CurrentUser('sub') userId: string,
    @Body(new ZodValidationPipe(sendMessageSchema)) body: unknown,
  ) {
    return this.messagesService.send(userId, body as Parameters<MessagesService['send']>[1]);
  }
}
