/**
 * ads.txt
 *
 * The authoritative list of who may serve ads on this domain. Adsterra
 * checks it before serving, so a 404 here is a real problem.
 *
 * It is generated from `NEXT_PUBLIC_ADSTERRA_PUBLISHER` — the id Adsterra
 * shows under Sites → ads.txt. Set it in the environment and redeploy; the
 * file follows.
 */
import { ADSTERRA_PUBLISHER } from "@/lib/ads";

export const dynamic = "force-static";

export function GET() {
  const body = /^\d+$/.test(ADSTERRA_PUBLISHER)
    ? [
        "# ads.txt for typepotijogita.com",
        "# Generated from NEXT_PUBLIC_ADSTERRA_PUBLISHER — do not edit by hand.",
        `adsterra.com, ${ADSTERRA_PUBLISHER}, DIRECT`,
        "",
      ].join("\n")
    : [
        "# ads.txt for typepotijogita.com",
        "# No Adsterra publisher id is configured yet (NEXT_PUBLIC_ADSTERRA_PUBLISHER).",
        "# Copy the line from Adsterra → Sites → ads.txt into that variable,",
        "# redeploy, and this file fills itself in.",
        "",
      ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
