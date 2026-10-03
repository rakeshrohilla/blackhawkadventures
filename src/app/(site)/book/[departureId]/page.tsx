import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingForm } from "@/components/site/BookingForm";
import { Icon } from "@/components/site/Icon";
import { SceneArt } from "@/components/site/SceneArt";
import { isBookable, seatsLeft } from "@/lib/booking";
import { prisma } from "@/lib/db";
import { formatDateRange, formatMoney } from "@/lib/format";

export const metadata: Metadata = {
  title: "Book your seat",
  robots: { index: false, follow: false },
};

export default async function BookPage({
  params,
}: {
  params: Promise<{ departureId: string }>;
}) {
  const { departureId } = await params;

  const departure = await prisma.departure.findUnique({
    where: { id: departureId },
    include: { tour: true },
  });

  if (!departure || !departure.tour.published) notFound();

  const remaining = seatsLeft(departure);
  const bookable = isBookable(departure);
  const unitPrice = departure.priceCents ?? departure.tour.basePriceCents;

  return (
    <div className="bg-mist">
      <section className="bg-ink pt-32 pb-12 sm:pt-40">
        <div className="mx-auto max-w-5xl px-5">
          <Link
            href={`/tours/${departure.tour.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
          >
            <Icon name="arrow" className="h-4 w-4 rotate-180" />
            Back to {departure.tour.title}
          </Link>
          <h1 className="display-2 mt-5 text-white">
            {bookable ? "Reserve your seats" : "This departure is closed"}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          <div className="order-2 lg:order-1">
            {bookable ? (
              <BookingForm
                departureId={departure.id}
                unitPriceCents={unitPrice}
                currency={departure.tour.currency}
                seatsAvailable={remaining}
              />
            ) : (
              <div className="card p-10 text-center">
                <h2 className="display-3">
                  {remaining === 0 ? "This departure is sold out." : "This date is no longer open."}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-400">
                  Have a look at the other dates for this trip, or tell us when you are free and we
                  will let you know the moment a seat opens up.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link href={`/tours/${departure.tour.slug}`} className="btn btn-dark">
                    Other dates
                  </Link>
                  <Link href={`/contact?tour=${departure.tour.id}`} className="btn btn-ghost">
                    Join the waitlist
                  </Link>
                </div>
              </div>
            )}
          </div>

          <aside className="order-1 lg:order-2 lg:sticky lg:top-28 lg:self-start">
            <div className="card overflow-hidden">
              <div className="relative aspect-16/10 bg-ink">
                <SceneArt variant={departure.tour.artVariant} className="h-full w-full" />
              </div>
              <div className="p-6">
                <h2 className="font-display text-lg font-semibold leading-snug">
                  {departure.tour.title}
                </h2>
                <dl className="mt-5 space-y-3.5 text-sm">
                  <div className="flex items-start gap-3">
                    <Icon name="calendar" className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" />
                    <div>
                      <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
                        Dates
                      </dt>
                      <dd className="font-medium">
                        {formatDateRange(departure.startDate, departure.endDate)}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" />
                    <div>
                      <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
                        Duration
                      </dt>
                      <dd className="font-medium">{departure.tour.durationDays} days</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="users" className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" />
                    <div>
                      <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
                        Availability
                      </dt>
                      <dd className={`font-medium ${remaining <= 4 ? "text-ember-dark" : "text-teal"}`}>
                        {remaining} of {departure.capacity} seats left
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border-t border-ink/8 pt-4">
                    <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" />
                    <div>
                      <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
                        Price per person
                      </dt>
                      <dd className="font-display text-xl font-bold">
                        {formatMoney(unitPrice, departure.tour.currency)}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
