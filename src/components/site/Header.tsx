"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo, Wordmark } from "./Logo";

const NAV = [
  { href: "/tours", label: "Trips" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
];

export function Header({ announcement }: { announcement?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renderedPath, setRenderedPath] = useState(pathname);

  // Close the mobile menu when the route changes (adjusting state during render
  // rather than in an effect — see react.dev "You Might Not Need an Effect").
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {announcement ? (
        <div
          className={`overflow-hidden bg-ember text-white transition-all duration-500 ${
            scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
          }`}
        >
          <p className="mx-auto max-w-7xl px-5 py-2 text-center text-[0.8rem] font-medium tracking-wide">
            {announcement}
          </p>
        </div>
      ) : null}

      <div
        className={`transition-colors duration-500 ${
          scrolled || menuOpen
            ? "border-b border-white/10 bg-ink/95 backdrop-blur-md"
            : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-white transition-opacity hover:opacity-80"
            aria-label="Black Hawk Adventures — home"
          >
            <Logo className="h-8 w-8" />
            <Wordmark className="hidden text-white sm:inline-flex" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative text-sm font-medium text-white/85 transition-colors hover:text-white ${
                    active ? "text-white" : ""
                  }`}
                >
                  {item.label}
                  {active ? (
                    <span className="absolute -bottom-1.5 left-0 h-[2px] w-full rounded-full bg-ember" />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/bookings"
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              My booking
            </Link>
            <Link href="/contact" className="btn btn-primary btn-sm">
              Plan a trip
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 h-[2px] w-4 bg-current transition-transform duration-300 ${
                  menuOpen ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-[2px] w-4 bg-current transition-opacity duration-200 ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 h-[2px] w-4 bg-current transition-transform duration-300 ${
                  menuOpen ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div id="mobile-nav" className="h-[100dvh] bg-ink px-5 pt-6 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {[...NAV, { href: "/bookings", label: "My booking" }].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-white/10 py-4 font-display text-2xl font-semibold text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/contact" className="btn btn-primary mt-8 w-full">
            Plan a trip
          </Link>
        </div>
      ) : null}
    </header>
  );
}
