import type { Metadata } from "next";

import { SectionHeading } from "@/components/site/Bits";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { HeroArt } from "@/components/site/HeroArt";
import { Icon } from "@/components/site/Icon";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Talk to Black Hawk Adventures about a Himalayan trek, a road trip or a custom departure for your group.",
};

const FAQS = [
  {
    q: "How fit do I need to be?",
    a: "It depends on the trip, and each trip page says so plainly. As a rule: if you can walk briskly for an hour without stopping, you can do our Easy and Moderate trips. Challenging and Expert trips need a few months of deliberate preparation, and we will tell you honestly if we think a trip is wrong for you.",
  },
  {
    q: "What happens about altitude?",
    a: "Every high-altitude itinerary is built around acclimatisation — we gain height slowly and build in rest days even when it makes the trip a day longer. Leaders carry oximeters and check the group twice daily, and supplementary oxygen is carried on all trips above 3,500 m. A leader can turn any guest, or the whole group, around.",
  },
  {
    q: "How do payments work?",
    a: "A 25% deposit holds your seat. The balance is due 30 days before departure. We send a payment link once we have confirmed the departure — nothing is charged when you submit a booking request on the site.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Full refund of the deposit if you cancel more than 45 days out, 50% between 45 and 30 days, and no refund inside 30 days. If we cancel a departure for any reason, you get everything back or a transfer to another date, your choice.",
  },
  {
    q: "Can you run a private trip for our group?",
    a: "Yes — this is roughly half of what we do. Corporate offsites, family groups, college batches and photography groups. Tell us the group size, rough dates and what you want out of it and we will send a plan and a quote.",
  },
  {
    q: "Do you arrange flights and trains?",
    a: "No, and we do not mark them up either. Every trip page lists the start and end point, and we tell you exactly which flight or train to aim for once you have booked.",
  },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ tour?: string }>;
}) {
  const [{ tour }, settings, tours] = await Promise.all([
    searchParams,
    getSettings(),
    prisma.tour.findMany({
      where: { published: true },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <>
      <section className="grain relative overflow-hidden bg-ink">
        <HeroArt variant="valley" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-linear-to-r from-ink/95 via-ink/70 to-ink/30" />
        <div className="absolute inset-0 bg-linear-to-b from-ink/55 via-transparent to-ink/90" />
        <div className="relative mx-auto max-w-7xl px-5 pt-36 pb-16 sm:pt-44 sm:pb-20">
          <SectionHeading
            eyebrow="Get in touch"
            title="Talk to someone who has been there."
            intro="Every enquiry is answered by a person who has run the trip you are asking about — within one working day."
            light
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <EnquiryForm tours={tours} defaultTourId={tour} />

          <div className="space-y-5">
            <div className="card p-7">
              <h2 className="display-3 text-xl">Reach us directly</h2>
              <ul className="mt-6 space-y-5 text-sm">
                <li className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mist text-ink-400">
                    <Icon name="phone" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
                      Phone
                    </p>
                    <a
                      href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}
                      className="font-medium transition-colors hover:text-ember"
                    >
                      {settings.contactPhone}
                    </a>
                    <p className="mt-0.5 text-xs text-ink-400">9am–8pm IST, every day</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mist text-ink-400">
                    <Icon name="check" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
                      Email
                    </p>
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="font-medium transition-colors hover:text-ember"
                    >
                      {settings.contactEmail}
                    </a>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mist text-ink-400">
                    <Icon name="pin" className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
                      Office
                    </p>
                    <p className="font-medium leading-relaxed">{settings.officeAddress}</p>
                  </div>
                </li>
              </ul>

              {settings.whatsappNumber ? (
                <a
                  href={`https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn btn-primary mt-7 w-full"
                >
                  Message us on WhatsApp
                </a>
              ) : null}
            </div>

            <div className="card bg-ink p-7 text-mist">
              <h2 className="font-display text-lg font-semibold text-white">Booking a group?</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-white/60">
                Private departures for 6 or more, corporate offsites and college groups. Send us the
                group size and rough dates and we will come back with a plan and a quote.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-ink/8 bg-paper">
        <div className="mx-auto max-w-3xl px-5 py-24">
          <SectionHeading eyebrow="Before you ask" title="Questions we get a lot." align="center" />
          <div className="mt-14 overflow-hidden rounded-card border border-ink/10">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group border-b border-ink/8 bg-paper last:border-0">
                <summary className="flex cursor-pointer list-none items-center gap-4 px-6 py-5 font-display text-base font-semibold transition-colors hover:bg-mist/60">
                  <span className="flex-1">{faq.q}</span>
                  <span className="relative h-4 w-4 shrink-0 text-ember">
                    <span className="absolute top-1/2 left-0 h-[2px] w-4 -translate-y-1/2 bg-current" />
                    <span className="absolute top-1/2 left-0 h-[2px] w-4 -translate-y-1/2 rotate-90 bg-current transition-transform group-open:rotate-0" />
                  </span>
                </summary>
                <p className="px-6 pb-6 text-[0.95rem] leading-relaxed text-ink-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
