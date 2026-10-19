import type { RecordEventFeedbackResponse } from '@volontariapp/contracts-nest';

export class RecordEventFeedbackResponseDTO implements RecordEventFeedbackResponse {
  recorded!: number;
}
