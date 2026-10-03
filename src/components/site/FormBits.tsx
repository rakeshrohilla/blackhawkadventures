"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

import type { FormErrors } from "@/lib/validation";

export function Field({
  label,
  name,
  errors,
  children,
  hint,
}: {
  label: string;
  name: string;
  errors?: FormErrors;
  children: ReactNode;
  hint?: string;
}) {
  const error = errors?.[name];
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      {children}
      {hint && !error ? <p className="mt-1.5 text-xs text-ink-400">{hint}</p> : null}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SubmitButton({
  children,
  className = "btn btn-primary w-full",
  pendingLabel = "Sending…",
}: {
  children: ReactNode;
  className?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}

export function FormBanner({ ok, message }: { ok: boolean; message?: string }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${
        ok
          ? "border-teal/30 bg-teal-tint text-teal"
          : "border-ember/30 bg-ember-tint text-ember-dark"
      }`}
    >
      {message}
    </div>
  );
}
