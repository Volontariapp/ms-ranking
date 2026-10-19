import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, ValidateNested } from 'class-validator';
import type { RecordEventFeedbackCommand } from '@volontariapp/contracts-nest';
import { MAX_FEEDBACK_ITEMS } from '@volontariapp/domain-ranking';
import { EventFeedbackItemDTO } from './event-feedback-item.dto.js';

export class RecordEventFeedbackCommandDTO implements RecordEventFeedbackCommand {
  @IsArray()
  @ArrayMaxSize(MAX_FEEDBACK_ITEMS)
  @ValidateNested({ each: true })
  @Type(() => EventFeedbackItemDTO)
  items!: EventFeedbackItemDTO[];
}
