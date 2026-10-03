import { deleteReviewAction, toggleReviewPublishedAction } from "@/actions/admin";
import { AddReviewPanel, ReviewForm } from "@/components/admin/ReviewForm";
import { EmptyState, PageHeader } from "@/components/admin/Ui";
import { Stars } from "@/components/site/Bits";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export default async function AdminReviewsPage() {
  const [reviews, tours, user] = await Promise.all([
    prisma.review.findMany({
      orderBy: [{ published: "desc" }, { createdAt: "desc" }],
      include: { tour: { select: { title: true } } },
    }),
    prisma.tour.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
    getSessionUser(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reviews"
        subtitle="Only published reviews appear on the website and count towards the average rating."
      />

      <AddReviewPanel tours={tours} />

      {reviews.length === 0 ? (
        <EmptyState title="No reviews yet" body="Add your first one above." />
      ) : (
        <ul className="space-y-5">
          {reviews.map((review) => (
            <li key={review.id} className="card overflow-hidden">
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <Stars rating={review.rating} />
                      <span
                        className={`pill ${
                          review.published ? "bg-teal-tint text-teal" : "bg-mist-200 text-ink-400"
                        }`}
                      >
                        {review.published ? "Published" : "Hidden"}
                      </span>
                    </div>
                    <p className="mt-3 font-display text-sm font-semibold">
                      {review.authorName}
                      {review.authorLocation ? (
                        <span className="font-normal text-ink-400"> · {review.authorLocation}</span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-400">
                      {review.tour?.title ?? "Not trip-specific"} · {formatDate(review.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <form action={toggleReviewPublishedAction}>
                      <input type="hidden" name="id" value={review.id} />
                      <button type="submit" className="btn btn-ghost btn-sm">
                        {review.published ? "Hide" : "Publish"}
                      </button>
                    </form>
                    {user?.role === "ADMIN" ? (
                      <form action={deleteReviewAction}>
                        <input type="hidden" name="id" value={review.id} />
                        <button
                          type="submit"
                          className="text-xs font-semibold text-ember-dark hover:underline"
                        >
                          Delete
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-ink-600">{review.body}</p>
              </div>

              <details className="group border-t border-ink/8">
                <summary className="cursor-pointer list-none px-6 py-3 text-xs font-semibold text-ink-400 transition-colors hover:bg-mist/60">
                  Edit this review
                </summary>
                <ReviewForm tours={tours} review={review} />
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
