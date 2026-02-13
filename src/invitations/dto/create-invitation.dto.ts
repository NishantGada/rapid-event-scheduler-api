import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvitationDto {
  @ApiProperty({ example: 'uuid-of-the-event' })
  @IsUUID()
  eventId: string;

  @ApiProperty({ example: 'uuid-of-the-invitee' })
  @IsUUID()
  inviteeId: string;
}