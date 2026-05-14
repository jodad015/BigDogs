export const ErrorCode = {
  NotImplemented: 'NOT_IMPLEMENTED',
  Unauthorized: 'UNAUTHORIZED',
  Forbidden: 'FORBIDDEN',
  ValidationError: 'VALIDATION_ERROR',
  InternalError: 'INTERNAL_ERROR',
  StorageError: 'STORAGE_ERROR',
  QueueError: 'QUEUE_ERROR',
  NotFound: 'NOT_FOUND',
  UnknownContext: 'UNKNOWN_CONTEXT',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
