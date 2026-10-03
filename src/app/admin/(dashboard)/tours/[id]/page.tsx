import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteTourAction } from "@/actions/admin";
import { DepartureEditor } from "@/components/admin/DepartureEditor";
import { ItineraryEditor } from "@/components/admin/ItineraryEditor";
import { TourForm } from "@/components/admin/TourForm";
import { PageHeader } from "@/components/admin/Ui";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function EditTourPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ id }, { created }, user] = await Promise.all([params, searchParams, getSessionUser()]);

  const tour = await prisma.tour.findUnique({
    where: { id },
    include: {
      itinerary: { orderBy: { dayNumber: "asc" } },
      departures: { orderBy: { startDate: "asc" } },
      _count: { select: { reviews: true } },
    },
  });

  if (!tour) notFound();

  const bookingCount = await prisma.booking.count({ where: { departure: { tourId: tour.id } } });

  return (
    <div className="space-y-8">
      <PageHeader
        title={tour.title}
        subtitle={`${tour.region} · ${tour.durationDays} days · ${bookingCount} bookings all time`}
        action={
          <div className="flex gap-2">
            <Link href="/admin/tours" className="btn btn-ghost btn-sm">
              All trips
            </Link>
            <Link href={`/tours/${tour.slug}`} target="_blank" className="btn btn-dark btn-sm">
              Preview
            </Link>
          </div>
        }
      />

      {created ? (
        <div className="rounded-xl border border-teal/30 bg-teal-tint px-4 py-3 text-sm font-medium text-teal">
          Trip created. Now add an itinerary and at least one departure date so it can be booked.
        </div>
      ) : null}

      <DepartureEditor
        tourId={tour.id}
        durationDays={tour.durationDays}
        defaultCapacity={tour.groupSizeMax}
        currency={tour.currency}
        basePriceCents={tour.basePriceCents}
        departures={tour.departures}
      />

      <ItineraryEditor tourId={tour.id} days={tour.itinerary} />

      <div>
        <h2 className="display-3 mb-5 text-lg">Trip details</h2>
        <TourForm tour={tour} />
      </div>

      {user?.role === "ADMIN" ? (
        <section className="card border-ember/30 p-6">
          <h2 className="display-3 text-lg">Danger zone</h2>
          <p className="mt-2 max-w-xl text-sm text-ink-400">
            {bookingCount > 0
              ? `This trip has ${bookingCount} booking${bookingCount === 1 ? "" : "s"}, so it cannot be deleted. Removing it will unpublish and un-feature it instead, keeping all booking history intact.`
              : "This trip has no bookings, so it will be permanently deleted along with its itinerary and departures."}
          </p>
          <form action={deleteTourAction} className="mt-5">
            <input type="hidden" name="id" value={tour.id} />
            <button type="submit" className="btn btn-sm bg-ember-dark text-white hover:bg-ember">
              {bookingCount > 0 ? "Retire this trip" : "Delete this trip"}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
