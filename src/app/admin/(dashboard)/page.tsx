import Link from "next/link";

import {
  BookingBadge,
  DepartureBadge,
  EmptyState,
  PageHeader,
  StatCard,
  TableShell,
} from "@/components/admin/Ui";
import { seatsLeft } from "@/lib/booking";
import { prisma } from "@/lib/db";
import { formatDate, formatDateRange, formatMoney } from "@/lib/format";

export default async function AdminDashboard() {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [
    pendingBookings,
    confirmedThisMonth,
    revenue,
    newEnquiries,
    publishedTours,
    recentBookings,
    upcomingDepartures,
    latestEnquiries,
  ] = await Promise.all([
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({
      where: { status: { in: ["CONFIRMED", "COMPLETED"] }, createdAt: { gte: monthStart } },
    }),
    prisma.booking.aggregate({
      where: { status: { in: ["CONFIRMED", "COMPLETED"] } },
      _sum: { totalCents: true },
    }),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.tour.count({ where: { published: true } }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { departure: { select: { startDate: true } } },
    }),
    prisma.departure.findMany({
      where: { startDate: { gt: now }, status: { not: "CANCELLED" } },
      orderBy: { startDate: "asc" },
      take: 6,
      include: { tour: { select: { title: true, slug: true } } },
    }),
    prisma.enquiry.findMany({
      where: { status: "NEW" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { tour: { select: { title: true } } },
    }),
  ]);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Dashboard"
        subtitle="Everything that needs a human today."
        action={
          <Link href="/admin/tours/new" className="btn btn-primary btn-sm">
            New trip
          </Link>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Bookings to action"
          value={String(pendingBookings)}
          sub="Pending confirmation"
          href="/admin/bookings?status=PENDING"
          accent={pendingBookings > 0}
        />
        <StatCard
          label="New enquiries"
          value={String(newEnquiries)}
          sub="Unanswered"
          href="/admin/enquiries"
          accent={newEnquiries > 0}
        />
        <StatCard
          label="Confirmed this month"
          value={String(confirmedThisMonth)}
          sub={formatDate(monthStart) + " onwards"}
          href="/admin/bookings"
        />
        <StatCard
          label="Confirmed revenue"
          value={formatMoney(revenue._sum.totalCents ?? 0)}
          sub={`${publishedTours} trips published`}
        />
      </div>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="display-3 text-lg">Latest bookings</h2>
          <Link href="/admin/bookings" className="text-sm font-semibold text-ember hover:underline">
            All bookings
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <EmptyState title="No bookings yet" body="They will appear here the moment someone books." />
        ) : (
          <TableShell
            head={
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Guest</th>
                <th className="px-5 py-3">Trip</th>
                <th className="px-5 py-3">Departs</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            }
          >
            {recentBookings.map((booking) => (
              <tr key={booking.id} className="transition-colors hover:bg-mist/60">
                <td className="px-5 py-3.5">
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="font-mono text-xs font-semibold text-ember hover:underline"
                  >
                    {booking.reference}
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  <p className="font-medium">{booking.customerName}</p>
                  <p className="text-xs text-ink-400">{booking.guests} travelling</p>
                </td>
                <td className="px-5 py-3.5">{booking.tourTitle}</td>
                <td className="px-5 py-3.5 whitespace-nowrap">
                  {formatDate(booking.departure.startDate)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap font-medium">
                  {formatMoney(booking.totalCents, booking.currency)}
                </td>
                <td className="px-5 py-3.5">
                  <BookingBadge status={booking.status} />
                </td>
              </tr>
            ))}
          </TableShell>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-5 flex items-end justify-between">
            <h2 className="display-3 text-lg">Next departures</h2>
            <Link href="/admin/departures" className="text-sm font-semibold text-ember hover:underline">
              All dates
            </Link>
          </div>
          <div className="card divide-y divide-ink/8">
            {upcomingDepartures.map((departure) => {
              const remaining = seatsLeft(departure);
              return (
                <div key={departure.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{departure.tour.title}</p>
                    <p className="mt-0.5 text-xs text-ink-400">
                      {formatDateRange(departure.startDate, departure.endDate)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`text-xs font-semibold ${
                        remaining === 0 ? "text-ink-400" : remaining <= 3 ? "text-ember-dark" : "text-teal"
                      }`}
                    >
                      {departure.seatsBooked}/{departure.capacity}
                    </span>
                    <DepartureBadge status={departure.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between">
            <h2 className="display-3 text-lg">New enquiries</h2>
            <Link href="/admin/enquiries" className="text-sm font-semibold text-ember hover:underline">
              Inbox
            </Link>
          </div>
          {latestEnquiries.length === 0 ? (
            <EmptyState title="Inbox clear" body="No unanswered enquiries. Nice." />
          ) : (
            <div className="card divide-y divide-ink/8">
              {latestEnquiries.map((enquiry) => (
                <div key={enquiry.id} className="px-5 py-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold">{enquiry.name}</p>
                    <p className="shrink-0 text-xs text-ink-400">{formatDate(enquiry.createdAt)}</p>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-400">
                    {enquiry.subject ? `${enquiry.subject} — ` : ""}
                    {enquiry.message}
                  </p>
                  {enquiry.tour ? (
                    <p className="mt-1.5 text-[0.7rem] font-semibold text-ember">
                      {enquiry.tour.title}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
