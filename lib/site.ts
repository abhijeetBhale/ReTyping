/**
 * Canonical site identity for SEO (metadataBase, canonicals, sitemap, JSON-LD).
 *
 * TODO(verify): confirm the production URL after first Vercel deploy and set
 * NEXT_PUBLIC_SITE_URL if it differs — every canonical/OG URL derives from this.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://fingerfiasco-next.vercel.app";

export const SITE_NAME = "Finger Fiasco";

export const SITE_KEYWORDS = [
  "typing speed test",
  "wpm test",
  "typing test",
  "touch typing practice",
  "typing accuracy test",
  "free typing test",
] as const;
