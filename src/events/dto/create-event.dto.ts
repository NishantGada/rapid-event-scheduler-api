import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Team Standup' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ example: 'Daily sync with the engineering team' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: '2026-03-01T09:00:00.000Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2026-03-01T09:30:00.000Z' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ example: 'Zoom Meeting Room 1' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({ example: 'FREQ=WEEKLY;BYDAY=MO,WE,FR' })
  @IsString()
  @IsOptional()
  recurrence?: string;
}