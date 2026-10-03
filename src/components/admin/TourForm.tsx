"use client";

import Link from "next/link";
import { useActionState } from "react";

import { saveTourAction } from "@/actions/admin";
import { Field, FormBanner, SubmitButton } from "@/components/site/FormBits";
import { ART_VARIANTS, DIFFICULTIES, DIFFICULTY_LABEL, REGIONS } from "@/lib/constants";
import { IDLE_STATE } from "@/lib/validation";
import type { Tour } from "@/generated/prisma/client";

function lines(value: unknown): string {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string").join("\n") : "";
}

export function TourForm({ tour }: { tour?: Tour }) {
  const [state, action] = useActionState(saveTourAction, IDLE_STATE);

  return (
    <form action={action} className="space-y-7">
      {tour ? <input type="hidden" name="id" value={tour.id} /> : null}

      <FormBanner ok={state.ok} message={state.message} />

      <section className="card p-6">
        <h2 className="display-3 text-lg">The basics</h2>
        <div className="mt-5 space-y-5">
          <Field label="Title" name="title" errors={state.errors}>
            <input id="title" name="title" className="input" defaultValue={tour?.title} required />
          </Field>

          <Field
            label="URL slug"
            name="slug"
            errors={state.errors}
            hint="Leave blank to generate it from the title."
          >
            <input id="slug" name="slug" className="input font-mono text-sm" defaultValue={tour?.slug} />
          </Field>

          <Field
            label="Tagline"
            name="tagline"
            errors={state.errors}
            hint="One line, shown under the title on the trip page and on cards."
          >
            <input id="tagline" name="tagline" className="input" defaultValue={tour?.tagline} required />
          </Field>

          <Field
            label="Card summary"
            name="summary"
            errors={state.errors}
            hint="2–3 sentences. Used in listings, search results and social previews."
          >
            <textarea
              id="summary"
              name="summary"
              className="textarea min-h-24"
              defaultValue={tour?.summary}
              required
            />
          </Field>

          <Field
            label="Full description"
            name="description"
            errors={state.errors}
            hint="Leave a blank line between paragraphs."
          >
            <textarea
              id="description"
              name="description"
              className="textarea min-h-56"
              defaultValue={tour?.description}
              required
            />
          </Field>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="display-3 text-lg">Logistics & price</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Region" name="region" errors={state.errors}>
            <select id="region" name="region" className="select" defaultValue={tour?.region ?? REGIONS[0]}>
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Difficulty" name="difficulty" errors={state.errors}>
            <select
              id="difficulty"
              name="difficulty"
              className="select"
              defaultValue={tour?.difficulty ?? "MODERATE"}
            >
              {DIFFICULTIES.map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {DIFFICULTY_LABEL[difficulty]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Duration (days)" name="durationDays" errors={state.errors}>
            <input
              id="durationDays"
              name="durationDays"
              type="number"
              min={1}
              max={90}
              className="input"
              defaultValue={tour?.durationDays ?? 7}
              required
            />
          </Field>

          <Field label="Maximum group size" name="groupSizeMax" errors={state.errors}>
            <input
              id="groupSizeMax"
              name="groupSizeMax"
              type="number"
              min={1}
              max={60}
              className="input"
              defaultValue={tour?.groupSizeMax ?? 12}
              required
            />
          </Field>

          <Field label="Minimum age" name="minAge" errors={state.errors} hint="Leave blank for no limit.">
            <input
              id="minAge"
              name="minAge"
              type="number"
              min={0}
              max={99}
              className="input"
              defaultValue={tour?.minAge ?? ""}
            />
          </Field>

          <Field
            label="Price per person"
            name="basePrice"
            errors={state.errors}
            hint="Whole rupees, no symbols. Departures can override this."
          >
            <input
              id="basePrice"
              name="basePrice"
              type="number"
              min={0}
              step={100}
              className="input"
              defaultValue={tour ? tour.basePriceCents / 100 : ""}
              required
            />
          </Field>

          <Field label="Currency" name="currency" errors={state.errors}>
            <select id="currency" name="currency" className="select" defaultValue={tour?.currency ?? "INR"}>
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="display-3 text-lg">Lists</h2>
        <p className="mt-1.5 text-sm text-ink-400">One item per line.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Highlights" name="highlights" errors={state.errors}>
            <textarea
              id="highlights"
              name="highlights"
              className="textarea min-h-40"
              defaultValue={lines(tour?.highlights)}
            />
          </Field>
          <Field label="Gallery image URLs" name="gallery" errors={state.errors}>
            <textarea
              id="gallery"
              name="gallery"
              className="textarea min-h-40 font-mono text-xs"
              defaultValue={lines(tour?.gallery)}
            />
          </Field>
          <Field label="What's included" name="inclusions" errors={state.errors}>
            <textarea
              id="inclusions"
              name="inclusions"
              className="textarea min-h-40"
              defaultValue={lines(tour?.inclusions)}
            />
          </Field>
          <Field label="What's not included" name="exclusions" errors={state.errors}>
            <textarea
              id="exclusions"
              name="exclusions"
              className="textarea min-h-40"
              defaultValue={lines(tour?.exclusions)}
            />
          </Field>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="display-3 text-lg">Imagery & visibility</h2>
        <div className="mt-5 space-y-5">
          <Field
            label="Hero image URL"
            name="heroImageUrl"
            errors={state.errors}
            hint="Leave blank to use the generated artwork below."
          >
            <input
              id="heroImageUrl"
              name="heroImageUrl"
              className="input font-mono text-sm"
              placeholder="https://…"
              defaultValue={tour?.heroImageUrl ?? ""}
            />
          </Field>

          <Field
            label="Fallback artwork"
            name="artVariant"
            errors={state.errors}
            hint="Used anywhere no photograph is set."
          >
            <select
              id="artVariant"
              name="artVariant"
              className="select"
              defaultValue={tour?.artVariant ?? "peaks"}
            >
              {ART_VARIANTS.map((variant) => (
                <option key={variant} value={variant}>
                  {variant}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex flex-col gap-3 border-t border-ink/8 pt-5">
            <label className="flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                name="published"
                defaultChecked={tour?.published ?? false}
                className="h-4 w-4 accent-[#e8572a]"
              />
              Published — visible on the public website
            </label>
            <label className="flex items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={tour?.featured ?? false}
                className="h-4 w-4 accent-[#e8572a]"
              />
              Featured — shown in the homepage signature trips row
            </label>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton className="btn btn-primary" pendingLabel="Saving…">
          {tour ? "Save changes" : "Create trip"}
        </SubmitButton>
        <Link href="/admin/tours" className="btn btn-ghost">
          Cancel
        </Link>
        {tour ? (
          <Link
            href={`/tours/${tour.slug}`}
            target="_blank"
            className="ml-auto text-sm font-semibold text-ember hover:underline"
          >
            Preview on site →
          </Link>
        ) : null}
      </div>
    </form>
  );
}
