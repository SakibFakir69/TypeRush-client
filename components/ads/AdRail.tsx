"use client";

import { usePathname } from "next/navigation";
import { adsEnabled, isMemberAdRoute } from "@/lib/ads";
import { AdSlot } from "./AdSlot";
import { useAdConsent } from "./AdConsentProvider";

/**
 * The right-rail unit for the member hubs: `/practice`, `/battles` and
 * `/contests` — the lobby screens, never the race.
 *
 * User-friendliness first:
 *
 *  - **Wide screens only.** Below 1536px the rail is not rendered at all;
 *    the layouts in the member area need every pixel, and a cramped page is
 *    worse than no ad.
 *  - **Exactly the three lobbies.** The match is exact, so `/battles/<id>`,
 *    `/battles/invite`, `/practice/session` and `/contests/<id>` never get
 *    an ad — those are timed typing screens.
 *  - **One unit, reserved height.** A single 300-wide slot (250px tall) that
 *    keeps its box while the ad loads, so nothing jumps while the visitor
 *    is reading the lobby.
 *  - **Inert until configured.** No slot id means no column, not an empty
 *    gap where a column used to be.
 */
export function AdRail() {
  const pathname = usePathname();
  const { consent } = useAdConsent();

  if (!isMemberAdRoute(pathname)) return null;
  if (!adsEnabled("rail")) return null;
  // A visitor who said no gets no column, not an empty bordered gutter.
  if (consent === "denied") return null;

  return (
    <div className="hidden w-[300px] shrink-0 border-l border-line px-4 py-5 min-[1740px]:block">
      <div className="sticky top-20">
        <AdSlot slot="rail" />
      </div>
    </div>
  );
}
