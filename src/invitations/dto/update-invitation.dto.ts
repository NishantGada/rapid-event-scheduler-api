import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum RsvpStatus {
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  MAYBE = 'MAYBE',
}

export class UpdateInvitationDto {
  @ApiProperty({ enum: RsvpStatus, example: 'ACCEPTED' })
  @IsEnum(RsvpStatus)
  status: RsvpStatus;
}