import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { CurrentUser } from '../common/decorators';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateEventDto) {
    return this.eventsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accessible events' })
  findAll(@CurrentUser('id') userId: string) {
    return this.eventsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  findOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) eventId: string,
  ) {
    return this.eventsService.findOne(userId, eventId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event (organizer only)' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) eventId: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(userId, eventId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event (organizer only)' })
  remove(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) eventId: string,
  ) {
    return this.eventsService.remove(userId, eventId);
  }
}