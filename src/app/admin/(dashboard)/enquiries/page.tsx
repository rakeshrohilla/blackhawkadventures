import Link from "next/link";

import { deleteEnquiryAction, updateEnquiryStatusAction } from "@/actions/admin";
import { EmptyState, EnquiryBadge, PageHeader } from "@/components/admin/Ui";
import { getSessionUser } from "@/lib/auth";
import { ENQUIRY_STATUS_LABEL } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import type { EnquiryStatus } from "@/generated/prisma/client";

const STATUSES: EnquiryStatus[] = ["NEW", "IN_PROGRESS", "CLOSED"];

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ status }, user] = await Promise.all([searchParams, getSessionUser()]);
  const activeStatus = STATUSES.includes(status as EnquiryStatus)
    ? (status as EnquiryStatus)
    : undefined;

  const [enquiries, counts] = await Promise.all([
    prisma.enquiry.findMany({
      where: activeStatus ? { status: activeStatus } : {},
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 100,
      include: { tour: { select: { title: true, slug: true } } },
    }),
    prisma.enquiry.groupBy({ by: ["status"], _count: true }),
  ]);

  const countFor = (value: EnquiryStatus) =>
    counts.find((row) => row.status === value)?._count ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader title="Enquiries" subtitle="Every message from the website contact forms." />

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/enquiries"
          className={`btn btn-sm ${activeStatus ? "btn-ghost" : "btn-dark"}`}
        >
          All
        </Link>
        {STATUSES.map((value) => (
          <Link
            key={value}
            href={`/admin/enquiries?status=${value}`}
            className={`btn btn-sm ${activeStatus === value ? "btn-dark" : "btn-ghost"}`}
          >
            {ENQUIRY_STATUS_LABEL[value]} ({countFor(value)})
          </Link>
        ))}
      </div>

      {enquiries.length === 0 ? (
        <EmptyState title="Inbox empty" body="No enquiries match that filter." />
      ) : (
        <ul className="space-y-5">
          {enquiries.map((enquiry) => (
            <li key={enquiry.id} className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-base font-semibold">
                    {enquiry.subject || "No subject"}
                  </h2>
                  <p className="mt-1 text-sm text-ink-400">
                    {enquiry.name} ·{" "}
                    <a href={`mailto:${enquiry.email}`} className="text-ember hover:underline">
                      {enquiry.email}
                    </a>
                    {enquiry.phone ? (
                      <>
                        {" · "}
                        <a href={`tel:${enquiry.phone}`} className="text-ember hover:underline">
                          {enquiry.phone}
                        </a>
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <EnquiryBadge status={enquiry.status} />
                  <p className="text-xs text-ink-400">{formatDateTime(enquiry.createdAt)}</p>
                </div>
              </div>

              {enquiry.tour ? (
                <p className="mt-3">
                  <Link
                    href={`/tours/${enquiry.tour.slug}`}
                    target="_blank"
                    className="pill bg-mist text-ink-600"
                  >
                    {enquiry.tour.title}
                  </Link>
                </p>
              ) : null}

              <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-ink-600">
                {enquiry.message}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-ink/8 pt-5">
                {STATUSES.filter((value) => value !== enquiry.status).map((value) => (
                  <form key={value} action={updateEnquiryStatusAction}>
                    <input type="hidden" name="id" value={enquiry.id} />
                    <input type="hidden" name="status" value={value} />
                    <button type="submit" className="btn btn-ghost btn-sm">
                      Mark {ENQUIRY_STATUS_LABEL[value].toLowerCase()}
                    </button>
                  </form>
                ))}

                <a
                  href={`mailto:${enquiry.email}?subject=${encodeURIComponent(
                    `Re: ${enquiry.subject || "your enquiry"}`,
                  )}`}
                  className="btn btn-dark btn-sm"
                >
                  Reply by email
                </a>

                {user?.role === "ADMIN" ? (
                  <form action={deleteEnquiryAction} className="ml-auto">
                    <input type="hidden" name="id" value={enquiry.id} />
                    <button
                      type="submit"
                      className="text-xs font-semibold text-ember-dark hover:underline"
                    >
                      Delete
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
