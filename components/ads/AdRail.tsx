"use client";

import { usePathname } from "next/navigation";
import { adsterraEnabled, isMemberAdRoute } from "@/lib/ads";
import { AdsterraNative } from "./AdsterraSlot";
import { useAdConsent } from "./AdConsentProvider";

/**
 * The right-rail unit for the member hubs: `/practice`, `/battles` and
 * `/contests` — the lobby screens, never the race.
 *
 * User-friendliness first:
 *
 *  - **Desktop only.** Below 1280px the rail is not rendered at all; the
 *    layouts in the member area need every pixel, and a cramped page is
 *    worse than no ad. From 1280px to 1739px it takes its 300px from the
 *    page; at 1740px and up the shell widens so it uses empty margin.
 *  - **Exactly the three lobbies.** The match is exact, so `/battles/<id>`,
 *    `/battles/invite`, `/practice/session` and `/contests/<id>` never get
 *    an ad — those are timed typing screens.
 *  - **One calm format.** The Adsterra native widget, never a popunder or
 *    an interstitial, in a sticky 300px column that keeps its height while
 *    the ad loads.
 */
export function AdRail() {
  const pathname = usePathname();
  const { consent } = useAdConsent();

  if (!isMemberAdRoute(pathname)) return null;
  if (!adsterraEnabled("native")) return null;
  // A visitor who said no gets no column, not an empty bordered gutter.
  if (consent === "denied") return null;

  return (
    <div className="hidden w-[300px] shrink-0 border-l border-line px-4 py-5 min-[1280px]:block">
      <div className="sticky top-20">
        <AdsterraNative />
      </div>
    </div>
  );
}
