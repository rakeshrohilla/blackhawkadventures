import Link from "next/link";

import { DepartureBadge, EmptyState, PageHeader, TableShell } from "@/components/admin/Ui";
import { seatsLeft } from "@/lib/booking";
import { prisma } from "@/lib/db";
import { formatDateRange, formatMoney } from "@/lib/format";

export default async function AdminDeparturesPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const { show } = await searchParams;
  const past = show === "past";
  const now = new Date();

  const departures = await prisma.departure.findMany({
    where: past ? { startDate: { lte: now } } : { startDate: { gt: now } },
    orderBy: { startDate: past ? "desc" : "asc" },
    include: {
      tour: { select: { id: true, title: true, basePriceCents: true, currency: true } },
      _count: { select: { bookings: true } },
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Departures"
        subtitle="Every dated instance of a trip. Edit a date from its trip page."
        action={
          <div className="flex gap-2">
            <Link
              href="/admin/departures"
              className={`btn btn-sm ${past ? "btn-ghost" : "btn-dark"}`}
            >
              Upcoming
            </Link>
            <Link
              href="/admin/departures?show=past"
              className={`btn btn-sm ${past ? "btn-dark" : "btn-ghost"}`}
            >
              Past
            </Link>
          </div>
        }
      />

      {departures.length === 0 ? (
        <EmptyState
          title={past ? "No past departures" : "No upcoming departures"}
          body={
            past
              ? "Completed trips will be listed here."
              : "Add dates from a trip's page so people can book."
          }
          action={
            <Link href="/admin/tours" className="btn btn-primary btn-sm">
              Go to trips
            </Link>
          }
        />
      ) : (
        <TableShell
          head={
            <tr>
              <th className="px-5 py-3">Trip</th>
              <th className="px-5 py-3">Dates</th>
              <th className="px-5 py-3">Seats</th>
              <th className="px-5 py-3">Bookings</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          }
        >
          {departures.map((departure) => {
            const remaining = seatsLeft(departure);
            const fillRate = Math.round((departure.seatsBooked / departure.capacity) * 100);

            return (
              <tr key={departure.id} className="transition-colors hover:bg-mist/60">
                <td className="px-5 py-3.5">
                  <Link
                    href={`/admin/tours/${departure.tour.id}`}
                    className="font-semibold transition-colors hover:text-ember"
                  >
                    {departure.tour.title}
                  </Link>
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  {formatDateRange(departure.startDate, departure.endDate)}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-mist-200">
                      <div
                        className={`h-full rounded-full ${fillRate >= 100 ? "bg-ink" : "bg-ember"}`}
                        style={{ width: `${Math.min(100, fillRate)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap">
                      {departure.seatsBooked}/{departure.capacity}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.7rem] text-ink-400">{remaining} left</p>
                </td>
                <td className="px-5 py-3.5">{departure._count.bookings}</td>
                <td className="px-5 py-3.5 whitespace-nowrap font-medium">
                  {formatMoney(
                    departure.priceCents ?? departure.tour.basePriceCents,
                    departure.tour.currency,
                  )}
                  {departure.priceCents ? (
                    <span className="ml-1 text-[0.7rem] text-ember">override</span>
                  ) : null}
                </td>
                <td className="px-5 py-3.5">
                  <DepartureBadge status={departure.status} />
                </td>
              </tr>
            );
          })}
        </TableShell>
      )}
    </div>
  );
}
