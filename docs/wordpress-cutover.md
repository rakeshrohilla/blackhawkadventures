# Replacing the WordPress site

The current site runs WordPress on Hostinger shared hosting (`blackhawkadventures.com`,
resolving to Hostinger IPs, no CDN in front). This document is the sequence for
replacing it with this application without losing search rankings, email, or bookings
in flight.

Nothing here has been done for you — this app has no access to your Hostinger account,
your WordPress admin, or your DNS. These are the steps for whoever does.

## 0. Before you touch anything

Take a full backup of the live site and keep it somewhere that is not Hostinger:

- **Files**: download via SFTP or Hostinger's file manager (`public_html`)
- **Database**: export the MySQL database from phpMyAdmin / hPanel
- **A crawl of the live URLs**: run [Screaming Frog](https://www.screamingfrog.co.uk/seo-spider/)
  (free up to 500 URLs) against `blackhawkadventures.com` and export the list. You
  need this for step 3, and you cannot recreate it after the site is gone.
- **Current search performance**: in Google Search Console, export the Performance
  report (last 12 months, pages + queries). This is your baseline for judging whether
  the migration hurt you.

Do not cancel the Hostinger plan until a month after cutover.

## 1. Get the content across

Everything that visitors see lives in the database, so migration is data entry, not
code. For roughly a dozen trips, doing it by hand through `/admin` is faster and
cleaner than writing an importer — you will want to rewrite half the copy anyway.

For each existing trip, from the WordPress page into Admin → Trips → New trip:

| WordPress | Here |
| --- | --- |
| Page title | Title |
| URL slug | **URL slug — keep it identical** (see step 3) |
| Short description | Tagline + card summary |
| Main body | Full description (blank line between paragraphs) |
| Itinerary section | Itinerary editor, one entry per day |
| Inclusions/exclusions lists | Lists panel, one item per line |
| Price | Price per person (whole rupees) |
| Dates | Departures — one per date, with capacity |
| Featured images | Hero image URL (see step 2) |

Leave each trip **unpublished** until the whole thing is in. Then publish all of them
at once and check `/tours` shows what you expect.

Also move across: real reviews (Admin → Reviews), contact details and WhatsApp number
(Admin → Settings), and your actual cancellation and payment terms into the FAQ block
in `src/app/(site)/contact/page.tsx`.

## 2. Images

This app has no media library yet; photographs are referenced by URL. Two options:

- **Quick**: leave the images in WordPress's `wp-content/uploads` and reference those
  URLs. Works, but ties you to the old host — only acceptable as a temporary measure.
- **Right**: upload the photos to Cloudflare R2, Cloudinary or an S3 bucket with a CDN
  in front, and use those URLs. `next.config.ts` already allows remote images from any
  HTTPS host; tighten `remotePatterns` to your bucket's hostname once you know it.

Trips without a photo fall back to generated SVG artwork, which looks deliberate
rather than broken — so you can launch before every photo is sorted.

## 3. URL redirects — the part that protects your rankings

Any old URL that changes **must** 301-redirect to its new home, or you lose the
ranking that URL had built up. Take the crawl export from step 0 and map every URL.

The structure here is:

```
/                      homepage
/tours                 all trips
/tours/<slug>          one trip
/about  /contact       company pages
```

WordPress sites commonly use `/tour/<slug>/`, `/packages/<slug>/`, `/?p=123`, or
`/index.php/<slug>`. Add a redirect for each pattern in `next.config.ts`:

```ts
async redirects() {
  return [
    // WordPress singular -> plural
    { source: "/tour/:slug", destination: "/tours/:slug", permanent: true },
    { source: "/packages/:slug", destination: "/tours/:slug", permanent: true },
    // retired or renamed pages — point at the closest equivalent, not the homepage
    { source: "/spiti-winter-2024", destination: "/tours/spiti-valley-winter-circuit", permanent: true },
    // WordPress plumbing that should not 404 noisily
    { source: "/wp-admin/:path*", destination: "/admin", permanent: false },
  ];
}
```

Rules of thumb:

- `permanent: true` (301) for anything that moved for good.
- Redirect to the **closest equivalent page**, never to the homepage. A redirect to
  the homepage is treated as a soft 404 and the ranking is lost anyway.
- Old blog posts, if you have them, have nowhere to go in this app yet. Either keep
  them (a `/journal` section is a small addition) or accept losing that traffic — do
  not redirect them all to `/tours`.
- Keep `/sitemap.xml` working; it is generated from the database already.

## 4. Email — check this before DNS

If your email (`@blackhawkadventures.com`) is hosted by Hostinger as part of the
hosting plan, **moving DNS can kill your email**. Check in hPanel whether you use
Hostinger's mail service.

If you do, before changing anything: note down the MX, SPF, DKIM and DMARC records
exactly as they are, and carry them over verbatim to the new DNS provider. Mail and
website DNS are independent — you can point the website at a new host while leaving
MX records where they are.

Safer still: move email to Google Workspace or Zoho Mail first, confirm it works for
a week, and only then move the website.

## 5. Deploy and test on a temporary domain

Deploy the app (see the README) and get it running on something like
`new.blackhawkadventures.com` or the platform's default URL. Then, with real eyes:

- `npm run smoke` against it — booking flow, booking lookup, admin login
- Make one real booking end to end and confirm it appears in `/admin/bookings`
- Check every trip page on a phone
- Run [PageSpeed Insights](https://pagespeed.web.dev/) on the homepage and one trip
  page and record the numbers — compare them to the old site
- Make sure the temporary domain is **not indexable** while you test: set
  `NEXT_PUBLIC_SITE_URL` to the temporary domain and it will be excluded by
  `robots.txt` only if you add a disallow — easiest is a password or an IP allowlist
  at the proxy level

## 6. Cut over

1. Lower the DNS TTL on the `blackhawkadventures.com` A/AAAA records to 300 seconds,
   and wait for the old TTL to expire (often 24 hours — do this the day before).
2. Put the WordPress site into maintenance mode, or at least stop taking bookings on
   it, so nothing arrives in two systems at once.
3. Point the A/AAAA (or CNAME) records at the new host. **Leave MX untouched.**
4. Issue the TLS certificate for the apex and `www` — most platforms do this
   automatically once DNS resolves.
5. Watch it resolve, then test: homepage, a trip page, a booking, the admin login.
6. Put Cloudflare in front (free plan is fine) for CDN caching and TLS. This is the
   piece the old setup never had.

## 7. The week after

- Submit the new `sitemap.xml` in Google Search Console and request indexing of the
  homepage and top trip pages.
- Watch the **Coverage / Pages** report for a spike in 404s — each one is a redirect
  you missed. Add it to `next.config.ts` and redeploy.
- Compare Search Console performance against the baseline you exported. A dip for
  one to two weeks is normal; a dip that is still there after a month means redirects
  are wrong.
- Update the website link in your Google Business Profile, Instagram bio, and any
  listing sites.

## Rolling back

Until you cancel the Hostinger plan, rollback is just pointing the DNS records back
at the Hostinger IPs. That is why the TTL goes down to 300 seconds first, and why the
WordPress install stays in place for a month. Bookings taken on the new site live in
PostgreSQL and are unaffected by a DNS rollback — but you would be taking new
bookings on WordPress again, so export anything already in the new system first.
