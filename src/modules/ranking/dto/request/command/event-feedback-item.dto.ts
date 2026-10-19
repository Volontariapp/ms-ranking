import { IsIn, IsUUID } from 'class-validator';
import { FeedbackAction, type EventFeedbackItem } from '@volontariapp/contracts-nest';

export class EventFeedbackItemDTO implements EventFeedbackItem {
  @IsUUID('all')
  eventId!: string;

  @IsIn([FeedbackAction.FEEDBACK_ACTION_PASS])
  action!: FeedbackAction;
}
