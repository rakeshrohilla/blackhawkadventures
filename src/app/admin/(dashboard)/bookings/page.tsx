import Link from "next/link";

import { BookingBadge, EmptyState, PageHeader, PaymentBadge, TableShell } from "@/components/admin/Ui";
import { BOOKING_STATUS_LABEL } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import type { BookingStatus } from "@/generated/prisma/client";

const STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = STATUSES.includes(status as BookingStatus)
    ? (status as BookingStatus)
    : undefined;

  const [bookings, counts] = await Promise.all([
    prisma.booking.findMany({
      where: activeStatus ? { status: activeStatus } : {},
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { departure: { select: { startDate: true } } },
    }),
    prisma.booking.groupBy({ by: ["status"], _count: true }),
  ]);

  const countFor = (value: BookingStatus) =>
    counts.find((row) => row.status === value)?._count ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bookings"
        subtitle="Newest first. Click a reference to manage the booking."
      />

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/bookings" className={`btn btn-sm ${activeStatus ? "btn-ghost" : "btn-dark"}`}>
          All
        </Link>
        {STATUSES.map((value) => (
          <Link
            key={value}
            href={`/admin/bookings?status=${value}`}
            className={`btn btn-sm ${activeStatus === value ? "btn-dark" : "btn-ghost"}`}
          >
            {BOOKING_STATUS_LABEL[value]} ({countFor(value)})
          </Link>
        ))}
      </div>

      {bookings.length === 0 ? (
        <EmptyState title="Nothing here" body="No bookings match that filter." />
      ) : (
        <TableShell
          head={
            <tr>
              <th className="px-5 py-3">Reference</th>
              <th className="px-5 py-3">Guest</th>
              <th className="px-5 py-3">Trip</th>
              <th className="px-5 py-3">Departs</th>
              <th className="px-5 py-3">Guests</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Booked</th>
            </tr>
          }
        >
          {bookings.map((booking) => (
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
                <p className="text-xs text-ink-400">{booking.customerEmail}</p>
              </td>
              <td className="px-5 py-3.5">{booking.tourTitle}</td>
              <td className="px-5 py-3.5 whitespace-nowrap">
                {formatDate(booking.departure.startDate)}
              </td>
              <td className="px-5 py-3.5">{booking.guests}</td>
              <td className="px-5 py-3.5 whitespace-nowrap font-medium">
                {formatMoney(booking.totalCents, booking.currency)}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex flex-col gap-1.5">
                  <BookingBadge status={booking.status} />
                  <PaymentBadge status={booking.paymentStatus} />
                </div>
              </td>
              <td className="px-5 py-3.5 whitespace-nowrap text-xs text-ink-400">
                {formatDateTime(booking.createdAt)}
              </td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}
