import type { Metadata } from "next";

import { BookingLookupForm } from "@/components/site/BookingLookupForm";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Find my booking",
  description: "Look up an existing Black Hawk Adventures booking with your reference and email.",
  robots: { index: false, follow: true },
};

export default async function BookingsPage() {
  const settings = await getSettings();

  return (
    <div className="bg-mist">
      <section className="grain relative overflow-hidden bg-ink pt-36 pb-16 sm:pt-44">
        <div className="relative mx-auto max-w-xl px-5">
          <p className="eyebrow">Your trip</p>
          <h1 className="display-2 mt-5 text-white">Find my booking</h1>
          <p className="lead mt-5 text-white/65">
            Enter the reference we emailed you — it looks like BHA-K7MQ2X — along with the email
            address on the booking.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-xl px-5 py-14">
        <BookingLookupForm />

        <p className="mt-8 text-center text-sm text-ink-400">
          Lost the reference? Email{" "}
          <a href={`mailto:${settings.contactEmail}`} className="font-medium text-ember hover:underline">
            {settings.contactEmail}
          </a>{" "}
          or call{" "}
          <a
            href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}
            className="font-medium text-ember hover:underline"
          >
            {settings.contactPhone}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
