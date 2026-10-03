import Link from "next/link";

import { Reveal } from "@/components/site/Reveal";
import { SceneArt } from "@/components/site/SceneArt";
import { SectionHeading, Stars } from "@/components/site/Bits";
import { HeroArt } from "@/components/site/HeroArt";
import { Icon } from "@/components/site/Icon";
import { TourCard } from "@/components/site/TourCard";
import { seatsLeft } from "@/lib/booking";
import { prisma } from "@/lib/db";
import { formatDateRange, formatMoney } from "@/lib/format";
import { getSettings } from "@/lib/settings";

const WHY_US = [
  {
    icon: "pin",
    title: "Crews who live there",
    body: "Every trip is led by someone from the valley it runs in. They know which homestay has a working bukhari and which road washed out last week.",
  },
  {
    icon: "users",
    title: "Groups of 8 to 14",
    body: "Small enough to change the plan when the weather does, and to eat dinner around one table. We do not run bus tours.",
  },
  {
    icon: "shield",
    title: "Altitude taken seriously",
    body: "Itineraries are built around acclimatisation, not around squeezing in a day. Oximeters, oxygen and a guide trained to turn the group around.",
  },
  {
    icon: "check",
    title: "The price is the price",
    body: "Permits, stays, food and transport are in the number you see. We list exactly what is not included, before you pay anything.",
  },
];

