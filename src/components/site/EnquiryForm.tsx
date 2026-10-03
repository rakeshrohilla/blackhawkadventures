"use client";

import { useActionState } from "react";

import { submitEnquiry } from "@/actions/public";
import { IDLE_STATE } from "@/lib/validation";
import { Field, FormBanner, SubmitButton } from "./FormBits";

export function EnquiryForm({
  tours,
  defaultTourId,
}: {
  tours: { id: string; title: string }[];
  defaultTourId?: string;
}) {
  const [state, action] = useActionState(submitEnquiry, IDLE_STATE);

  if (state.ok) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-tint text-teal">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
            <path d="M9.6 16.2 5.4 12l-1.4 1.4 5.6 5.6L20.4 7.8 19 6.4 9.6 16.2Z" />
          </svg>
        </div>
        <h3 className="display-3 mt-5">Message received.</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-400">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-5 p-7 sm:p-8">
      <FormBanner ok={false} message={state.message} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="name" errors={state.errors}>
          <input id="name" name="name" className="input" required autoComplete="name" />
        </Field>
        <Field label="Email" name="email" errors={state.errors}>
          <input id="email" name="email" type="email" className="input" required autoComplete="email" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone / WhatsApp" name="phone" errors={state.errors} hint="Optional, but it speeds things up.">
          <input id="phone" name="phone" className="input" autoComplete="tel" />
        </Field>
        <Field label="Trip you're interested in" name="tourId" errors={state.errors}>
          <select id="tourId" name="tourId" className="select" defaultValue={defaultTourId ?? ""}>
            <option value="">Not sure yet / custom trip</option>
            {tours.map((tour) => (
              <option key={tour.id} value={tour.id}>
                {tour.title}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Subject" name="subject" errors={state.errors}>
        <input id="subject" name="subject" className="input" placeholder="e.g. January departure for 4 people" />
      </Field>

      <Field
        label="Message"
        name="message"
        errors={state.errors}
        hint="Dates you're free, group size, fitness level, anything you're worried about."
      >
        <textarea id="message" name="message" className="textarea" required />
      </Field>

      <SubmitButton>Send enquiry</SubmitButton>

      <p className="text-center text-xs text-ink-400">
        We reply to every enquiry within one working day. No mailing list, no spam.
      </p>
    </form>
  );
}
