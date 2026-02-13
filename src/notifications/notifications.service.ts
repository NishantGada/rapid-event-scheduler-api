import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InvitationCreatedEvent, RsvpUpdatedEvent } from './events';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  @OnEvent('invitation.created')
  handleInvitationCreated(event: InvitationCreatedEvent) {
    this.logger.log(
      `[EMAIL] To: ${event.inviteeEmail} | ` +
        `Hi ${event.inviteeFirstName}, you've been invited to "${event.eventTitle}" ` +
        `on ${event.eventStartTime.toISOString()} by ${event.organizerName}`,
    );
  }

  @OnEvent('rsvp.updated')
  handleRsvpUpdated(event: RsvpUpdatedEvent) {
    this.logger.log(
      `[EMAIL] To: ${event.organizerEmail} | ` +
        `${event.inviteeName} has ${event.status.toLowerCase()} your invitation ` +
        `to "${event.eventTitle}"`,
    );
  }
}