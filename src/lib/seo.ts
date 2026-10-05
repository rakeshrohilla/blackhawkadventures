/**
 * Whether search engines may index the site.
 *
 * Blocked unless SITE_INDEXABLE is exactly "true", so a site is never exposed to
 * Google by forgetting a setting — it has to be switched on deliberately. The
 * admin dashboard shows a banner whenever indexing is off, so it cannot be left
 * blocked by accident either.
 */
export function siteIsIndexable(): boolean {
  return process.env.SITE_INDEXABLE === "true";
}
