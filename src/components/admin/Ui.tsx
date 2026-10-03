import Link from "next/link";
import type { ReactNode } from "react";

import type { BookingStatus, DepartureStatus, EnquiryStatus, PaymentStatus } from "@/generated/prisma/client";
import {
  BOOKING_STATUS_LABEL,
  DEPARTURE_STATUS_LABEL,
  ENQUIRY_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
} from "@/lib/constants";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-5 border-b border-ink/8 pb-6">
      <div>
        <h1 className="display-3 text-2xl">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-sm text-ink-400">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  href,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  href?: string;
  accent?: boolean;
}) {
  const content = (
    <div
      className={`card h-full p-5 transition-shadow ${href ? "hover:shadow-md" : ""} ${
        accent ? "border-ember/30 bg-ember-tint" : ""
      }`}
    >
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-400">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      {sub ? <p className="mt-1 text-xs text-ink-400">{sub}</p> : null}
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}

const BOOKING_STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-ember-tint text-ember-dark",
  CONFIRMED: "bg-teal-tint text-teal",
  CANCELLED: "bg-mist-200 text-ink-400",
  COMPLETED: "bg-ink text-mist",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  UNPAID: "bg-mist-200 text-ink-400",
  DEPOSIT_PAID: "bg-ember-tint text-ember-dark",
  PAID: "bg-teal-tint text-teal",
  REFUNDED: "bg-mist-200 text-ink-400",
};

const DEPARTURE_STYLES: Record<DepartureStatus, string> = {
  SCHEDULED: "bg-mist-200 text-ink-600",
  GUARANTEED: "bg-teal-tint text-teal",
  FULL: "bg-ink text-mist",
  CANCELLED: "bg-ember-tint text-ember-dark",
};

const ENQUIRY_STYLES: Record<EnquiryStatus, string> = {
  NEW: "bg-ember-tint text-ember-dark",
  IN_PROGRESS: "bg-teal-tint text-teal",
  CLOSED: "bg-mist-200 text-ink-400",
};

export function BookingBadge({ status }: { status: BookingStatus }) {
  return <span className={`pill ${BOOKING_STYLES[status]}`}>{BOOKING_STATUS_LABEL[status]}</span>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <span className={`pill ${PAYMENT_STYLES[status]}`}>{PAYMENT_STATUS_LABEL[status]}</span>;
}

export function DepartureBadge({ status }: { status: DepartureStatus }) {
  return (
    <span className={`pill ${DEPARTURE_STYLES[status]}`}>{DEPARTURE_STATUS_LABEL[status]}</span>
  );
}

export function EnquiryBadge({ status }: { status: EnquiryStatus }) {
  return <span className={`pill ${ENQUIRY_STYLES[status]}`}>{ENQUIRY_STATUS_LABEL[status]}</span>;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="card p-12 text-center">
      <h2 className="display-3 text-lg">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-400">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function TableShell({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] text-left text-sm">
          <thead className="border-b border-ink/8 bg-mist text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-ink-400">
            {head}
          </thead>
          <tbody className="divide-y divide-ink/8">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
