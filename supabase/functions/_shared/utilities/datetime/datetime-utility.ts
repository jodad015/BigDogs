export class DatetimeUtility {
  utcNow(): string {
    return new Date().toISOString();
  }

  toDate(isoString: string): Date {
    return new Date(isoString);
  }
}
