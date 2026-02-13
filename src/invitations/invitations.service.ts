import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto, UpdateInvitationDto } from './dto';

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateInvitationDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer can send invitations');
    }

    if (dto.inviteeId === userId) {
      throw new BadRequestException('You cannot invite yourself');
    }

    const invitee = await this.prisma.user.findUnique({
      where: { id: dto.inviteeId },
    });

    if (!invitee) {
      throw new NotFoundException('Invitee not found');
    }

    const existing = await this.prisma.invitation.findUnique({
      where: {
        eventId_inviteeId: {
          eventId: dto.eventId,
          inviteeId: dto.inviteeId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User is already invited to this event');
    }

    const invitation = await this.prisma.invitation.create({
      data: {
        eventId: dto.eventId,
        inviteeId: dto.inviteeId,
      },
      include: {
        event: { select: { id: true, title: true, startTime: true } },
        invitee: { select: this.userSelect },
      },
    });

    return invitation;
  }

  async findMyInvitations(userId: string) {
    const invitations = await this.prisma.invitation.findMany({
      where: { inviteeId: userId },
      include: {
        event: {
          include: { organizer: { select: this.userSelect } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations;
  }

  async updateRsvp(userId: string, invitationId: string, dto: UpdateInvitationDto) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.inviteeId !== userId) {
      throw new ForbiddenException('You can only RSVP to your own invitations');
    }

    const updated = await this.prisma.invitation.update({
      where: { id: invitationId },
      data: { status: dto.status },
      include: {
        event: { select: { id: true, title: true, startTime: true } },
        invitee: { select: this.userSelect },
      },
    });

    return updated;
  }

  private readonly userSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
  };
}