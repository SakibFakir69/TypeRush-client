/**
 * ads.txt
 *
 * The authoritative list of who may serve ads on this domain. AdSense
 * checks it before showing anything, so a 404 here is a real problem.
 *
 * It is generated from `NEXT_PUBLIC_ADSENSE_CLIENT` — the same variable
 * that loads the ad script — so the publisher id can never drift between
 * the two. Set it in the environment and redeploy; the file follows.
 */
import { ADSENSE_CLIENT, ADSTERRA_PUBLISHER } from "@/lib/ads";

export const dynamic = "force-static";

export function GET() {
  // The AdSense client id looks like `ca-pub-1234567890123456`; the ads.txt
  // line wants `pub-1234567890123456` — so only the `ca-` prefix goes.
  const publisher = ADSENSE_CLIENT.replace(/^ca-/, "").trim();
  const valid = /^pub-\d+$/.test(publisher);

  const body = valid
    ? [
        "# ads.txt for typepotijogita.com",
        "# Generated from NEXT_PUBLIC_ADSENSE_CLIENT — do not edit by hand.",
        `google.com, ${publisher}, DIRECT, f08c47fec0942fa0`,
        "",
      ].join("\n")
    : [
        "# ads.txt for typepotijogita.com",
        "# No valid AdSense publisher id is configured yet (NEXT_PUBLIC_ADSENSE_CLIENT).",
        "# Set it to ca-pub-XXXXXXXXXXXXXXXX in the environment, redeploy, and this",
        "# file fills itself in.",
        "",
      ].join("\n");

  // Adsterra is the second network. Its line is only emitted once the
  // publisher id is configured — copy the line from
  // Adsterra → Sites → ads.txt into NEXT_PUBLIC_ADSTERRA_PUBLISHER.
  // A wrong or missing line does not break the site, but Adsterra will not
  // serve reliably without it.
  const adsterra = /^\d+$/.test(ADSTERRA_PUBLISHER)
    ? `adsterra.com, ${ADSTERRA_PUBLISHER}, DIRECT\n`
    : "";

  return new Response(body + adsterra, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
