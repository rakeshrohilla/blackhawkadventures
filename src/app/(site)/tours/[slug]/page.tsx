import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DifficultyPill, Stars } from "@/components/site/Bits";
import { Icon } from "@/components/site/Icon";
import { HeroArt } from "@/components/site/HeroArt";
import { TourCard } from "@/components/site/TourCard";
import { isBookable, seatsLeft } from "@/lib/booking";
import { DEPARTURE_STATUS_LABEL, DEPOSIT_PERCENT, DIFFICULTY_BLURB } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDateRange, formatMoney } from "@/lib/format";
import { getSettings } from "@/lib/settings";

function asList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

async function getTour(slug: string) {
  return prisma.tour.findFirst({
    where: { slug, published: true },
    include: {
      itinerary: { orderBy: { dayNumber: "asc" } },
      departures: {
        where: { startDate: { gt: new Date() }, status: { not: "CANCELLED" } },
        orderBy: { startDate: "asc" },
      },
      reviews: { where: { published: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tour = await prisma.tour.findFirst({
    where: { slug, published: true },
    select: { title: true, summary: true, tagline: true },
  });

  if (!tour) return { title: "Trip not found" };

  return {
    title: tour.title,
    description: tour.summary,
    openGraph: { title: tour.title, description: tour.tagline },
  };
}

export default async function TourPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [tour, settings] = await Promise.all([getTour(slug), getSettings()]);

  if (!tour) notFound();

  const related = await prisma.tour.findMany({
    where: { published: true, region: tour.region, id: { not: tour.id } },
    take: 3,
    include: {
      departures: {
        where: { startDate: { gt: new Date() }, status: { in: ["SCHEDULED", "GUARANTEED"] } },
        orderBy: { startDate: "asc" },
        take: 1,
      },
    },
  });

  const highlights = asList(tour.highlights);
  const inclusions = asList(tour.inclusions);
  const exclusions = asList(tour.exclusions);
  const averageRating =
    tour.reviews.length > 0
      ? tour.reviews.reduce((sum, review) => sum + review.rating, 0) / tour.reviews.length
      : null;

  const facts = [
    { icon: "clock", label: "Duration", value: `${tour.durationDays} days` },
    { icon: "pin", label: "Region", value: tour.region },
    { icon: "users", label: "Group size", value: `Max ${tour.groupSizeMax}` },
    ...(tour.minAge ? [{ icon: "shield", label: "Minimum age", value: `${tour.minAge} years` }] : []),
  ];

  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="grain relative isolate overflow-hidden bg-ink">
        <div className="absolute inset-0">
          {tour.heroImageUrl ? (
            <Image
              src={tour.heroImageUrl}
              alt={tour.title}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-60"
            />
          ) : (
            <HeroArt variant={tour.artVariant} className="h-full w-full" />
          )}
          <div className="absolute inset-0 bg-linear-to-r from-ink/95 via-ink/65 to-ink/10" />
          <div className="absolute inset-0 bg-linear-to-b from-ink/60 via-transparent to-ink/90" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 pt-36 pb-16 sm:pt-44 sm:pb-20">
          <nav aria-label="Breadcrumb" className="text-xs font-medium text-white/50">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/tours" className="transition-colors hover:text-white">
              Trips
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/80">{tour.title}</span>
          </nav>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="pill bg-white/90 text-ink">
              <Icon name="pin" className="h-3 w-3" />
              {tour.region}
            </span>
            <DifficultyPill difficulty={tour.difficulty} />
            {averageRating ? (
              <span className="pill bg-white/10 text-white backdrop-blur-sm">
                <Icon name="star" className="h-3 w-3 text-ember" />
                {averageRating.toFixed(1)} · {tour.reviews.length} reviews
              </span>
            ) : null}
          </div>

          <h1 className="display-1 mt-6 max-w-4xl text-white">{tour.title}</h1>
          <p className="lead mt-6 max-w-2xl text-white/75">{tour.tagline}</p>

          <div className="mt-12 flex flex-wrap items-end gap-x-12 gap-y-6">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/50">
                From
              </p>
              <p className="font-display text-4xl font-bold text-white">
                {formatMoney(tour.basePriceCents, tour.currency)}
              </p>
              <p className="text-xs text-white/50">per person, all inclusive</p>
            </div>
            <a href="#departures" className="btn btn-primary">
              See {tour.departures.length} departures
              <Icon name="arrow" className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- fact strip */}
      <section className="border-b border-ink/8 bg-paper">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-5 sm:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-center gap-3.5 py-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mist text-ink-400">
                <Icon name={fact.icon} className="h-4 w-4" />
              </span>
              <div>
                <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
                  {fact.label}
                </dt>
                <dd className="font-display text-base font-semibold">{fact.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------------------------------------------------------- main body */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.65fr_1fr] lg:gap-20">
          <div>
            <h2 className="display-2">The trip</h2>
            <div className="copy mt-7 text-[1.02rem]">
              {tour.description.split("\n\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-ink/10 bg-mist p-6">
              <p className="flex items-center gap-2 font-display text-sm font-semibold">
                <Icon name="shield" className="h-4 w-4 text-ember" />
                Difficulty: {tour.difficulty.charAt(0) + tour.difficulty.slice(1).toLowerCase()}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">
                {DIFFICULTY_BLURB[tour.difficulty]}
              </p>
            </div>

            {highlights.length > 0 ? (
              <>
                <h2 className="display-2 mt-16">Highlights</h2>
                <ul className="mt-7 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-3 text-[0.95rem] leading-relaxed">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                      <span className="text-ink-600">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {tour.itinerary.length > 0 ? (
              <>
                <h2 className="display-2 mt-16">Day by day</h2>
                <div className="mt-7 overflow-hidden rounded-card border border-ink/10 bg-paper">
                  {tour.itinerary.map((day, index) => (
                    <details
                      key={day.id}
                      open={index === 0}
                      className="group border-b border-ink/8 last:border-0"
                    >
                      <summary className="flex cursor-pointer list-none items-center gap-4 px-6 py-5 transition-colors hover:bg-mist/60">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-display text-xs font-bold text-mist">
                          {day.dayNumber}
                        </span>
                        <span className="flex-1 font-display text-base font-semibold">
                          {day.title}
                        </span>
                        <Icon
                          name="arrow"
                          className="h-4 w-4 rotate-90 text-ink-300 transition-transform group-open:-rotate-90"
                        />
                      </summary>
                      <div className="px-6 pb-6 pl-[4.75rem]">
                        <p className="text-[0.95rem] leading-relaxed text-ink-600">{day.body}</p>
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-400">
                          {day.stay ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Icon name="pin" className="h-3.5 w-3.5" />
                              {day.stay}
                            </span>
                          ) : null}
                          {day.altitudeM ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Icon name="mountain" className="h-3.5 w-3.5" />
                              {day.altitudeM.toLocaleString("en-IN")} m
                            </span>
                          ) : null}
                          {day.distanceKm ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Icon name="map" className="h-3.5 w-3.5" />
                              {day.distanceKm} km
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </>
            ) : null}

            <div className="mt-16 grid gap-10 sm:grid-cols-2">
              <div>
                <h3 className="display-3 flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-tint text-teal">
                    <Icon name="check" className="h-4 w-4" />
                  </span>
                  Included
                </h3>
                <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-ink-600">
                  {inclusions.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="display-3 flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ember-tint text-ember-dark">
                    <span className="h-[2px] w-3 rounded-full bg-current" />
                  </span>
                  Not included
                </h3>
                <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-ink-600">
                  {exclusions.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-ink-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------- departures */}
          <aside id="departures" className="lg:sticky lg:top-28 lg:self-start">
            <div className="card overflow-hidden">
              <div className="border-b border-ink/8 bg-mist px-6 py-5">
                <h2 className="display-3 text-xl">Departures</h2>
                <p className="mt-1 text-xs text-ink-400">
                  {DEPOSIT_PERCENT}% deposit holds your seat. Balance due 30 days before departure.
                </p>
              </div>

              {tour.departures.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-ink-400">
                    No dates on sale right now. Tell us when you want to go and we will put a group
                    together.
                  </p>
                  <Link href="/contact" className="btn btn-primary btn-sm mt-5">
                    Request a date
                  </Link>
                </div>
              ) : (
                <ul>
                  {tour.departures.map((departure) => {
                    const remaining = seatsLeft(departure);
                    const bookable = isBookable(departure);
                    const price = departure.priceCents ?? tour.basePriceCents;

                    return (
                      <li key={departure.id} className="border-b border-ink/8 px-6 py-5 last:border-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-display text-[0.95rem] font-semibold">
                              {formatDateRange(departure.startDate, departure.endDate)}
                            </p>
                            <p
                              className={`mt-1 text-xs font-medium ${
                                remaining === 0
                                  ? "text-ink-400"
                                  : remaining <= 4
                                    ? "text-ember-dark"
                                    : "text-teal"
                              }`}
                            >
                              {departure.status === "GUARANTEED" ? "Guaranteed · " : ""}
                              {remaining === 0
                                ? DEPARTURE_STATUS_LABEL.FULL
                                : `${remaining} of ${departure.capacity} seats left`}
                            </p>
                          </div>
                          <p className="shrink-0 font-display text-base font-bold">
                            {formatMoney(price, tour.currency)}
                          </p>
                        </div>

                        {bookable ? (
                          <Link
                            href={`/book/${departure.id}`}
                            className="btn btn-dark btn-sm mt-4 w-full"
                          >
                            Book this date
                          </Link>
                        ) : (
                          <button type="button" disabled className="btn btn-ghost btn-sm mt-4 w-full">
                            {remaining === 0 ? "Sold out" : "Closed"}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="card mt-5 bg-ink p-6 text-mist">
              <h3 className="font-display text-base font-semibold text-white">
                Not sure if this one is for you?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Ask us anything — fitness, altitude, gear, whether your knees will survive it.
              </p>
              <div className="mt-5 flex flex-col gap-2.5">
                <a
                  href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                    `Hi, I have a question about the ${tour.title} trip.`,
                  )}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn btn-primary btn-sm w-full"
                >
                  WhatsApp us
                </a>
                <Link href={`/contact?tour=${tour.id}`} className="btn btn-ghost-light btn-sm w-full">
                  Send an enquiry
                </Link>
                <a
                  href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}
                  className="mt-1 text-center text-sm font-medium text-white/60 transition-colors hover:text-white"
                >
                  {settings.contactPhone}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ------------------------------------------------------------- reviews */}
      {tour.reviews.length > 0 ? (
        <section className="border-y border-ink/8 bg-paper">
          <div className="mx-auto max-w-7xl px-5 py-20">
            <h2 className="display-2">From people who went</h2>
            <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {tour.reviews.slice(0, 3).map((review) => (
                <figure key={review.id} className="card flex h-full flex-col p-7">
                  <Stars rating={review.rating} />
                  <blockquote className="mt-5 flex-1 text-[0.95rem] leading-relaxed text-ink-600">
                    “{review.body}”
                  </blockquote>
                  <figcaption className="mt-6 border-t border-ink/8 pt-5">
                    <p className="font-display text-sm font-semibold">{review.authorName}</p>
                    <p className="mt-0.5 text-xs text-ink-400">{review.authorLocation}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------------- related */}
      {related.length > 0 ? (
        <section className="mx-auto max-w-7xl px-5 py-20 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <h2 className="display-2">More in {tour.region}</h2>
            <Link
              href={`/tours?region=${encodeURIComponent(tour.region)}`}
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-ember"
            >
              See all
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <TourCard
                key={item.id}
                tour={{
                  slug: item.slug,
                  title: item.title,
                  tagline: item.tagline,
                  region: item.region,
                  difficulty: item.difficulty,
                  durationDays: item.durationDays,
                  basePriceCents: item.basePriceCents,
                  currency: item.currency,
                  artVariant: item.artVariant,
                  heroImageUrl: item.heroImageUrl,
                  nextDeparture: item.departures[0]
                    ? {
                        startDate: item.departures[0].startDate,
                        seatsLeft: seatsLeft(item.departures[0]),
                      }
                    : null,
                }}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
