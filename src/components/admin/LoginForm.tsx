"use client";

import { useActionState } from "react";

import { loginAction } from "@/actions/auth";
import { Field, FormBanner, SubmitButton } from "@/components/site/FormBits";
import { IDLE_STATE } from "@/lib/validation";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, IDLE_STATE);

  return (
    <form action={action} className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <FormBanner ok={false} message={state.message} />

      <Field label="Email" name="email" errors={state.errors}>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          required
          autoComplete="username"
          autoFocus
        />
      </Field>

      <Field label="Password" name="password" errors={state.errors}>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          required
          autoComplete="current-password"
        />
      </Field>

      <SubmitButton pendingLabel="Signing in…">Sign in</SubmitButton>
    </form>
  );
}
