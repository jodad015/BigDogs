import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type {
  QueueSendCriteria,
  QueueSendResult,
  QueueReceiveCriteria,
  QueueReceiveResult,
  QueueArchiveCriteria,
  QueueArchiveResult,
} from './criteria.ts';
import { ErrorCode } from '../../enums/error-code.ts';

export class QueueUtility {
  constructor(private db: SupabaseClient) {}

  async send(criteria: QueueSendCriteria): Promise<QueueSendResult> {
    const { data, error } = await this.db.rpc('pgmq_send', {
      queue_name: criteria.queueName,
      message: criteria.message,
      delay: criteria.delay ?? 0,
    });

    if (error) {
      return { errors: [{ code: ErrorCode.QueueError, message: error.message }] };
    }
    return { messageId: data };
  }

  async receive(criteria: QueueReceiveCriteria): Promise<QueueReceiveResult> {
    const { data, error } = await this.db.rpc('pgmq_read', {
      queue_name: criteria.queueName,
      sleep_seconds: criteria.sleepSeconds ?? 0,
      n: criteria.count ?? 1,
    });

    if (error) {
      return { errors: [{ code: ErrorCode.QueueError, message: error.message }] };
    }
    return { messages: data ?? [] };
  }

  async archive(criteria: QueueArchiveCriteria): Promise<QueueArchiveResult> {
    const { error } = await this.db.rpc('pgmq_archive', {
      queue_name: criteria.queueName,
      message_id: criteria.messageId,
    });

    if (error) {
      return { errors: [{ code: ErrorCode.QueueError, message: error.message }] };
    }
    return {};
  }
}
