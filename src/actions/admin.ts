"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { cancelBooking } from "@/lib/booking";
import { prisma } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { SETTING_DEFAULTS, type SettingKey } from "@/lib/settings-defaults";
import {
  departureSchema,
  fieldErrors,
  itineraryDaySchema,
  reviewSchema,
  tourSchema,
  type ActionState,
} from "@/lib/validation";

function isUniqueConstraintError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "P2002");
}

function refreshPublicPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/tours");
  if (slug) revalidatePath(`/tours/${slug}`);
}

/* -------------------------------------------------------------------- tours */

export async function saveTourAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const id = String(formData.get("id") ?? "").trim();
  const parsed = tourSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      errors: fieldErrors(parsed.error),
      message: "Some fields need attention.",
    };
  }

  const { basePrice, slug, ...rest } = parsed.data;
  const finalSlug = slugify(slug || rest.title);

  const data = { ...rest, slug: finalSlug, basePriceCents: basePrice };

  try {
    if (id) {
      await prisma.tour.update({ where: { id }, data });
    } else {
      const created = await prisma.tour.create({ data });
      revalidatePath("/admin/tours");
      refreshPublicPages(finalSlug);
      redirect(`/admin/tours/${created.id}?created=1`);
    }
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        ok: false,
        errors: { slug: "Another trip already uses that URL slug." },
        message: "That slug is taken.",
      };
    }
    throw error;
  }

  revalidatePath("/admin/tours");
  revalidatePath(`/admin/tours/${id}`);
  refreshPublicPages(finalSlug);

  return { ok: true, message: "Trip saved." };
}

export async function toggleTourPublishedAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "");

  const tour = await prisma.tour.findUnique({ where: { id }, select: { published: true, slug: true } });
  if (!tour) return;

  await prisma.tour.update({ where: { id }, data: { published: !tour.published } });
  revalidatePath("/admin/tours");
  refreshPublicPages(tour.slug);
}

export async function toggleTourFeaturedAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "");

  const tour = await prisma.tour.findUnique({ where: { id }, select: { featured: true, slug: true } });
  if (!tour) return;

  await prisma.tour.update({ where: { id }, data: { featured: !tour.featured } });
  revalidatePath("/admin/tours");
  refreshPublicPages(tour.slug);
}

export async function deleteTourAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const bookingCount = await prisma.booking.count({ where: { departure: { tourId: id } } });
  if (bookingCount > 0) {
    // Never destroy booking history — retire the trip instead.
    await prisma.tour.update({ where: { id }, data: { published: false, featured: false } });
  } else {
    await prisma.tour.delete({ where: { id } });
  }

  revalidatePath("/admin/tours");
  refreshPublicPages();
  redirect("/admin/tours");
}

/* ---------------------------------------------------------------- itinerary */

export async function saveItineraryDayAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const id = String(formData.get("id") ?? "").trim();
  const parsed = itineraryDaySchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error), message: "Check the day's fields." };
  }

  const { tourId, dayNumber, ...rest } = parsed.data;

  try {
    if (id) {
      await prisma.itineraryDay.update({ where: { id }, data: { dayNumber, ...rest } });
    } else {
      await prisma.itineraryDay.create({ data: { tourId, dayNumber, ...rest } });
    }
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { ok: false, errors: { dayNumber: `Day ${dayNumber} already exists on this trip.` } };
    }
    throw error;
  }

  const tour = await prisma.tour.findUnique({ where: { id: tourId }, select: { slug: true } });
  revalidatePath(`/admin/tours/${tourId}`);
  refreshPublicPages(tour?.slug);

  return { ok: true, message: `Day ${dayNumber} saved.` };
}

export async function deleteItineraryDayAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "");

  const day = await prisma.itineraryDay.findUnique({
    where: { id },
    select: { tourId: true, tour: { select: { slug: true } } },
  });
  if (!day) return;

  await prisma.itineraryDay.delete({ where: { id } });
  revalidatePath(`/admin/tours/${day.tourId}`);
  refreshPublicPages(day.tour.slug);
}

/* --------------------------------------------------------------- departures */

export async function saveDepartureAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const id = String(formData.get("id") ?? "").trim();
  const parsed = departureSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error), message: "Check the departure dates." };
  }

  const { tourId, price, ...rest } = parsed.data;

  if (id) {
    const existing = await prisma.departure.findUnique({
      where: { id },
      select: { seatsBooked: true },
    });
    if (existing && rest.capacity < existing.seatsBooked) {
      return {
        ok: false,
        errors: {
          capacity: `${existing.seatsBooked} seats are already booked — capacity cannot go below that.`,
        },
      };
    }
    await prisma.departure.update({ where: { id }, data: { ...rest, priceCents: price ?? null } });
  } else {
    await prisma.departure.create({ data: { tourId, ...rest, priceCents: price ?? null } });
  }

  const tour = await prisma.tour.findUnique({ where: { id: tourId }, select: { slug: true } });
  revalidatePath("/admin/departures");
  revalidatePath(`/admin/tours/${tourId}`);
  refreshPublicPages(tour?.slug);

  return { ok: true, message: "Departure saved." };
}

