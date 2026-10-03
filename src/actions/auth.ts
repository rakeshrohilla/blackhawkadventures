"use server";

import { redirect } from "next/navigation";

import { endSession, startSession, verifyCredentials } from "@/lib/auth";
import { fieldErrors, loginSchema, type ActionState } from "@/lib/validation";

export async function loginAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);

  if (!user) {
    return { ok: false, message: "That email and password combination is not right." };
  }

  await startSession(user);

  // Only ever redirect back inside the admin area.
  const next =
    parsed.data.next && parsed.data.next.startsWith("/admin") ? parsed.data.next : "/admin";
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}
