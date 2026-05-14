import type { ContextType } from '../enums/context-type.ts';

export interface ContextBase {
  type: ContextType;
}

export interface SystemContext extends ContextBase {
  type: 'system';
  requestId: string;
}

export interface UserContext extends ContextBase {
  type: 'user';
  requestId: string;
  userId: string;
  userEmail: string;
  userRole: string;
}

export interface ApiContextDraft extends ContextBase {
  type: 'draft';
  externalAuthId: string;
}
