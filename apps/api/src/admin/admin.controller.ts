import { Controller, Get, Param, Patch, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GeoService } from '../geo/geo.service';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(UserRole.admin)
@Controller('admin')
export class AdminController {
  constructor(
    private prisma: PrismaService,
    private geoService: GeoService,
  ) {}

  @Get('stats')
  async stats() {
    const [users, listings, inquiries, states] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.listing.count({ where: { deletedAt: null } }),
      this.prisma.inquiry.count(),
      this.prisma.state.count({ where: { enabled: true } }),
    ]);
    return { users, listings, inquiries, activeStates: states };
  }

  @Get('states')
  getAllStates() {
    return this.geoService.getStates(false);
  }

  @Patch('states/:id/enable')
  enableState(@Param('id') id: string, @Body('enabled') enabled: boolean) {
    return this.geoService.updateState(id, { enabled });
  }

  @Get('audit-logs')
  auditLogs(@Query('limit') limit = '50') {
    return this.prisma.auditLog.findMany({
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });
  }
}
