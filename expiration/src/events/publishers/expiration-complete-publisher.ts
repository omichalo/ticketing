import {
  Publisher,
  Subjects,
  ExpirationCompleteEvent,
} from '@omtickets/common';

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
