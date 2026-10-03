import Link from "next/link";

import { EmptyState, PageHeader, TableShell } from "@/components/admin/Ui";
import { toggleTourFeaturedAction, toggleTourPublishedAction } from "@/actions/admin";
import { prisma } from "@/lib/db";
import { DIFFICULTY_LABEL } from "@/lib/constants";
import { formatMoney } from "@/lib/format";

export default async function AdminToursPage() {
  const tours = await prisma.tour.findMany({
    orderBy: [{ published: "desc" }, { createdAt: "asc" }],
    include: {
      _count: { select: { departures: true, itinerary: true } },
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Trips"
        subtitle="Everything you sell. Unpublished trips are invisible on the website."
        action={
          <Link href="/admin/tours/new" className="btn btn-primary btn-sm">
            New trip
          </Link>
        }
      />

      {tours.length === 0 ? (
        <EmptyState
          title="No trips yet"
          body="Create your first trip and add some departure dates to it."
          action={
            <Link href="/admin/tours/new" className="btn btn-primary btn-sm">
              New trip
            </Link>
          }
        />
      ) : (
        <TableShell
          head={
            <tr>
              <th className="px-5 py-3">Trip</th>
              <th className="px-5 py-3">Region</th>
              <th className="px-5 py-3">Days</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Content</th>
              <th className="px-5 py-3">Visibility</th>
            </tr>
          }
        >
          {tours.map((tour) => (
            <tr key={tour.id} className="transition-colors hover:bg-mist/60">
              <td className="px-5 py-3.5">
                <Link
                  href={`/admin/tours/${tour.id}`}
                  className="font-semibold transition-colors hover:text-ember"
                >
                  {tour.title}
                </Link>
                <p className="mt-0.5 font-mono text-[0.7rem] text-ink-400">/{tour.slug}</p>
              </td>
              <td className="px-5 py-3.5">
                {tour.region}
                <p className="mt-0.5 text-xs text-ink-400">{DIFFICULTY_LABEL[tour.difficulty]}</p>
              </td>
              <td className="px-5 py-3.5">{tour.durationDays}</td>
              <td className="px-5 py-3.5 whitespace-nowrap font-medium">
                {formatMoney(tour.basePriceCents, tour.currency)}
              </td>
              <td className="px-5 py-3.5 text-xs text-ink-400">
                {tour._count.itinerary} days
                <br />
                {tour._count.departures} dates
              </td>
              <td className="px-5 py-3.5">
                <div className="flex flex-col gap-1.5">
                  <form action={toggleTourPublishedAction}>
                    <input type="hidden" name="id" value={tour.id} />
                    <button
                      type="submit"
                      className={`pill w-full justify-center ${
                        tour.published ? "bg-teal-tint text-teal" : "bg-mist-200 text-ink-400"
                      }`}
                    >
                      {tour.published ? "Published" : "Draft"}
                    </button>
                  </form>
                  <form action={toggleTourFeaturedAction}>
                    <input type="hidden" name="id" value={tour.id} />
                    <button
                      type="submit"
                      className={`pill w-full justify-center ${
                        tour.featured ? "bg-ember-tint text-ember-dark" : "bg-mist-200 text-ink-400"
                      }`}
                    >
                      {tour.featured ? "Featured" : "Not featured"}
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}
