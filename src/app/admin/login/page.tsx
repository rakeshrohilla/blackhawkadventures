import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/LoginForm";
import { Logo, Wordmark } from "@/components/site/Logo";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Staff login",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, user] = await Promise.all([searchParams, getSessionUser()]);

  if (user) redirect("/admin");

  return (
    <div className="grain flex min-h-screen flex-col items-center justify-center bg-ink px-5 py-16">
      <Link href="/" className="flex items-center gap-3 text-white">
        <Logo className="h-9 w-9" />
        <Wordmark />
      </Link>

      <div className="mt-10 w-full max-w-sm">
        <div className="card p-8">
          <h1 className="display-3 text-2xl">Staff login</h1>
          <p className="mt-2 text-sm text-ink-400">
            Sign in to manage trips, departures and bookings.
          </p>
          <div className="mt-7">
            <LoginForm next={next} />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/40">
          Lost your password? Ask an administrator to reset it.
        </p>
        <p className="mt-2 text-center text-xs">
          <Link href="/" className="text-white/50 transition-colors hover:text-white">
            ← Back to the website
          </Link>
        </p>
      </div>
    </div>
  );
}
