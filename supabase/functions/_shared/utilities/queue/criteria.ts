import type { ResultBase } from '../../types/result-base.ts';

export interface QueueSendCriteria {
  queueName: string;
  message: Record<string, unknown>;
  delay?: number;
}

export interface QueueSendResult extends ResultBase {
  messageId?: number;
}

export interface QueueReceiveCriteria {
  queueName: string;
  sleepSeconds?: number;
  count?: number;
}

export interface QueueReceiveResult extends ResultBase {
  messages?: Record<string, unknown>[];
}

export interface QueueArchiveCriteria {
  queueName: string;
  messageId: number;
}

export interface QueueArchiveResult extends ResultBase {}
