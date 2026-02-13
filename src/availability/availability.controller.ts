import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto';
import { CurrentUser } from '../common/decorators';

@ApiTags('Availability')
@ApiBearerAuth()
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @ApiOperation({ summary: 'Add an availability slot' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAvailabilityDto,
  ) {
    return this.availabilityService.create(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my availability slots' })
  findMySlots(@CurrentUser('id') userId: string) {
    return this.availabilityService.findMySlots(userId);
  }

  @Get('check/:userId')
  @ApiOperation({ summary: 'Check if a user is available at a specific time' })
  @ApiQuery({ name: 'startTime', example: '2026-03-01T09:00:00.000Z' })
  @ApiQuery({ name: 'endTime', example: '2026-03-01T09:30:00.000Z' })
  checkConflict(
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.availabilityService.checkConflict(
      targetUserId,
      new Date(startTime),
      new Date(endTime),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an availability slot' })
  remove(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) slotId: string,
  ) {
    return this.availabilityService.remove(userId, slotId);
  }
}