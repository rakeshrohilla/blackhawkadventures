import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { SectionHeading } from "@/components/site/Bits";
import { Reveal } from "@/components/site/Reveal";
import { HeroArt } from "@/components/site/HeroArt";
import { TourCard } from "@/components/site/TourCard";
import { TourFilters } from "@/components/site/TourFilters";
import { seatsLeft } from "@/lib/booking";
import { DIFFICULTIES, REGIONS } from "@/lib/constants";
import { prisma } from "@/lib/db";
import type { Difficulty, Prisma } from "@/generated/prisma/client";

export const metadata: Metadata = {
  title: "All trips & departures",
  description:
    "Every Black Hawk Adventures trip — Himalayan treks, winter expeditions and road trips across Himachal, Ladakh, Uttarakhand, Kashmir, the North East, Rajasthan and the Konkan coast.",
};

type SearchParams = { region?: string; difficulty?: string; sort?: string };

const ORDER_BY: Record<string, Prisma.TourOrderByWithRelationInput> = {
  "price-asc": { basePriceCents: "asc" },
  "price-desc": { basePriceCents: "desc" },
  "duration-asc": { durationDays: "asc" },
  "duration-desc": { durationDays: "desc" },
  soonest: { createdAt: "asc" },
};

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { region, difficulty, sort = "soonest" } = await searchParams;

  const validRegion = REGIONS.includes(region as (typeof REGIONS)[number]) ? region : undefined;
  const validDifficulty = DIFFICULTIES.includes(difficulty as Difficulty)
    ? (difficulty as Difficulty)
    : undefined;

  const tours = await prisma.tour.findMany({
    where: {
      published: true,
      ...(validRegion ? { region: validRegion } : {}),
      ...(validDifficulty ? { difficulty: validDifficulty } : {}),
    },
    orderBy: ORDER_BY[sort] ?? ORDER_BY.soonest,
    include: {
      departures: {
        where: { startDate: { gt: new Date() }, status: { in: ["SCHEDULED", "GUARANTEED"] } },
        orderBy: { startDate: "asc" },
        take: 1,
      },
    },
  });

  return (
    <>
      <section className="grain relative overflow-hidden bg-ink">
        <HeroArt variant="peaks" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-linear-to-r from-ink/95 via-ink/70 to-ink/30" />
        <div className="absolute inset-0 bg-linear-to-b from-ink/55 via-transparent to-ink/90" />
        <div className="relative mx-auto max-w-7xl px-5 pt-36 pb-16 sm:pt-44 sm:pb-20">
          <SectionHeading
            eyebrow="Every trip we run"
            title="Pick a mountain."
            intro="Seven regions, trips from five to twelve days, and live seat counts on every departure."
            light
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:py-16">
        <Suspense fallback={<div className="card h-28 animate-pulse" />}>
          <TourFilters resultCount={tours.length} />
        </Suspense>

        {tours.length === 0 ? (
          <div className="card mt-10 p-14 text-center">
            <h2 className="display-3">Nothing matches that combination.</h2>
            <p className="mt-3 text-sm text-ink-400">
              Try widening the filters, or tell us what you are after and we will build it.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/tours" className="btn btn-ghost">
                Clear filters
              </Link>
              <Link href="/contact" className="btn btn-primary">
                Request a custom trip
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour, index) => (
              <Reveal key={tour.id} delay={(index % 3) * 70}>
                <TourCard
                  priority={index < 3}
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
        )}
      </section>
    </>
  );
}
