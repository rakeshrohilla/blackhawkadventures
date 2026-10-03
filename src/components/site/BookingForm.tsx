"use client";

import { useActionState, useState } from "react";

import { createBookingAction } from "@/actions/public";
import { DEPOSIT_PERCENT, MAX_GUESTS_PER_BOOKING } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { IDLE_STATE } from "@/lib/validation";
import { Field, FormBanner, SubmitButton } from "./FormBits";

export function BookingForm({
  departureId,
  unitPriceCents,
  currency,
  seatsAvailable,
}: {
  departureId: string;
  unitPriceCents: number;
  currency: string;
  seatsAvailable: number;
}) {
  const [state, action] = useActionState(createBookingAction, IDLE_STATE);
  const [guests, setGuests] = useState(1);

  const maxGuests = Math.min(seatsAvailable, MAX_GUESTS_PER_BOOKING);
  const total = unitPriceCents * guests;
  const deposit = Math.round((total * DEPOSIT_PERCENT) / 100);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="departureId" value={departureId} />

      <FormBanner ok={false} message={state.message} />

      <div className="card p-6 sm:p-7">
        <h2 className="display-3 text-xl">Who is coming?</h2>

        <div className="mt-5">
          <Field label="Number of travellers" name="guests" errors={state.errors}>
            <select
              id="guests"
              name="guests"
              className="select"
              value={guests}
              onChange={(event) => setGuests(Number(event.target.value))}
            >
              {Array.from({ length: Math.max(1, maxGuests) }, (_, index) => index + 1).map((count) => (
                <option key={count} value={count}>
                  {count} {count === 1 ? "traveller" : "travellers"}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-6 space-y-4">
          {Array.from({ length: guests }, (_, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[1fr_7rem]">
              <div>
                <label className="label" htmlFor={`travellerName-${index}`}>
                  {index === 0 ? "Lead traveller — full name" : `Traveller ${index + 1} — full name`}
                </label>
                <input
                  id={`travellerName-${index}`}
                  name="travellerName"
                  className="input"
                  placeholder="As printed on their ID"
                  required={index === 0}
                />
              </div>
              <div>
                <label className="label" htmlFor={`travellerAge-${index}`}>
                  Age
                </label>
                <input
                  id={`travellerAge-${index}`}
                  name="travellerAge"
                  type="number"
                  min={1}
                  max={100}
                  className="input"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 sm:p-7">
        <h2 className="display-3 text-xl">How do we reach you?</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Your name" name="customerName" errors={state.errors}>
            <input id="customerName" name="customerName" className="input" required autoComplete="name" />
          </Field>
          <Field label="Email" name="customerEmail" errors={state.errors}>
            <input
              id="customerEmail"
              name="customerEmail"
              type="email"
              className="input"
              required
              autoComplete="email"
            />
          </Field>
          <Field label="Phone / WhatsApp" name="customerPhone" errors={state.errors}>
            <input id="customerPhone" name="customerPhone" className="input" required autoComplete="tel" />
          </Field>
          <Field label="Country" name="customerCountry" errors={state.errors}>
            <input
              id="customerCountry"
              name="customerCountry"
              className="input"
              autoComplete="country-name"
              defaultValue="India"
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field
            label="Anything we should know?"
            name="notes"
            errors={state.errors}
            hint="Dietary needs, medical conditions, arrival plans, rooming requests."
          >
            <textarea id="notes" name="notes" className="textarea" />
          </Field>
        </div>
      </div>

      <div className="card bg-ink p-6 text-mist sm:p-7">
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-white/60">
              {formatMoney(unitPriceCents, currency)} × {guests}
            </dt>
            <dd className="font-medium">{formatMoney(total, currency)}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <dt className="font-display text-base font-semibold text-white">Trip total</dt>
            <dd className="font-display text-xl font-bold text-white">{formatMoney(total, currency)}</dd>
          </div>
          <div className="flex items-center justify-between text-ember">
            <dt className="font-medium">Due now to hold your seat ({DEPOSIT_PERCENT}%)</dt>
            <dd className="font-display text-base font-bold">{formatMoney(deposit, currency)}</dd>
          </div>
        </dl>

        <SubmitButton className="btn btn-primary mt-6 w-full" pendingLabel="Reserving your seat…">
          Request these seats
        </SubmitButton>

        <p className="mt-4 text-xs leading-relaxed text-white/50">
          This reserves your seats and sends the booking to our team. No payment is taken now — we
          email you a payment link and the full joining instructions once we have confirmed the
          departure.
        </p>
      </div>
    </form>
  );
}
