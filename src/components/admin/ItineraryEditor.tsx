"use client";

import { useActionState, useState } from "react";

import { deleteItineraryDayAction, saveItineraryDayAction } from "@/actions/admin";
import { Field, FormBanner, SubmitButton } from "@/components/site/FormBits";
import { IDLE_STATE } from "@/lib/validation";
import type { ItineraryDay } from "@/generated/prisma/client";

function DayForm({
  tourId,
  day,
  nextDayNumber,
  onDone,
}: {
  tourId: string;
  day?: ItineraryDay;
  nextDayNumber?: number;
  onDone?: () => void;
}) {
  const [state, action] = useActionState(saveItineraryDayAction, IDLE_STATE);

  if (state.ok && onDone) onDone();

  return (
    <form action={action} className="space-y-4 bg-mist/60 px-5 py-5">
      <input type="hidden" name="tourId" value={tourId} />
      {day ? <input type="hidden" name="id" value={day.id} /> : null}

      <FormBanner ok={state.ok} message={state.message} />

      <div className="grid gap-4 sm:grid-cols-[6rem_1fr]">
        <Field label="Day" name="dayNumber" errors={state.errors}>
          <input
            name="dayNumber"
            type="number"
            min={1}
            max={90}
            className="input"
            defaultValue={day?.dayNumber ?? nextDayNumber ?? 1}
            required
          />
        </Field>
        <Field label="Title" name="title" errors={state.errors}>
          <input name="title" className="input" defaultValue={day?.title} required />
        </Field>
      </div>

      <Field label="What happens" name="body" errors={state.errors}>
        <textarea name="body" className="textarea min-h-28" defaultValue={day?.body} required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Stay" name="stay" errors={state.errors}>
          <input name="stay" className="input" defaultValue={day?.stay ?? ""} placeholder="Homestay, Kibber" />
        </Field>
        <Field label="Altitude (m)" name="altitudeM" errors={state.errors}>
          <input name="altitudeM" type="number" className="input" defaultValue={day?.altitudeM ?? ""} />
        </Field>
        <Field label="Distance (km)" name="distanceKm" errors={state.errors}>
          <input
            name="distanceKm"
            type="number"
            step="0.1"
            className="input"
            defaultValue={day?.distanceKm ?? ""}
          />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton className="btn btn-dark btn-sm" pendingLabel="Saving…">
          {day ? "Save day" : "Add day"}
        </SubmitButton>
        {onDone ? (
          <button type="button" onClick={onDone} className="btn btn-ghost btn-sm">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

export function ItineraryEditor({
  tourId,
  days,
}: {
  tourId: string;
  days: ItineraryDay[];
}) {
  const [adding, setAdding] = useState(false);
  const nextDayNumber = days.length > 0 ? Math.max(...days.map((day) => day.dayNumber)) + 1 : 1;

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-ink/8 px-6 py-5">
        <div>
          <h2 className="display-3 text-lg">Itinerary</h2>
          <p className="mt-1 text-sm text-ink-400">
            {days.length} {days.length === 1 ? "day" : "days"} on the trip page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding((value) => !value)}
          className="btn btn-primary btn-sm"
        >
          {adding ? "Close" : "Add a day"}
        </button>
      </div>

      {adding ? (
        <div className="border-b border-ink/8">
          <DayForm tourId={tourId} nextDayNumber={nextDayNumber} onDone={() => setAdding(false)} />
        </div>
      ) : null}

      {days.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-ink-400">
          No days yet. Add the first one to build the day-by-day section.
        </p>
      ) : (
        <ul className="divide-y divide-ink/8">
          {days.map((day) => (
            <li key={day.id}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-4 px-6 py-4 transition-colors hover:bg-mist/60">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-mist">
                    {day.dayNumber}
                  </span>
                  <span className="flex-1 text-sm font-semibold">{day.title}</span>
                  <span className="text-xs text-ink-400 group-open:hidden">Edit</span>
                </summary>
                <DayForm tourId={tourId} day={day} />
                <form action={deleteItineraryDayAction} className="bg-mist/60 px-5 pb-5">
                  <input type="hidden" name="id" value={day.id} />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-ember-dark hover:underline"
                  >
                    Delete day {day.dayNumber}
                  </button>
                </form>
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
