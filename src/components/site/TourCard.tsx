import Image from "next/image";
import Link from "next/link";

import type { Difficulty } from "@/generated/prisma/client";
import { formatDate, formatMoney } from "@/lib/format";
import { DifficultyPill } from "./Bits";
import { Icon } from "./Icon";
import { SceneArt } from "./SceneArt";

export type TourCardData = {
  slug: string;
  title: string;
  tagline: string;
  region: string;
  difficulty: Difficulty;
  durationDays: number;
  basePriceCents: number;
  currency: string;
  artVariant: string;
  heroImageUrl: string | null;
  nextDeparture?: { startDate: Date; seatsLeft: number } | null;
};

export function TourCard({ tour, priority = false }: { tour: TourCardData; priority?: boolean }) {
  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      <Link href={`/tours/${tour.slug}`} className="relative block aspect-4/3 overflow-hidden bg-ink">
        {tour.heroImageUrl ? (
          <Image
            src={tour.heroImageUrl}
            alt={tour.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
        ) : (
          <SceneArt
            variant={tour.artVariant}
            className="h-full w-full transition-transform duration-700 group-hover:scale-[1.06]"
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-ink/85 to-transparent" />
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          <span className="pill bg-white/90 text-ink">
            <Icon name="pin" className="h-3 w-3" />
            {tour.region}
          </span>
          <span className="pill bg-ink/70 text-white backdrop-blur-sm">
            {tour.durationDays} days
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="display-3 text-[1.35rem] leading-snug">
          <Link href={`/tours/${tour.slug}`} className="transition-colors hover:text-ember">
            {tour.title}
          </Link>
        </h3>
        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-ink-400">{tour.tagline}</p>

        {tour.nextDeparture ? (
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-teal">
            <Icon name="calendar" className="h-3.5 w-3.5" />
            Next departure {formatDate(tour.nextDeparture.startDate)}
            {tour.nextDeparture.seatsLeft <= 4 ? (
              <span className="text-ember-dark">· {tour.nextDeparture.seatsLeft} seats left</span>
            ) : null}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-ink/8 pt-5 mt-6">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-400">From</p>
            <p className="font-display text-xl font-bold">
              {formatMoney(tour.basePriceCents, tour.currency)}
            </p>
            <p className="text-[0.7rem] text-ink-400">per person</p>
          </div>
          <DifficultyPill difficulty={tour.difficulty} />
        </div>
      </div>
    </article>
  );
}
