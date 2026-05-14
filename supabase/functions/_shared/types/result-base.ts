import type { ErrorBase } from './error-base.ts';

export interface ResultBase {
  errors?: ErrorBase[];
}