export async function deleteDepartureAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "");

  const departure = await prisma.departure.findUnique({
    where: { id },
    select: { tourId: true, tour: { select: { slug: true } }, _count: { select: { bookings: true } } },
  });
  if (!departure) return;

  if (departure._count.bookings > 0) {
    // Bookings exist — cancel the date rather than deleting the record.
    await prisma.departure.update({ where: { id }, data: { status: "CANCELLED" } });
  } else {
    await prisma.departure.delete({ where: { id } });
  }

  revalidatePath("/admin/departures");
  revalidatePath(`/admin/tours/${departure.tourId}`);
  refreshPublicPages(departure.tour.slug);
}

/* ----------------------------------------------------------------- bookings */

export async function updateBookingAction(formData: FormData): Promise<void> {
  await requireUser();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const paymentStatus = String(formData.get("paymentStatus") ?? "");
  const internalNotes = String(formData.get("internalNotes") ?? "");

  const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
  const validPayments = ["UNPAID", "DEPOSIT_PAID", "PAID", "REFUNDED"];

  if (!validStatuses.includes(status) || !validPayments.includes(paymentStatus)) return;

  const existing = await prisma.booking.findUnique({ where: { id }, select: { status: true } });
  if (!existing) return;

  // Cancelling has to release the seats, so it goes through the booking engine.
  if (status === "CANCELLED" && existing.status !== "CANCELLED") {
    await cancelBooking(id);
    await prisma.booking.update({
      where: { id },
      data: { paymentStatus: paymentStatus as never, internalNotes: internalNotes || null },
    });
  } else {
    await prisma.booking.update({
      where: { id },
      data: {
        status: status as never,
        paymentStatus: paymentStatus as never,
        internalNotes: internalNotes || null,
        confirmedAt:
          status === "CONFIRMED" && existing.status !== "CONFIRMED" ? new Date() : undefined,
      },
    });
  }

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${id}`);
  revalidatePath("/admin");
}

/* ---------------------------------------------------------------- enquiries */

export async function updateEnquiryStatusAction(formData: FormData): Promise<void> {
  await requireUser();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["NEW", "IN_PROGRESS", "CLOSED"].includes(status)) return;

  await prisma.enquiry.update({
    where: { id },
    data: {
      status: status as never,
      handledAt: status === "CLOSED" ? new Date() : null,
    },
  });

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}

export async function deleteEnquiryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await prisma.enquiry.delete({ where: { id: String(formData.get("id") ?? "") } });
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}

/* ------------------------------------------------------------------ reviews */

export async function saveReviewAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const id = String(formData.get("id") ?? "").trim();
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error), message: "Check the review fields." };
  }

  const { tourId, ...rest } = parsed.data;
  const tour = tourId
    ? await prisma.tour.findUnique({ where: { id: tourId }, select: { id: true, slug: true } })
    : null;

  if (id) {
    await prisma.review.update({ where: { id }, data: { ...rest, tourId: tour?.id ?? null } });
  } else {
    await prisma.review.create({ data: { ...rest, tourId: tour?.id ?? null } });
  }

  revalidatePath("/admin/reviews");
  refreshPublicPages(tour?.slug);

  return { ok: true, message: "Review saved." };
}

export async function toggleReviewPublishedAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = String(formData.get("id") ?? "");

  const review = await prisma.review.findUnique({
    where: { id },
    select: { published: true, tour: { select: { slug: true } } },
  });
  if (!review) return;

  await prisma.review.update({ where: { id }, data: { published: !review.published } });
  revalidatePath("/admin/reviews");
  refreshPublicPages(review.tour?.slug);
}

export async function deleteReviewAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const review = await prisma.review.findUnique({
    where: { id },
    select: { tour: { select: { slug: true } } },
  });

  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  refreshPublicPages(review?.tour?.slug);
}

/* ----------------------------------------------------------------- settings */

export async function saveSettingsAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const keys = Object.keys(SETTING_DEFAULTS) as SettingKey[];

  await prisma.$transaction(
    keys.map((key) => {
      const value = String(formData.get(key) ?? "").slice(0, 2000);
      return prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }),
  );

  revalidatePath("/", "layout");

  return { ok: true, message: "Settings saved." };
}
