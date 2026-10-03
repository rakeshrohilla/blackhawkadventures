export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M1.5 25.5 11 9l5.5 9.5L20.5 12l10 13.5H1.5Z" fill="currentColor" />
      <path
        d="M13.5 5.8c3-2.4 5.6-2.9 7.6-.9 2-2 4.6-1.5 7.6 1-3-1-5.6 0-7.6 2-2-2.4-4.6-3-7.6-2.1Z"
        fill="#e8572a"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="font-display text-[0.95rem] font-bold tracking-tight uppercase leading-none">
        Black Hawk
      </span>
      <span className="font-display text-[0.7rem] font-medium uppercase tracking-[0.22em] opacity-60 leading-none">
        Adventures
      </span>
    </span>
  );
}
