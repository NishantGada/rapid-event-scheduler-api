import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvailabilityDto } from './dto';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateAvailabilityDto) {
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }

    const overlapping = await this.prisma.availabilitySlot.findFirst({
      where: {
        userId,
        dayOfWeek: dto.dayOfWeek,
        startTime: { lt: dto.endTime },
        endTime: { gt: dto.startTime },
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        'This slot overlaps with an existing availability slot',
      );
    }

    const slot = await this.prisma.availabilitySlot.create({
      data: {
        ...dto,
        userId,
      },
    });

    return slot;
  }

  async findMySlots(userId: string) {
    const slots = await this.prisma.availabilitySlot.findMany({
      where: { userId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return slots;
  }

  async remove(userId: string, slotId: string) {
    const slot = await this.prisma.availabilitySlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new NotFoundException('Availability slot not found');
    }

    if (slot.userId !== userId) {
      throw new ForbiddenException('You can only delete your own availability slots');
    }

    await this.prisma.availabilitySlot.delete({
      where: { id: slotId },
    });

    return { message: 'Availability slot deleted successfully' };
  }

  async checkConflict(userId: string, startTime: Date, endTime: Date) {
    const dayOfWeek = startTime.getDay();
    const start = startTime.toTimeString().slice(0, 5);
    const end = endTime.toTimeString().slice(0, 5);

    const availableSlot = await this.prisma.availabilitySlot.findFirst({
      where: {
        userId,
        dayOfWeek,
        startTime: { lte: start },
        endTime: { gte: end },
      },
    });

    return {
      isAvailable: !!availableSlot,
      slot: availableSlot,
    };
  }
}