"use client";

import { useActionState, useState } from "react";

import { deleteDepartureAction, saveDepartureAction } from "@/actions/admin";
import { DepartureBadge } from "@/components/admin/Ui";
import { Field, FormBanner, SubmitButton } from "@/components/site/FormBits";
import { seatsLeft } from "@/lib/booking-client";
import { DEPARTURE_STATUS_LABEL } from "@/lib/constants";
import { formatDateRange, formatMoney, toDateInputValue } from "@/lib/format";
import { IDLE_STATE } from "@/lib/validation";
import type { Departure } from "@/generated/prisma/client";

const STATUSES = ["SCHEDULED", "GUARANTEED", "FULL", "CANCELLED"] as const;

function DepartureForm({
  tourId,
  departure,
  durationDays,
  defaultCapacity,
  onDone,
}: {
  tourId: string;
  departure?: Departure;
  durationDays: number;
  defaultCapacity: number;
  onDone?: () => void;
}) {
  const [state, action] = useActionState(saveDepartureAction, IDLE_STATE);
  const [start, setStart] = useState(
    departure ? toDateInputValue(departure.startDate) : "",
  );

  // Suggest an end date based on the trip length.
  const suggestedEnd = (() => {
    if (!start) return departure ? toDateInputValue(departure.endDate) : "";
    const date = new Date(`${start}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + Math.max(0, durationDays - 1));
    return date.toISOString().slice(0, 10);
  })();

  if (state.ok && onDone) onDone();

  return (
    <form action={action} className="space-y-4 bg-mist/60 px-5 py-5">
      <input type="hidden" name="tourId" value={tourId} />
      {departure ? <input type="hidden" name="id" value={departure.id} /> : null}

      <FormBanner ok={state.ok} message={state.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start date" name="startDate" errors={state.errors}>
          <input
            name="startDate"
            type="date"
            className="input"
            value={start}
            onChange={(event) => setStart(event.target.value)}
            required
          />
        </Field>
        <Field
          label="End date"
          name="endDate"
          errors={state.errors}
          hint={`${durationDays}-day trip`}
        >
          <input
            name="endDate"
            type="date"
            className="input"
            key={suggestedEnd}
            defaultValue={suggestedEnd}
            required
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Capacity" name="capacity" errors={state.errors}>
          <input
            name="capacity"
            type="number"
            min={1}
            max={60}
            className="input"
            defaultValue={departure?.capacity ?? defaultCapacity}
            required
          />
        </Field>
        <Field
          label="Price override"
          name="price"
          errors={state.errors}
          hint="Blank = trip price"
        >
          <input
            name="price"
            type="number"
            min={0}
            step={100}
            className="input"
            defaultValue={departure?.priceCents ? departure.priceCents / 100 : ""}
          />
        </Field>
        <Field label="Status" name="status" errors={state.errors}>
          <select name="status" className="select" defaultValue={departure?.status ?? "SCHEDULED"}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {DEPARTURE_STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Internal notes" name="notes" errors={state.errors}>
        <input name="notes" className="input" defaultValue={departure?.notes ?? ""} />
      </Field>

      <div className="flex items-center gap-3">
        <SubmitButton className="btn btn-dark btn-sm" pendingLabel="Saving…">
          {departure ? "Save departure" : "Add departure"}
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

export function DepartureEditor({
  tourId,
  durationDays,
  defaultCapacity,
  currency,
  basePriceCents,
  departures,
}: {
  tourId: string;
  durationDays: number;
  defaultCapacity: number;
  currency: string;
  basePriceCents: number;
  departures: Departure[];
}) {
  const [adding, setAdding] = useState(false);

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-ink/8 px-6 py-5">
        <div>
          <h2 className="display-3 text-lg">Departures</h2>
          <p className="mt-1 text-sm text-ink-400">
            {departures.length} {departures.length === 1 ? "date" : "dates"} on sale or past.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding((value) => !value)}
          className="btn btn-primary btn-sm"
        >
          {adding ? "Close" : "Add a date"}
        </button>
      </div>

      {adding ? (
        <div className="border-b border-ink/8">
          <DepartureForm
            tourId={tourId}
            durationDays={durationDays}
            defaultCapacity={defaultCapacity}
            onDone={() => setAdding(false)}
          />
        </div>
      ) : null}

      {departures.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-ink-400">
          No dates yet. Nobody can book this trip until you add one.
        </p>
      ) : (
        <ul className="divide-y divide-ink/8">
          {departures.map((departure) => (
            <li key={departure.id}>
              <details className="group">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-5 gap-y-2 px-6 py-4 transition-colors hover:bg-mist/60">
                  <span className="flex-1 text-sm font-semibold">
                    {formatDateRange(departure.startDate, departure.endDate)}
                  </span>
                  <span className="text-xs font-medium text-ink-400">
                    {departure.seatsBooked}/{departure.capacity} booked ·{" "}
                    {seatsLeft(departure)} left
                  </span>
                  <span className="text-xs font-semibold">
                    {formatMoney(departure.priceCents ?? basePriceCents, currency)}
                  </span>
                  <DepartureBadge status={departure.status} />
                </summary>
                <DepartureForm
                  tourId={tourId}
                  departure={departure}
                  durationDays={durationDays}
                  defaultCapacity={defaultCapacity}
                />
                <form action={deleteDepartureAction} className="bg-mist/60 px-5 pb-5">
                  <input type="hidden" name="id" value={departure.id} />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-ember-dark hover:underline"
                  >
                    Delete this date (cancels it instead if it has bookings)
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
