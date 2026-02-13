export class InvitationCreatedEvent {
  constructor(
    public readonly inviteeEmail: string,
    public readonly inviteeFirstName: string,
    public readonly eventTitle: string,
    public readonly eventStartTime: Date,
    public readonly organizerName: string,
  ) {}
}