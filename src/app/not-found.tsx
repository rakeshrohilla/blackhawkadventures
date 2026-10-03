import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-5 text-center text-mist">
      <p className="eyebrow">Error 404</p>
      <h1 className="display-1 mt-5 text-white">Off the trail.</h1>
      <p className="lead mt-5 max-w-md text-white/60">
        That page does not exist. It may have moved, or the link may be out of date.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          Back to home
        </Link>
        <Link href="/tours" className="btn btn-ghost-light">
          Browse all trips
        </Link>
      </div>
    </div>
  );
}
