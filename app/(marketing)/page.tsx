import Home, { metadata } from "@/app/page";

/**
 * The `/` route.
 *
 * The landing page itself lives in `app/page.tsx` (the marketing group only
 * holds the guide pages). This file used to be a second, thin page with its
 * own FAQ block and schema — it never rendered, because `app/page.tsx` wins
 * the `/` route, so the FAQ schema it carried was never published.
 *
 * It now simply re-exports the real landing page and its metadata, so the
 * route can never drift apart from it again.
 */
export { metadata };

export default function LandingPage() {
  return <Home />;
}
