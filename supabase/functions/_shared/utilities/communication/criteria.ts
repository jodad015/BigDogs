import type { ResultBase } from '../../types/result-base.ts';

export interface TransmitCriteria {
  type: 'broadcast';
  channelName: string;
  event: string;
  payload: Record<string, unknown>;
}

export interface TransmitResult extends ResultBase {}
