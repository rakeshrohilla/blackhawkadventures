"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { DIFFICULTIES, DIFFICULTY_LABEL, REGIONS } from "@/lib/constants";

const SORTS = [
  { value: "soonest", label: "Leaving soonest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "duration-asc", label: "Shortest first" },
  { value: "duration-desc", label: "Longest first" },
];

export function TourFilters({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const region = searchParams.get("region") ?? "";
  const difficulty = searchParams.get("difficulty") ?? "";
  const sort = searchParams.get("sort") ?? "soonest";
  const hasFilters = Boolean(region || difficulty) || sort !== "soonest";

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`/tours?${params.toString()}`, { scroll: false }));
  }

  return (
    <div
      className={`card flex flex-wrap items-end gap-5 p-5 transition-opacity sm:p-6 ${
        pending ? "opacity-60" : ""
      }`}
    >
      <div className="min-w-[10rem] flex-1">
        <label className="label" htmlFor="filter-region">
          Region
        </label>
        <select
          id="filter-region"
          className="select"
          value={region}
          onChange={(event) => update("region", event.target.value)}
        >
          <option value="">All regions</option>
          {REGIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[10rem] flex-1">
        <label className="label" htmlFor="filter-difficulty">
          Difficulty
        </label>
        <select
          id="filter-difficulty"
          className="select"
          value={difficulty}
          onChange={(event) => update("difficulty", event.target.value)}
        >
          <option value="">Any difficulty</option>
          {DIFFICULTIES.map((item) => (
            <option key={item} value={item}>
              {DIFFICULTY_LABEL[item]}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[10rem] flex-1">
        <label className="label" htmlFor="filter-sort">
          Sort by
        </label>
        <select
          id="filter-sort"
          className="select"
          value={sort}
          onChange={(event) => update("sort", event.target.value)}
        >
          {SORTS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4 pb-0.5">
        <p className="text-sm font-medium text-ink-400">
          {resultCount} {resultCount === 1 ? "trip" : "trips"}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => startTransition(() => router.push("/tours", { scroll: false }))}
            className="text-sm font-semibold text-ember transition-colors hover:text-ember-dark"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
