# Black Hawk Adventures

The Black Hawk Adventures website, booking engine and staff admin panel — a single
Next.js application backed by PostgreSQL.

This replaces the WordPress site. There is no page builder, no plugin stack and no
theme: every page is server-rendered React, and everything a visitor sees (trips,
itineraries, departures, prices, reviews, contact details, homepage copy) is edited
from the admin panel at `/admin`.

## What's in it

**Public site**

| Route | What it does |
| --- | --- |
| `/` | Homepage — signature trips, live departures, reviews |
| `/tours` | All trips, filterable by region, difficulty and price |
| `/tours/[slug]` | Trip page — day-by-day itinerary, inclusions, live seat counts |
| `/book/[departureId]` | Booking form with live pricing and deposit |
| `/book/confirmation/[reference]` | Booking confirmation, gated by email or browser cookie |
| `/bookings` | "Find my booking" lookup |
| `/about`, `/contact` | Company pages, enquiry form, FAQs |
| `/sitemap.xml`, `/robots.txt` | Generated from the database |

**Admin panel** (`/admin`, staff only)

Dashboard with live figures · bookings list and detail (status, payment status,
internal notes, cancellation that releases seats) · trips CRUD · drag-free itinerary
editor · departures with capacity and price overrides · enquiries inbox · review
moderation · site settings · staff accounts.

## Stack

- **Next.js 16** (App Router, React 19, Server Components and Server Actions)
- **TypeScript**, strict
- **Tailwind CSS v4** — design tokens in `src/app/globals.css`
- **PostgreSQL + Prisma 7** with the `pg` driver adapter
- **Custom auth** — bcrypt password hashes, signed JWT in an httpOnly cookie, `jose`
- **Zod** for every form boundary
- **Playwright** for the end-to-end smoke test

No CMS, no jQuery, no plugins.

## Running it locally

Requirements: Node 20.9+ (Node 22 LTS recommended — one Prisma dependency warns
on older versions) and a PostgreSQL 14+ database.

```bash
git clone <this repo>
cd blackhawkadventures
npm install

cp .env.example .env          # then fill in DATABASE_URL and AUTH_SECRET
openssl rand -base64 32       # use this for AUTH_SECRET

npm run db:migrate            # create the schema
npm run db:seed               # 12 trips, departures, reviews, admin user
npm run dev                   # http://localhost:3000
```

The seed prints the admin login it created. By default:

```
admin@blackhawkadventures.com / blackhawk-admin-2026
```

**Change this before the site goes anywhere near the internet** —
`npm run staff:password -- admin@blackhawkadventures.com`.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run vercel-build` | What Vercel runs: migrate, then build |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint |
| `npm run db:migrate` | Create and apply a migration (dev) |
| `npm run db:deploy` | Apply existing migrations (production) |
| `npm run db:seed` | Reset and reseed demo content |
| `npm run db:studio` | Prisma Studio — raw data browser |
| `npm run staff:list` | List staff accounts |
| `npm run staff:add -- "Name" email@example.com ADMIN` | Add a staff account |
| `npm run staff:password -- email@example.com` | Reset a password |
| `npm run smoke` | End-to-end browser test against a running server |

`npm run smoke` drives a real browser through the booking flow, the booking lookup
gate and the admin panel. Run it after every deploy — it catches far more than a
build does.

## How it fits together

```
prisma/schema.prisma      the data model, one file
src/app/(site)/           public pages
src/app/admin/            admin panel ((dashboard) group = authenticated shell)
src/actions/              server actions — the only place that writes
src/lib/                  db, auth, booking engine, validation, formatting
src/components/site/      public UI
src/components/admin/     admin UI
scripts/                  staff management, smoke test
```

### Two things worth knowing

**Seats cannot be oversold.** `createBooking()` in `src/lib/booking.ts` claims seats
with a conditional `UPDATE` inside a transaction — the row is only incremented if it
still has room at write time. Two people checking out on the last seat at the same
moment means one succeeds and one gets a clear error, not two bookings. Cancelling a
booking (from the admin panel or by setting its status) returns the seats and reopens
a departure that had filled up.

**Bookings keep their own history.** Each booking snapshots the trip title, slug,
start date and price it was sold at, so editing or retiring a trip later never
rewrites what somebody actually bought. Deleting a trip that has bookings unpublishes
it instead of destroying the record.

## Performance and scale

The original WordPress site was on shared hosting with no CDN. The things that
actually made it slow are gone rather than optimised:

- No page builder output, no plugin CSS/JS stack. The entire client-side JavaScript
  bundle is small, and most pages ship almost none.
- Fonts are self-hosted at build time by `next/font` — no render-blocking request to
  Google.
- Illustrations are inline SVG, not photographs, so pages are light by default. When
  you add real photography, `next/image` resizes and serves modern formats
  automatically (set `heroImageUrl` on a trip).
- Database queries are indexed on everything the site filters by (`published`,
  `region`, `difficulty`, `startDate`, booking `status`).

Pages are currently rendered per request (`force-dynamic`) so seat counts are never
stale. If you later want the marketing pages cached, change the `dynamic` export in
`src/app/(site)/layout.tsx` to `export const revalidate = 300` and leave the trip and
booking pages dynamic.

If you deploy somewhere serverless, point `DATABASE_URL` at a **pooled** connection
string (Neon's pooled URL, Supabase's pgBouncer port, or RDS Proxy). A normal
Postgres connection limit will not survive serverless scale-out.

## Deploying

Any Node host works. Two sensible options:

`DATABASE_URL` accepts either a normal Postgres connection string
(`postgresql://…`, e.g. Neon, Supabase, RDS, a local server) or a Prisma Postgres /
Accelerate URL (`prisma+postgres://…`, which is what Vercel's Prisma Postgres
integration injects). The client picks the right connection mode from the scheme.

