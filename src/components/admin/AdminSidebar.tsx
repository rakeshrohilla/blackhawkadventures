"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { logoutAction } from "@/actions/auth";
import { Icon } from "@/components/site/Icon";
import { Logo } from "@/components/site/Logo";
import type { SessionUser } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "map", exact: true },
  { href: "/admin/bookings", label: "Bookings", icon: "check", countKey: "bookings" as const },
  { href: "/admin/departures", label: "Departures", icon: "calendar" },
  { href: "/admin/tours", label: "Trips", icon: "mountain" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "phone", countKey: "enquiries" as const },
  { href: "/admin/reviews", label: "Reviews", icon: "star" },
  { href: "/admin/settings", label: "Settings", icon: "shield" },
];

export function AdminSidebar({
  user,
  counts,
}: {
  user: SessionUser;
  counts: { bookings: number; enquiries: number };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [renderedPath, setRenderedPath] = useState(pathname);

  // Collapse the mobile nav on navigation without triggering a cascading render.
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setOpen(false);
  }

  const nav = (
    <nav className="space-y-1" aria-label="Admin">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const count = item.countKey ? counts[item.countKey] : 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-white/12 text-white" : "text-white/60 hover:bg-white/6 hover:text-white"
            }`}
          >
            <Icon name={item.icon} className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {count > 0 ? (
              <span className="rounded-full bg-ember px-2 py-0.5 text-[0.7rem] font-bold text-white">
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 pt-5">
      <p className="truncate text-sm font-semibold text-white">{user.name}</p>
      <p className="truncate text-xs text-white/45">{user.email}</p>
      <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ember">
        {user.role}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <Link
          href="/"
          className="text-xs font-medium text-white/55 transition-colors hover:text-white"
        >
          View website →
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-xs font-semibold text-white/55 transition-colors hover:text-ember"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* mobile bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-ink px-5 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5 text-white">
          <Logo className="h-7 w-7" />
          <span className="font-display text-sm font-bold uppercase tracking-tight">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white"
          aria-expanded={open}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <div className="sticky top-[3.3rem] z-30 border-b border-white/10 bg-ink px-5 py-5 lg:hidden">
          {nav}
          <div className="mt-5">{footer}</div>
        </div>
      ) : null}

      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between bg-ink px-4 py-6 lg:flex">
        <div>
          <Link href="/admin" className="mb-9 flex items-center gap-3 px-2 text-white">
            <Logo className="h-8 w-8" />
            <span className="font-display text-sm font-bold uppercase leading-tight tracking-tight">
              Black Hawk
              <span className="block text-[0.65rem] font-medium tracking-[0.2em] text-white/45">
                Admin
              </span>
            </span>
          </Link>
          {nav}
        </div>
        {footer}
      </aside>
    </>
  );
}
