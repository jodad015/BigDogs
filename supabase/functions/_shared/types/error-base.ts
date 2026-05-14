export interface ErrorBase {
  code: string;
  message: string;
  field?: string;
}
