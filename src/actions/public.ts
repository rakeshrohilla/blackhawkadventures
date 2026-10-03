"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createBooking } from "@/lib/booking";
import { prisma } from "@/lib/db";
import { bookingSchema, enquirySchema, fieldErrors, type ActionState } from "@/lib/validation";

const OWNED_BOOKINGS_COOKIE = "bha_refs";

/** Remembers which references this browser created, so the confirmation page
 *  can be reopened without re-entering the email address. */
async function rememberBooking(reference: string) {
  const jar = await cookies();
  const existing = jar.get(OWNED_BOOKINGS_COOKIE)?.value ?? "";
  const references = new Set(existing.split(",").filter(Boolean));
  references.add(reference);

  jar.set(OWNED_BOOKINGS_COOKIE, [...references].slice(-20).join(","), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function ownsBooking(reference: string): Promise<boolean> {
  const jar = await cookies();
  const value = jar.get(OWNED_BOOKINGS_COOKIE)?.value ?? "";
  return value.split(",").includes(reference);
}

export async function submitEnquiry(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = enquirySchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      errors: fieldErrors(parsed.error),
      message: "Please check the highlighted fields.",
    };
  }

  const { tourId, ...rest } = parsed.data;

  // Only attach the tour if it really exists, so a stale form can't 500.
  const tourExists = tourId
    ? await prisma.tour.findUnique({ where: { id: tourId }, select: { id: true } })
    : null;

  await prisma.enquiry.create({
    data: { ...rest, tourId: tourExists?.id },
  });

  return {
    ok: true,
    message: "Got it. We reply to every enquiry within one working day.",
  };
}

export async function createBookingAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = bookingSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      errors: fieldErrors(parsed.error),
      message: "Please check the highlighted fields.",
    };
  }

  const names = formData.getAll("travellerName").map((value) => String(value).trim());
  const ages = formData.getAll("travellerAge").map((value) => String(value).trim());

  const travellers = names
    .map((fullName, index) => ({
      fullName,
      age: ages[index] ? Number(ages[index]) : undefined,
    }))
    .filter((traveller) => traveller.fullName.length > 1);

  const result = await createBooking({
    ...parsed.data,
    travellers:
      travellers.length > 0
        ? travellers
        : [{ fullName: parsed.data.customerName }],
  });

  if (!result.ok) {
    return { ok: false, message: result.error };
  }

  await rememberBooking(result.reference);
  redirect(`/book/confirmation/${result.reference}`);
}

export async function lookupBookingAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const reference = String(formData.get("reference") ?? "")
    .trim()
    .toUpperCase();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!reference || !email) {
    return { ok: false, message: "Enter both your booking reference and email address." };
  }

  const booking = await prisma.booking.findUnique({
    where: { reference },
    select: { reference: true, customerEmail: true },
  });

  if (!booking || booking.customerEmail.toLowerCase() !== email) {
    return {
      ok: false,
      message: "We could not find a booking with that reference and email address.",
    };
  }

  redirect(`/book/confirmation/${booking.reference}?email=${encodeURIComponent(email)}`);
}