**Vercel + managed Postgres (Neon, Supabase or Prisma Postgres)** — least work, scales on its own.
Push the repo, set the environment variables, point `DATABASE_URL` at the pooled
connection string. Vercel picks up the `vercel-build` script, which applies any
pending database migrations before building — so a deploy never runs against an
out-of-date schema and you never have to run migrations by hand.

**A VPS you control** (including a Hostinger VPS — not shared hosting, which cannot
run Node):

```bash
npm ci && npm run build
npm run db:deploy
pm2 start npm --name blackhawk -- start     # or a systemd unit
```

Put nginx or Caddy in front for TLS, and Cloudflare in front of that for caching and
DDoS protection. Shared hosting is not an option for this app — it needs a Node
process, not PHP.

Environment variables are documented in `.env.example`. `AUTH_SECRET` must be at
least 32 characters; changing it signs every staff member out.

## Replacing the WordPress site

See **[docs/wordpress-cutover.md](docs/wordpress-cutover.md)** for the full sequence
— content migration, URL redirects so you keep your search rankings, DNS, email, and
what to do if you need to roll back.

## Before you launch

The seeded content is realistic but it is **not yours**. Replace it:

- [ ] Change the admin password, and delete the `ops@` demo account
- [ ] Set `AUTH_SECRET` to a fresh random value in production
- [ ] Replace all 12 seeded trips with your real ones (or edit them)
- [ ] Update contact details, address and WhatsApp number in Admin → Settings
- [ ] Replace the About page copy in `src/app/(site)/about/page.tsx` — the history,
      the founding year and the four values are placeholders written to look right
- [ ] Replace the FAQ answers in `src/app/(site)/contact/page.tsx`, especially the
      **cancellation and payment terms**, which must match what you actually offer
- [ ] Add real reviews (Admin → Reviews) and delete the seeded ones
- [ ] Add photography — set `heroImageUrl` and gallery URLs on each trip
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the live domain

## Not built yet

Deliberately out of scope for this version, in rough priority order:

1. **Online payments.** Bookings are created as `PENDING` / `UNPAID` and your team
   sends a payment link by hand. The booking model already carries `paymentStatus`
   and the deposit maths, so adding Razorpay or Stripe is a contained change.
2. **Transactional email.** Nothing is emailed automatically — no booking
   confirmation, no enquiry notification. Admin and guest both rely on your team
   seeing the dashboard. Wire up Resend or AWS SES next.
3. **Image uploads.** Photographs are referenced by URL; there is no upload button.
   Add UploadThing, Cloudinary or S3 presigned uploads.
4. Waitlists, promo codes, multi-currency, and a customer login area.
