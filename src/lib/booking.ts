import "server-only";

import { randomBytes } from "node:crypto";

import { prisma } from "./db";
import { DEPOSIT_PERCENT } from "./constants";
import { seatsLeft, type SeatInfo } from "./booking-client";
import type { DepartureStatus } from "@/generated/prisma/client";

export { seatsLeft } from "./booking-client";
export type { SeatInfo } from "./booking-client";

/** Unambiguous alphabet — no O/0, I/1, B/8. */
const REFERENCE_ALPHABET = "ACDEFGHJKLMNPQRSTUVWXYZ2345679";

export function generateReference(): string {
  const bytes = randomBytes(6);
  let code = "";
  for (const byte of bytes) code += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length];
  return `BHA-${code}`;
}

export function depositCents(totalCents: number): number {
  return Math.round((totalCents * DEPOSIT_PERCENT) / 100);
}

export function isBookable(departure: SeatInfo & { status: DepartureStatus; startDate: Date }): boolean {
  if (departure.status === "CANCELLED" || departure.status === "FULL") return false;
  if (departure.startDate.getTime() <= Date.now()) return false;
  return seatsLeft(departure) > 0;
}

export type CreateBookingInput = {
  departureId: string;
  guests: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCountry?: string;
  notes?: string;
  travellers?: { fullName: string; age?: number; dietary?: string; emergencyContact?: string }[];
};

export type CreateBookingResult =
  | { ok: true; reference: string; totalCents: number; currency: string }
  | { ok: false; error: string };

/**
 * Creates a booking and claims seats in one transaction.
 *
 * Seats are claimed with a conditional UPDATE — the row is only incremented if
 * it still has room at write time — so two people checking out simultaneously
 * can never oversell a departure.
 */
export async function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  return prisma.$transaction(async (tx): Promise<CreateBookingResult> => {
    const departure = await tx.departure.findUnique({
      where: { id: input.departureId },
      include: { tour: { select: { title: true, slug: true, basePriceCents: true, currency: true } } },
    });

    if (!departure) return { ok: false, error: "That departure no longer exists." };
    if (departure.status === "CANCELLED") {
      return { ok: false, error: "That departure has been cancelled. Please choose another date." };
    }
    if (departure.startDate.getTime() <= Date.now()) {
      return { ok: false, error: "That departure has already left. Please choose another date." };
    }

    const unitPriceCents = departure.priceCents ?? departure.tour.basePriceCents;
    const totalCents = unitPriceCents * input.guests;

    const claimed = await tx.departure.updateMany({
      where: {
        id: departure.id,
        seatsBooked: { lte: departure.capacity - input.guests },
      },
      data: { seatsBooked: { increment: input.guests } },
    });

    if (claimed.count !== 1) {
      const remaining = seatsLeft(departure);
      return {
        ok: false,
        error:
          remaining === 0
            ? "This departure just sold out."
            : `Only ${remaining} seat${remaining === 1 ? "" : "s"} left on this departure.`,
      };
    }

    const travellers = (input.travellers ?? []).filter((traveller) => traveller.fullName.trim());

    let reference = generateReference();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const existing = await tx.booking.findUnique({ where: { reference }, select: { id: true } });
      if (!existing) break;
      reference = generateReference();
    }

    await tx.booking.create({
      data: {
        reference,
        departureId: departure.id,
        tourTitle: departure.tour.title,
        tourSlug: departure.tour.slug,
        startDate: departure.startDate,
        guests: input.guests,
        unitPriceCents,
        totalCents,
        currency: departure.tour.currency,
        customerName: input.customerName,
        customerEmail: input.customerEmail.toLowerCase(),
        customerPhone: input.customerPhone,
        customerCountry: input.customerCountry,
        notes: input.notes,
        travellers: {
          create: travellers.map((traveller, index) => ({
            fullName: traveller.fullName,
            age: traveller.age,
            dietary: traveller.dietary,
            emergencyContact: traveller.emergencyContact,
            isLead: index === 0,
          })),
        },
      },
    });

    // Close the departure once it fills up.
    const after = await tx.departure.findUnique({
      where: { id: departure.id },
      select: { seatsBooked: true, capacity: true, status: true },
    });
    if (after && after.seatsBooked >= after.capacity && after.status !== "CANCELLED") {
      await tx.departure.update({ where: { id: departure.id }, data: { status: "FULL" } });
    }

    return { ok: true, reference, totalCents, currency: departure.tour.currency };
  });
}

/** Releases the seats a booking was holding and marks it cancelled. */
export async function cancelBooking(bookingId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, guests: true, status: true, departureId: true },
    });
    if (!booking || booking.status === "CANCELLED") return;

    await tx.booking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    const departure = await tx.departure.findUnique({
      where: { id: booking.departureId },
      select: { seatsBooked: true, status: true },
    });
    if (!departure) return;

    await tx.departure.update({
      where: { id: booking.departureId },
      data: {
        seatsBooked: Math.max(0, departure.seatsBooked - booking.guests),
        // Re-open a departure that was only full because of this booking.
        ...(departure.status === "FULL" ? { status: "SCHEDULED" as DepartureStatus } : {}),
      },
    });
  });
}
