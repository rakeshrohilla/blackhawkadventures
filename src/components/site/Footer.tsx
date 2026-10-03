import Link from "next/link";

import type { Settings } from "@/lib/settings-defaults";
import { Logo, Wordmark } from "./Logo";

export function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="grain relative overflow-hidden bg-ink text-mist">
      <div className="relative mx-auto max-w-7xl px-5 pt-20 pb-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3 text-white">
              <Logo className="h-9 w-9" />
              <Wordmark />
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              Small-group road trips and mountain escapes across the Indian Himalaya. Local guides,
              honest itineraries, and groups small enough to change plans when the weather does.
            </p>
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-ember"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .3-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 5.3a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 7.4a2.9 2.9 0 1 1 0-5.8 2.9 2.9 0 0 1 0 5.8Zm5.8-7.6a1.05 1.05 0 1 1-2.1 0 1.05 1.05 0 0 1 2.1 0Z" />
              </svg>
              @blackhawkadventures
            </a>
          </div>

          <nav aria-label="Trips">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              Trips
            </h2>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                { href: "/tours", label: "All departures" },
                { href: "/tours?region=Himachal", label: "Himachal" },
                { href: "/tours?region=Ladakh", label: "Ladakh" },
                { href: "/tours?region=Uttarakhand", label: "Uttarakhand" },
                { href: "/tours?region=North+East", label: "North East" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/65 transition-colors hover:text-ember">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              Company
            </h2>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                { href: "/about", label: "About us" },
                { href: "/contact", label: "Contact" },
                { href: "/bookings", label: "Find my booking" },
                { href: "/admin", label: "Staff login" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/65 transition-colors hover:text-ember">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
              Talk to a human
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-white/65">
              <li>
                <a href={`tel:${settings.contactPhone.replace(/\s/g, "")}`} className="transition-colors hover:text-ember">
                  {settings.contactPhone}
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.contactEmail}`} className="transition-colors hover:text-ember">
                  {settings.contactEmail}
                </a>
              </li>
              <li className="leading-relaxed">{settings.officeAddress}</li>
            </ul>
            {settings.whatsappNumber ? (
              <a
                href={`https://wa.me/${settings.whatsappNumber}`}
                target="_blank"
                rel="noreferrer noopener"
                className="btn btn-ghost-light btn-sm mt-6"
              >
                WhatsApp us
              </a>
            ) : null}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Black Hawk Adventures. All rights reserved.</p>
          <p>Carry out what you carry in.</p>
        </div>
      </div>
    </footer>
  );
}
