import type { Difficulty } from "@/generated/prisma/client";
import { DIFFICULTY_LABEL } from "@/lib/constants";
import { Icon } from "./Icon";

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  EASY: "bg-teal-tint text-teal",
  MODERATE: "bg-teal-tint text-teal",
  CHALLENGING: "bg-ember-tint text-ember-dark",
  EXPERT: "bg-ink text-mist",
};

export function DifficultyPill({ difficulty }: { difficulty: Difficulty }) {
  return <span className={`pill ${DIFFICULTY_STYLES[difficulty]}`}>{DIFFICULTY_LABEL[difficulty]}</span>;
}

export function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Icon
          key={value}
          name="star"
          className={`h-4 w-4 ${value <= rating ? "text-ember" : "text-ink-300/40"}`}
        />
      ))}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  light = false,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  light?: boolean;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className={`display-2 mt-4 ${light ? "text-white" : "text-ink"}`}>{title}</h2>
      {intro ? (
        <p className={`lead mt-5 ${light ? "text-white/65" : ""}`}>{intro}</p>
      ) : null}
    </div>
  );
}
