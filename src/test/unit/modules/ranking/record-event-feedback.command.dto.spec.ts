import 'reflect-metadata';
import { describe, expect, it } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FeedbackAction } from '@volontariapp/contracts-nest';
import { RecordEventFeedbackCommandDTO } from '../../../../modules/ranking/dto/request/command/record-event-feedback.command.dto.js';

const buildBatch = (size: number, action = FeedbackAction.FEEDBACK_ACTION_PASS) => ({
  items: Array.from({ length: size }, (_, index) => ({
    eventId: `00000000-0000-4000-a000-${String(index).padStart(12, '0')}`,
    action,
  })),
});

const errorsOf = (payload: object) =>
  validate(plainToInstance(RecordEventFeedbackCommandDTO, payload));

describe('RecordEventFeedbackCommandDTO (Unit)', () => {
  it('accepts a batch of 50 passes', async () => {
    expect(await errorsOf(buildBatch(50))).toHaveLength(0);
  });

  it('refuses a batch of 51 passes', async () => {
    const errors = await errorsOf(buildBatch(51));

    expect(errors).toHaveLength(1);
    expect(errors[0]?.property).toBe('items');
  });

  it('refuses an unspecified action', async () => {
    expect(
      await errorsOf(buildBatch(1, FeedbackAction.FEEDBACK_ACTION_UNSPECIFIED)),
    ).not.toHaveLength(0);
  });

  it('refuses an event id that is not a UUID', async () => {
    const errors = await errorsOf({
      items: [{ eventId: 'not-a-uuid', action: FeedbackAction.FEEDBACK_ACTION_PASS }],
    });

    expect(errors).not.toHaveLength(0);
  });
});
