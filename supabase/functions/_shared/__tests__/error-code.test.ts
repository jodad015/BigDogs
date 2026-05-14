import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { ErrorCode } from '../enums/error-code.ts';

Deno.test('ErrorCode has expected values', () => {
  assertEquals(ErrorCode.Unauthorized, 'UNAUTHORIZED');
  assertEquals(ErrorCode.ValidationError, 'VALIDATION_ERROR');
  assertEquals(ErrorCode.NotFound, 'NOT_FOUND');
  assertEquals(ErrorCode.InternalError, 'INTERNAL_ERROR');
  assertEquals(ErrorCode.NotImplemented, 'NOT_IMPLEMENTED');
});
