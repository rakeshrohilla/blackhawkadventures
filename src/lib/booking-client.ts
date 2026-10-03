/** Seat helpers that are safe to import into client components
 *  (lib/booking.ts is server-only because it touches the database). */
export type SeatInfo = { capacity: number; seatsBooked: number };

export function seatsLeft(departure: SeatInfo): number {
  return Math.max(0, departure.capacity - departure.seatsBooked);
}
