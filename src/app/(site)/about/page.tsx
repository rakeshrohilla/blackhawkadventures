import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/site/Bits";
import { Icon } from "@/components/site/Icon";
import { Reveal } from "@/components/site/Reveal";
import { HeroArt } from "@/components/site/HeroArt";
import { SceneArt } from "@/components/site/SceneArt";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Black Hawk Adventures runs small-group treks and road trips across the Indian Himalaya with crews from the valleys they guide in.",
};

const VALUES = [
  {
    icon: "pin",
    title: "Local first, always",
    body: "Guides, drivers and cooks are from the regions they work in. Homestays are paid directly and fairly, in cash, on the day.",
  },
  {
    icon: "shield",
    title: "Safety is not a sales line",
    body: "Wilderness first-aid certified leaders, oximeters on every high-altitude trip, oxygen where it matters, and the authority to turn any group around.",
  },
  {
    icon: "leaf",
    title: "Leave it better",
    body: "We carry out everything we carry in, including other people's rubbish. No single-use plastic on any trip, and no camping on fragile meadows.",
  },
  {
    icon: "check",
    title: "Honest itineraries",
    body: "If a day is a nine-hour drive, we say it is a nine-hour drive. We would rather lose a booking than have you arrive expecting something else.",
  },
];

const TIMELINE = [
  { year: "2015", title: "One vehicle, one route", body: "Started running Manali–Spiti trips with a single Scorpio and a satellite phone." },
  { year: "2018", title: "Beyond Himachal", body: "Added Uttarakhand and Ladakh, and brought on full-time crews in each region rather than seasonal staff." },
  { year: "2021", title: "Winter programme", body: "Began running the cold-season trips — winter Spiti, the Chadar and Kedarkantha — that we are now known for." },
  { year: "2024", title: "Seven regions", body: "Kashmir, the North East, Rajasthan and the Konkan coast joined the calendar." },
];

export default async function AboutPage() {
  const [tourCount, regions, reviewStats] = await Promise.all([
    prisma.tour.count({ where: { published: true } }),
    prisma.tour.findMany({ where: { published: true }, select: { region: true }, distinct: ["region"] }),
    prisma.review.aggregate({ where: { published: true }, _avg: { rating: true }, _count: true }),
  ]);

  return (
    <>
      <section className="grain relative overflow-hidden bg-ink">
        <HeroArt variant="peaks" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-linear-to-r from-ink/95 via-ink/70 to-ink/30" />
        <div className="absolute inset-0 bg-linear-to-b from-ink/55 via-transparent to-ink" />
        <div className="relative mx-auto max-w-7xl px-5 pt-36 pb-20 sm:pt-44 sm:pb-24">
          <SectionHeading
            eyebrow="About us"
            title="We are the crew, not the brochure."
            intro="Black Hawk Adventures is a small operator running trips in the Indian Himalaya. Everyone who leads a trip for us has lived and worked in the region it runs in."
            light
          />
        </div>
      </section>

      <section className="border-b border-ink/8 bg-paper">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 px-5 sm:grid-cols-4">
          {[
            { value: String(tourCount), label: "Trips on the calendar" },
            { value: String(regions.length), label: "Himalayan regions" },
            { value: "8–14", label: "People per group" },
            {
              value: (reviewStats._avg.rating ?? 5).toFixed(1),
              label: `Average of ${reviewStats._count} reviews`,
            },
          ].map((stat) => (
            <div key={stat.label} className="py-10">
              <dd className="font-display text-4xl font-bold">{stat.value}</dd>
              <dt className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-400">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="display-2">How this started</h2>
            <div className="copy mt-7 text-[1.02rem]">
              <p>
                In 2015 we were the drivers and guides other companies hired. We watched groups
                arrive on itineraries written by people who had never driven the Kunzum pass in
                October, and we spent a lot of evenings fixing plans that should never have been
                sold.
              </p>
              <p>
                So we started writing our own. The rule was simple and has not changed: the person
                who plans the trip has to have done the route, in that season, more than once.
              </p>
              <p>
                That is why our calendar grows slowly. A region goes on sale only once we have a
                full-time crew living there and have run the route enough times to know where it
                goes wrong.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 self-start">
            <SceneArt variant="valley" className="aspect-3/4 w-full rounded-2xl" />
            <div className="grid gap-4 pt-12">
              <SceneArt variant="forest" className="aspect-square w-full rounded-2xl" />
              <SceneArt variant="coast" className="aspect-square w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/8 bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <SectionHeading eyebrow="What we stand on" title="Four rules we run on." align="center" />
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {VALUES.map((value, index) => (
              <Reveal key={value.title} delay={index * 70}>
                <div className="card flex h-full gap-5 p-7">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ember-tint text-ember-dark">
                    <Icon name={value.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{value.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-ink-400">{value.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <SectionHeading eyebrow="The short version" title="Ten years, one road at a time." />
        <ol className="mt-14 grid gap-px overflow-hidden rounded-card border border-ink/10 bg-ink/8 sm:grid-cols-2 lg:grid-cols-4">
          {TIMELINE.map((entry) => (
            <li key={entry.year} className="bg-paper p-7">
              <p className="font-display text-3xl font-bold text-ember">{entry.year}</p>
              <h3 className="mt-3 font-display text-base font-semibold">{entry.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">{entry.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24">
        <div className="grain relative overflow-hidden rounded-card bg-ink px-8 py-16 text-center sm:px-16">
          <h2 className="display-2 text-white">Come and see for yourself.</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">
            Pick a date off the calendar, or tell us what you want and we will build it around you.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/tours" className="btn btn-primary">
              Browse trips
            </Link>
            <Link href="/contact" className="btn btn-ghost-light">
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
