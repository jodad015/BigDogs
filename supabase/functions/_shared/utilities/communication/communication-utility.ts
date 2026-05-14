import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { TransmitCriteria, TransmitResult } from './criteria.ts';
import { ErrorCode } from '../../enums/error-code.ts';

export class CommunicationUtility {
  constructor(private db: SupabaseClient) {}

  async transmit(criteria: TransmitCriteria): Promise<TransmitResult> {
    switch (criteria.type) {
      case 'broadcast': {
        const channel = this.db.channel(criteria.channelName);
        const result = await channel.send({
          type: 'broadcast',
          event: criteria.event,
          payload: criteria.payload,
        });
        if (result !== 'ok') {
          return { errors: [{ code: ErrorCode.InternalError, message: 'Broadcast failed' }] };
        }
        return {};
      }
      default:
        return {
          errors: [{ code: ErrorCode.NotImplemented, message: `Transmit type not implemented` }],
        };
    }
  }
}
