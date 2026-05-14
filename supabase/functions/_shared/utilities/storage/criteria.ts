import type { ResultBase } from '../../types/result-base.ts';

export interface SignedUrlCriteria {
  bucket: string;
  path: string;
  expiresIn?: number;
}

export interface SignedUrlResult extends ResultBase {
  signedUrl?: string;
}

export interface SignedUploadUrlCriteria {
  bucket: string;
  path: string;
}

export interface SignedUploadUrlResult extends ResultBase {
  signedUrl?: string;
  token?: string;
}

export interface ObjectDeleteCriteria {
  bucket: string;
  paths: string[];
}

export interface ObjectDeleteResult extends ResultBase {}
