export interface TodaySummary {
  date: string;
  rooms: {
    total: number;
    available: number;
    reserved: number;
    occupied: number;
    clean: number;
    dirty: number;
    cleaning: number;
  };
  arrivalsToday: number;
  inHouse: number;
  departuresToday: number;
  pendingReservations: number;
  unpaidPayments: number;
}
