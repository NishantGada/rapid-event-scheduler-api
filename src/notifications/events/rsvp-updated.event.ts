export class RsvpUpdatedEvent {
  constructor(
    public readonly organizerEmail: string,
    public readonly inviteeName: string,
    public readonly eventTitle: string,
    public readonly status: string,
  ) {}
}