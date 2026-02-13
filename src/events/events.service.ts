import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateEventDto) {
    const event = await this.prisma.event.create({
      data: {
        ...dto,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        organizerId: userId,
      },
      include: { organizer: { select: this.userSelect } },
    });

    return event;
  }

  async findAll(userId: string) {
    const events = await this.prisma.event.findMany({
      where: {
        OR: [
          { organizerId: userId },
          { isPublic: true },
          { invitations: { some: { inviteeId: userId } } },
        ],
      },
      include: { organizer: { select: this.userSelect } },
      orderBy: { startTime: 'asc' },
    });

    return events;
  }

  async findOne(userId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: { select: this.userSelect },
        invitations: {
          include: { invitee: { select: this.userSelect } },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    this.checkEventAccess(event, userId);

    return event;
  }

  async update(userId: string, eventId: string, dto: UpdateEventDto) {
    const event = await this.findOwnedEvent(userId, eventId);

    const updated = await this.prisma.event.update({
      where: { id: event.id },
      data: {
        ...dto,
        ...(dto.startTime && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime && { endTime: new Date(dto.endTime) }),
      },
      include: { organizer: { select: this.userSelect } },
    });

    return updated;
  }

  async remove(userId: string, eventId: string) {
    await this.findOwnedEvent(userId, eventId);

    await this.prisma.event.delete({
      where: { id: eventId },
    });

    return { message: 'Event deleted successfully' };
  }

  private async findOwnedEvent(userId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('You can only modify your own events');
    }

    return event;
  }

  private checkEventAccess(event: any, userId: string) {
    if (event.isPublic) return;
    if (event.organizerId === userId) return;

    const isInvited = event.invitations?.some(
      (inv: any) => inv.inviteeId === userId,
    );

    if (!isInvited) {
      throw new ForbiddenException('You do not have access to this event');
    }
  }

  private readonly userSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
  };
}