export default async function HomePage() {
  const now = new Date();

  const [settings, featured, upcoming, reviews, tourCount, regions, ratingStats] = await Promise.all([
    getSettings(),
    prisma.tour.findMany({
      where: { published: true, featured: true },
      orderBy: { createdAt: "asc" },
      take: 4,
      include: {
        departures: {
          where: { startDate: { gt: now }, status: { in: ["SCHEDULED", "GUARANTEED"] } },
          orderBy: { startDate: "asc" },
          take: 1,
        },
      },
    }),
    prisma.departure.findMany({
      where: {
        startDate: { gt: now },
        status: { in: ["SCHEDULED", "GUARANTEED"] },
        tour: { published: true },
      },
      orderBy: { startDate: "asc" },
      take: 6,
      include: { tour: true },
    }),
    prisma.review.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { tour: { select: { title: true, slug: true } } },
    }),
    prisma.tour.count({ where: { published: true } }),
    prisma.tour.findMany({ where: { published: true }, select: { region: true }, distinct: ["region"] }),
    prisma.review.aggregate({ where: { published: true }, _avg: { rating: true }, _count: true }),
  ]);

  const averageRating = ratingStats._avg.rating ?? 5;

  const stats = [
    { value: String(tourCount), label: "Trips running" },
    { value: String(regions.length), label: "Himalayan regions" },
    { value: "8–14", label: "People per group" },
    {
      value: averageRating.toFixed(1),
      label: `From ${ratingStats._count} reviews`,
    },
  ];

  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="grain relative isolate overflow-hidden bg-ink">
        <HeroArt className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-linear-to-r from-ink/95 via-ink/60 to-ink/5" />
        <div className="absolute inset-0 bg-linear-to-b from-ink/45 via-transparent to-ink/90" />

        <div className="relative mx-auto max-w-7xl px-5 pt-36 pb-16 sm:pt-44 sm:pb-20">
          <div className="max-w-3xl">
            <p className="eyebrow text-ember">Winter 2026 · Spring 2027</p>
            <h1 className="display-1 mt-6 text-white">{settings.heroHeadline}</h1>
            <p className="lead mt-7 max-w-xl text-white/75">{settings.heroSubline}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/tours" className="btn btn-primary">
                See all trips
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <Link href="/contact" className="btn btn-ghost-light">
                Plan a custom trip
              </Link>
            </div>
          </div>

          <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-ink/40 px-6 py-6">
                <dd className="font-display text-3xl font-bold text-white sm:text-4xl">{stat.value}</dd>
                <dt className="mt-1.5 text-xs font-medium uppercase tracking-[0.1em] text-white/55">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------- featured trips */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Signature trips"
            title="The four we are proudest of."
            intro="Each one has been run enough times that we know exactly where it gets hard and what to do about it."
          />
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-ember"
          >
            All {tourCount} trips
            <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((tour, index) => (
            <Reveal key={tour.id} delay={index * 70}>
              <TourCard
                priority={index < 2}
                tour={{
                  slug: tour.slug,
                  title: tour.title,
                  tagline: tour.tagline,
                  region: tour.region,
                  difficulty: tour.difficulty,
                  durationDays: tour.durationDays,
                  basePriceCents: tour.basePriceCents,
                  currency: tour.currency,
                  artVariant: tour.artVariant,
                  heroImageUrl: tour.heroImageUrl,
                  nextDeparture: tour.departures[0]
                    ? {
                        startDate: tour.departures[0].startDate,
                        seatsLeft: seatsLeft(tour.departures[0]),
                      }
                    : null,
                }}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- why us */}
      <section className="border-y border-ink/8 bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:py-32">
          <SectionHeading
            eyebrow="How we run trips"
            title="Four things we will not compromise on."
            align="center"
          />
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((item, index) => (
              <Reveal key={item.title} delay={index * 70}>
                <div className="flex h-full flex-col">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ember-tint text-ember-dark">
                    <Icon name={item.icon} className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-400">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- upcoming departures */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:py-32">
        <SectionHeading
          eyebrow="Open departures"
          title="Leaving soon, seats still open."
          intro="Live availability — these numbers come straight out of the booking system."
        />

        <div className="mt-14 overflow-hidden rounded-card border border-ink/10 bg-paper">
          <ul>
            {upcoming.map((departure) => {
              const remaining = seatsLeft(departure);
              const price = departure.priceCents ?? departure.tour.basePriceCents;
              return (
                <li
                  key={departure.id}
                  className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-ink/8 px-6 py-5 transition-colors last:border-0 hover:bg-mist/60"
                >
                  <div className="min-w-[14rem] flex-1">
                    <Link
                      href={`/tours/${departure.tour.slug}`}
                      className="font-display text-lg font-semibold transition-colors hover:text-ember"
                    >
                      {departure.tour.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink-400">
                      {departure.tour.region} · {departure.tour.durationDays} days
                    </p>
                  </div>

                  <p className="inline-flex items-center gap-2 text-sm font-medium">
                    <Icon name="calendar" className="h-4 w-4 text-ink-300" />
                    {formatDateRange(departure.startDate, departure.endDate)}
                  </p>

                  <p
                    className={`text-sm font-semibold ${
                      remaining <= 4 ? "text-ember-dark" : "text-teal"
                    }`}
                  >
                    {remaining === 0 ? "Sold out" : `${remaining} seats left`}
                  </p>

                  <p className="font-display text-base font-bold">
                    {formatMoney(price, departure.tour.currency)}
                  </p>

                  <Link href={`/book/${departure.id}`} className="btn btn-dark btn-sm">
                    Book
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------------- story */}
      <section className="grain relative overflow-hidden bg-ink text-mist">
        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:py-32 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Who we are"
              title="We started as the drivers and guides on other people's trips."
              light
            />
            <div className="copy mt-7 max-w-xl [&_p]:text-white/65">
              <p>
                Black Hawk started in 2015 with one Scorpio, a satellite phone and a bad idea about
                how far you can drive in a day in Lahaul. We learned the hard way, locally, and that
                is still how we build every itinerary.
              </p>
              <p>
                Today we run trips across seven Himalayan regions with crews who are from those
                valleys — not seasonal staff flown in for the summer. Our guides are wilderness
                first-aid certified and our drivers have done these roads in every condition they
                come in.
              </p>
            </div>
            <Link href="/about" className="btn btn-ghost-light mt-9">
              More about us
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SceneArt variant="peaks" className="aspect-3/4 w-full rounded-2xl" />
            <div className="grid gap-4 pt-10">
              <SceneArt variant="valley" className="aspect-square w-full rounded-2xl" />
              <SceneArt variant="dunes" className="aspect-square w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- testimonials */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:py-32">
        <SectionHeading
          eyebrow="Trip reports"
          title="What people say afterwards."
          align="center"
        />
        <div className="mt-16 grid gap-7 md:grid-cols-3">
          {reviews.map((review, index) => (
            <Reveal key={review.id} delay={index * 80}>
              <figure className="card flex h-full flex-col p-7">
                <Stars rating={review.rating} />
                <blockquote className="mt-5 flex-1 text-[0.95rem] leading-relaxed text-ink-600">
                  “{review.body}”
                </blockquote>
                <figcaption className="mt-6 border-t border-ink/8 pt-5">
                  <p className="font-display text-sm font-semibold">{review.authorName}</p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {review.authorLocation}
                    {review.tour ? ` · ${review.tour.title}` : ""}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- final cta */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:pb-32">
        <div className="grain relative overflow-hidden rounded-card bg-ember px-8 py-16 text-center sm:px-16 sm:py-20">
          <div className="relative mx-auto max-w-2xl">
            <h2 className="display-2 text-white">Not sure which trip fits?</h2>
            <p className="mt-5 text-lg leading-relaxed text-white/85">
              Tell us when you are free, how fit you are and what you want out of it. We will send
              back two or three honest options — including the ones that are wrong for you.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn bg-ink text-white hover:bg-ink-700">
                Talk to us
              </Link>
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noreferrer noopener"
                className="btn border-white/50 text-white hover:bg-white/15"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
