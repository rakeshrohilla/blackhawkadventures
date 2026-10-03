"use client";

import { useActionState, useState } from "react";

import { saveReviewAction } from "@/actions/admin";
import { Field, FormBanner, SubmitButton } from "@/components/site/FormBits";
import { IDLE_STATE } from "@/lib/validation";
import type { Review } from "@/generated/prisma/client";

export function ReviewForm({
  tours,
  review,
  onDone,
}: {
  tours: { id: string; title: string }[];
  review?: Review;
  onDone?: () => void;
}) {
  const [state, action] = useActionState(saveReviewAction, IDLE_STATE);

  if (state.ok && onDone) onDone();

  return (
    <form action={action} className="space-y-4 bg-mist/60 px-5 py-5">
      {review ? <input type="hidden" name="id" value={review.id} /> : null}

      <FormBanner ok={state.ok} message={state.message} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Reviewer name" name="authorName" errors={state.errors}>
          <input name="authorName" className="input" defaultValue={review?.authorName} required />
        </Field>
        <Field label="Location" name="authorLocation" errors={state.errors}>
          <input
            name="authorLocation"
            className="input"
            defaultValue={review?.authorLocation ?? ""}
            placeholder="Pune"
          />
        </Field>
        <Field label="Rating" name="rating" errors={state.errors}>
          <select name="rating" className="select" defaultValue={String(review?.rating ?? 5)}>
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} star{value === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Trip" name="tourId" errors={state.errors}>
        <select name="tourId" className="select" defaultValue={review?.tourId ?? ""}>
          <option value="">Not trip-specific</option>
          {tours.map((tour) => (
            <option key={tour.id} value={tour.id}>
              {tour.title}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Review" name="body" errors={state.errors}>
        <textarea name="body" className="textarea min-h-32" defaultValue={review?.body} required />
      </Field>

      <label className="flex items-center gap-3 text-sm font-medium">
        <input
          type="checkbox"
          name="published"
          defaultChecked={review?.published ?? false}
          className="h-4 w-4 accent-[#e8572a]"
        />
        Published on the website
      </label>

      <div className="flex items-center gap-3">
        <SubmitButton className="btn btn-dark btn-sm" pendingLabel="Saving…">
          {review ? "Save review" : "Add review"}
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

export function AddReviewPanel({ tours }: { tours: { id: string; title: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => setOpen((value) => !value)} className="btn btn-primary btn-sm">
        {open ? "Close" : "Add a review"}
      </button>
      {open ? (
        <div className="card mt-4 overflow-hidden">
          <ReviewForm tours={tours} onDone={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
