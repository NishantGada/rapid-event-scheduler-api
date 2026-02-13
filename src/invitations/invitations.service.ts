import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto, UpdateInvitationDto } from './dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  InvitationCreatedEvent,
  RsvpUpdatedEvent,
} from '../notifications/events';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

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

    const organizer = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    this.eventEmitter.emit(
      'invitation.created',
      new InvitationCreatedEvent(
        invitee.email,
        invitee.firstName,
        event.title,
        event.startTime,
        organizer!.firstName + ' ' + organizer!.lastName,
      ),
    );

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

    const event = await this.prisma.event.findUnique({
      where: { id: invitation.eventId },
      include: { organizer: true },
    });

    this.eventEmitter.emit(
      'rsvp.updated',
      new RsvpUpdatedEvent(
        event!.organizer.email,
        updated.invitee.firstName + ' ' + updated.invitee.lastName,
        event!.title,
        dto.status,
      ),
    );

    return updated;
  }

  private readonly userSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
  };
}