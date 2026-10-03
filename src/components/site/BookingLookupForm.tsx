"use client";

import { useActionState } from "react";

import { lookupBookingAction } from "@/actions/public";
import { IDLE_STATE } from "@/lib/validation";
import { FormBanner, SubmitButton } from "./FormBits";

export function BookingLookupForm({ defaultReference = "" }: { defaultReference?: string }) {
  const [state, action] = useActionState(lookupBookingAction, IDLE_STATE);

  return (
    <form action={action} className="card space-y-5 p-7 sm:p-8">
      <FormBanner ok={false} message={state.message} />

      <div>
        <label className="label" htmlFor="reference">
          Booking reference
        </label>
        <input
          id="reference"
          name="reference"
          className="input font-mono uppercase tracking-wider"
          placeholder="BHA-XXXXXX"
          defaultValue={defaultReference}
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="email">
          Email address on the booking
        </label>
        <input id="email" name="email" type="email" className="input" required autoComplete="email" />
      </div>

      <SubmitButton pendingLabel="Looking…">Find my booking</SubmitButton>
    </form>
  );
}
