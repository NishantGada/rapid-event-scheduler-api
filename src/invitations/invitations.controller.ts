import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto, UpdateInvitationDto } from './dto';
import { CurrentUser } from '../common/decorators';

@ApiTags('Invitations')
@ApiBearerAuth()
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @ApiOperation({ summary: 'Invite a user to an event (organizer only)' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInvitationDto,
  ) {
    return this.invitationsService.create(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get all my received invitations' })
  findMyInvitations(@CurrentUser('id') userId: string) {
    return this.invitationsService.findMyInvitations(userId);
  }

  @Patch(':id/rsvp')
  @ApiOperation({ summary: 'RSVP to an invitation' })
  updateRsvp(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) invitationId: string,
    @Body() dto: UpdateInvitationDto,
  ) {
    return this.invitationsService.updateRsvp(userId, invitationId, dto);
  }
}