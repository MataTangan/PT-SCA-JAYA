export interface DateParts {
  year: number;
  month: number;
  day: number;
}

/** Parse a strict YYYY-MM-DD value as a UTC calendar date. */
export function parseIsoDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new RangeError(`Invalid ISO date: ${value}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError(`Invalid calendar date: ${value}`);
  }
  return date;
}

/** Number of nights between two ISO dates. Requires check-out > check-in. */
export function calculateNights(checkInDate: string, checkOutDate: string): number {
  const checkIn = parseIsoDate(checkInDate);
  const checkOut = parseIsoDate(checkOutDate);
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
  if (nights <= 0) {
    throw new RangeError("Check-out date must be after check-in date");
  }
  return nights;
}

/** Total price for a stay. Monetary values are kept as numbers (IDR has no cents). */
export function calculateTotalAmount(ratePerNight: number, nights: number, roomCount = 1): number {
  if (!Number.isFinite(ratePerNight) || ratePerNight <= 0) {
    throw new RangeError("Rate per night must be greater than zero");
  }
  if (!Number.isInteger(nights) || nights <= 0) {
    throw new RangeError("Nights must be a positive integer");
  }
  if (!Number.isInteger(roomCount) || roomCount <= 0) {
    throw new RangeError("Room count must be a positive integer");
  }
  return Math.round(ratePerNight * nights * roomCount * 100) / 100;
}

export function todayIso(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function addDaysIso(value: string, days: number): string {
  const date = parseIsoDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
