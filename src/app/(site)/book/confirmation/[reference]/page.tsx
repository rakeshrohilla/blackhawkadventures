import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingLookupForm } from "@/components/site/BookingLookupForm";
import { Icon } from "@/components/site/Icon";
import { ownsBooking } from "@/actions/public";
import { depositCents } from "@/lib/booking";
import { BOOKING_STATUS_LABEL, DEPOSIT_PERCENT, PAYMENT_STATUS_LABEL } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDateLong, formatMoney } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Your booking",
  robots: { index: false, follow: false },
};

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const [{ reference }, { email }] = await Promise.all([params, searchParams]);
  const normalisedReference = reference.toUpperCase();

  const booking = await prisma.booking.findUnique({
    where: { reference: normalisedReference },
    include: {
      travellers: true,
      departure: { include: { tour: true } },
    },
  });

  if (!booking) notFound();

  // Either this browser made the booking, or the email address must match.
  const authorised =
    (await ownsBooking(normalisedReference)) ||
    (email ? booking.customerEmail.toLowerCase() === email.trim().toLowerCase() : false);

  const settings = await getSettings();

  if (!authorised) {
    return (
      <div className="bg-mist">
        <section className="bg-ink pt-32 pb-12 sm:pt-40">
          <div className="mx-auto max-w-xl px-5">
            <h1 className="display-2 text-white">Confirm it is you</h1>
            <p className="mt-4 text-white/60">
              Enter the email address on booking {normalisedReference} to see the details.
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-xl px-5 py-14">
          <BookingLookupForm defaultReference={normalisedReference} />
        </section>
      </div>
    );
  }

  const deposit = depositCents(booking.totalCents);

  return (
    <div className="bg-mist">
      <section className="grain relative overflow-hidden bg-ink pt-32 pb-16 sm:pt-40">
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal/15 text-teal">
            <Icon name="check" className="h-7 w-7" />
          </div>
          <h1 className="display-2 mt-7 text-white">You are on the list.</h1>
          <p className="lead mt-5 text-white/65">
            We have your request for {booking.tourTitle}. Our team confirms every booking by hand —
            expect an email within one working day.
          </p>
          <p className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-mono text-lg font-semibold tracking-wider text-white">
            {booking.reference}
          </p>
          <p className="mt-3 text-xs text-white/40">Keep this reference — you will need it to look the booking up.</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-14">
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/8 bg-paper px-7 py-5">
            <div>
              <h2 className="display-3 text-xl">{booking.tourTitle}</h2>
              <p className="mt-1 text-sm text-ink-400">
                {formatDateLong(booking.departure.startDate)} — {formatDateLong(booking.departure.endDate)}
              </p>
            </div>
            <div className="flex gap-2">
              <span className="pill bg-ink text-mist">{BOOKING_STATUS_LABEL[booking.status]}</span>
              <span className="pill bg-mist text-ink-600">
                {PAYMENT_STATUS_LABEL[booking.paymentStatus]}
              </span>
            </div>
          </div>

          <dl className="grid gap-x-10 gap-y-5 px-7 py-7 sm:grid-cols-2">
            <div>
              <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
                Travellers
              </dt>
              <dd className="mt-1.5 text-sm">
                {booking.travellers.length > 0 ? (
                  <ul className="space-y-1">
                    {booking.travellers.map((traveller) => (
                      <li key={traveller.id} className="font-medium">
                        {traveller.fullName}
                        {traveller.age ? (
                          <span className="font-normal text-ink-400"> · {traveller.age}</span>
                        ) : null}
                        {traveller.isLead ? (
                          <span className="ml-2 text-[0.7rem] font-semibold uppercase text-ember">
                            Lead
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  `${booking.guests} travellers`
                )}
              </dd>
            </div>

            <div>
              <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
                Contact
              </dt>
              <dd className="mt-1.5 space-y-0.5 text-sm">
                <p className="font-medium">{booking.customerName}</p>
                <p className="text-ink-400">{booking.customerEmail}</p>
                <p className="text-ink-400">{booking.customerPhone}</p>
              </dd>
            </div>

            {booking.notes ? (
              <div className="sm:col-span-2">
                <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
                  Your notes
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink-600">{booking.notes}</dd>
              </div>
            ) : null}
          </dl>

          <div className="border-t border-ink/8 bg-mist px-7 py-6">
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-400">
                  {formatMoney(booking.unitPriceCents, booking.currency)} × {booking.guests}
                </dt>
                <dd className="font-medium">{formatMoney(booking.totalCents, booking.currency)}</dd>
              </div>
              <div className="flex justify-between border-t border-ink/10 pt-2.5">
                <dt className="font-display font-semibold">Trip total</dt>
                <dd className="font-display text-lg font-bold">
                  {formatMoney(booking.totalCents, booking.currency)}
                </dd>
              </div>
              <div className="flex justify-between text-ember-dark">
                <dt className="font-medium">Deposit to confirm ({DEPOSIT_PERCENT}%)</dt>
                <dd className="font-semibold">{formatMoney(deposit, booking.currency)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="card mt-6 p-7">
          <h2 className="display-3 text-lg">What happens next</h2>
          <ol className="mt-5 space-y-4 text-sm">
            {[
              "We check the departure and confirm your seats by email, usually the same day.",
              `You pay the ${DEPOSIT_PERCENT}% deposit through the link we send. Nothing has been charged yet.`,
              "We send joining instructions, a kit list and the exact meeting point and time.",
              "Balance is due 30 days before departure.",
            ].map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[0.7rem] font-bold text-mist">
                  {index + 1}
                </span>
                <span className="leading-relaxed text-ink-600">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-7 flex flex-wrap gap-3 border-t border-ink/8 pt-6">
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                `Hi, this is about booking ${booking.reference}.`,
              )}`}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-primary btn-sm"
            >
              WhatsApp about this booking
            </a>
            <a href={`mailto:${settings.contactEmail}?subject=Booking ${booking.reference}`} className="btn btn-ghost btn-sm">
              Email us
            </a>
            <Link href="/tours" className="btn btn-ghost btn-sm">
              Browse other trips
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
