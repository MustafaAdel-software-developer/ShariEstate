import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AgentsService } from './agents.service';
import { Public } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('agents')
@Controller('agents')
export class AgentsController {
  constructor(private agentsService: AgentsService) {}

  @Public()
  @Get()
  list(@Query('state') state?: string) {
    return this.agentsService.list(state);
  }

  @Patch('profile/me')
  updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() body: { bio?: string; phone?: string; licenseNumber?: string; photoUrl?: string },
  ) {
    return this.agentsService.updateProfile(userId, body);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.agentsService.findBySlug(slug);
  }
}
