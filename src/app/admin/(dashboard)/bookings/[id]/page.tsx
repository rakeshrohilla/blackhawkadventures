import Link from "next/link";
import { notFound } from "next/navigation";

import { updateBookingAction } from "@/actions/admin";
import { BookingBadge, PageHeader, PaymentBadge } from "@/components/admin/Ui";
import { depositCents } from "@/lib/booking";
import {
  BOOKING_STATUS_LABEL,
  DEPOSIT_PERCENT,
  PAYMENT_STATUS_LABEL,
} from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDateLong, formatDateTime, formatMoney } from "@/lib/format";
import type { BookingStatus, PaymentStatus } from "@/generated/prisma/client";

const STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
const PAYMENTS: PaymentStatus[] = ["UNPAID", "DEPOSIT_PAID", "PAID", "REFUNDED"];

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      travellers: { orderBy: { isLead: "desc" } },
      departure: { include: { tour: { select: { id: true, title: true, slug: true } } } },
    },
  });

  if (!booking) notFound();

  const deposit = depositCents(booking.totalCents);

  return (
    <div className="space-y-8">
      <PageHeader
        title={booking.reference}
        subtitle={`Booked ${formatDateTime(booking.createdAt)}`}
        action={
          <Link href="/admin/bookings" className="btn btn-ghost btn-sm">
            All bookings
          </Link>
        }
      />

      <div className="grid gap-7 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-7">
          <section className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="display-3 text-lg">{booking.tourTitle}</h2>
                <p className="mt-1 text-sm text-ink-400">
                  {formatDateLong(booking.departure.startDate)} —{" "}
                  {formatDateLong(booking.departure.endDate)}
                </p>
              </div>
              <div className="flex gap-2">
                <BookingBadge status={booking.status} />
                <PaymentBadge status={booking.paymentStatus} />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-ink/8 pt-5 text-sm">
              <Link
                href={`/admin/tours/${booking.departure.tour.id}`}
                className="font-semibold text-ember hover:underline"
              >
                Manage this trip →
              </Link>
              <span className="text-ink-300">·</span>
              <span className="text-ink-400">
                Departure: {booking.departure.seatsBooked}/{booking.departure.capacity} seats booked
              </span>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="display-3 text-lg">Travellers ({booking.guests})</h2>
            <ul className="mt-5 divide-y divide-ink/8">
              {booking.travellers.map((traveller) => (
                <li key={traveller.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium">
                      {traveller.fullName}
                      {traveller.isLead ? (
                        <span className="ml-2 text-[0.7rem] font-bold uppercase tracking-wide text-ember">
                          Lead
                        </span>
                      ) : null}
                    </p>
                    {traveller.dietary ? (
                      <p className="mt-0.5 text-xs text-ink-400">Dietary: {traveller.dietary}</p>
                    ) : null}
                  </div>
                  {traveller.age ? (
                    <p className="shrink-0 text-sm text-ink-400">{traveller.age} yrs</p>
                  ) : null}
                </li>
              ))}
            </ul>

            {booking.notes ? (
              <div className="mt-5 rounded-xl bg-mist p-4">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
                  Guest notes
                </p>
                <p className="mt-1.5 text-sm leading-relaxed">{booking.notes}</p>
              </div>
            ) : null}
          </section>

          <section className="card p-6">
            <h2 className="display-3 text-lg">Manage</h2>
            <form action={updateBookingAction} className="mt-5 space-y-5">
              <input type="hidden" name="id" value={booking.id} />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="status">
                    Booking status
                  </label>
                  <select id="status" name="status" className="select" defaultValue={booking.status}>
                    {STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {BOOKING_STATUS_LABEL[value]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="paymentStatus">
                    Payment status
                  </label>
                  <select
                    id="paymentStatus"
                    name="paymentStatus"
                    className="select"
                    defaultValue={booking.paymentStatus}
                  >
                    {PAYMENTS.map((value) => (
                      <option key={value} value={value}>
                        {PAYMENT_STATUS_LABEL[value]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="internalNotes">
                  Internal notes (never shown to the guest)
                </label>
                <textarea
                  id="internalNotes"
                  name="internalNotes"
                  className="textarea min-h-24"
                  defaultValue={booking.internalNotes ?? ""}
                />
              </div>

              <p className="rounded-xl bg-mist px-4 py-3 text-xs leading-relaxed text-ink-400">
                Setting the status to Cancelled releases these {booking.guests} seat
                {booking.guests === 1 ? "" : "s"} back to the departure automatically.
              </p>

              <button type="submit" className="btn btn-primary">
                Save changes
              </button>
            </form>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-6">
            <h2 className="display-3 text-lg">Contact</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
                  Name
                </dt>
                <dd className="mt-0.5 font-medium">{booking.customerName}</dd>
              </div>
              <div>
                <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
                  Email
                </dt>
                <dd className="mt-0.5">
                  <a href={`mailto:${booking.customerEmail}`} className="font-medium text-ember hover:underline">
                    {booking.customerEmail}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
                  Phone
                </dt>
                <dd className="mt-0.5">
                  <a href={`tel:${booking.customerPhone}`} className="font-medium text-ember hover:underline">
                    {booking.customerPhone}
                  </a>
                </dd>
              </div>
              {booking.customerCountry ? (
                <div>
                  <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
                    Country
                  </dt>
                  <dd className="mt-0.5 font-medium">{booking.customerCountry}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="card bg-ink p-6 text-mist">
            <h2 className="font-display text-base font-semibold text-white">Money</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-white/55">Per person</dt>
                <dd className="font-medium">
                  {formatMoney(booking.unitPriceCents, booking.currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/55">Travellers</dt>
                <dd className="font-medium">× {booking.guests}</dd>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3">
                <dt className="font-semibold text-white">Total</dt>
                <dd className="font-display text-lg font-bold text-white">
                  {formatMoney(booking.totalCents, booking.currency)}
                </dd>
              </div>
              <div className="flex justify-between text-ember">
                <dt>Deposit ({DEPOSIT_PERCENT}%)</dt>
                <dd className="font-semibold">{formatMoney(deposit, booking.currency)}</dd>
              </div>
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="display-3 text-lg">Timeline</h2>
            <ul className="mt-4 space-y-3 text-xs text-ink-400">
              <li>Created {formatDateTime(booking.createdAt)}</li>
              {booking.confirmedAt ? <li>Confirmed {formatDateTime(booking.confirmedAt)}</li> : null}
              {booking.cancelledAt ? <li>Cancelled {formatDateTime(booking.cancelledAt)}</li> : null}
              <li>Last updated {formatDateTime(booking.updatedAt)}</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
