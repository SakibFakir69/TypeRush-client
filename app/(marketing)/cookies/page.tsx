import type { Metadata } from "next";
import { InfoPage } from "@/components/seo/InfoPage";
import { CookieChoicesButton } from "@/components/ads/CookieChoicesButton";
import { absoluteUrl, ogImages } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Which cookies TypePotijogita sets, what each one does, and how long it stays in your browser.",
  alternates: { canonical: "/cookies" },
  openGraph: {
    title: "Cookie Policy — TypePotijogita",
    description: "Which cookies TypePotijogita sets and what they do.",
    url: absoluteUrl("/cookies"),
    images: ogImages("Cookie Policy — TypePotijogita"),
  },
};

export default function CookiesPage() {
  return (
    <InfoPage
      title="Cookie Policy"
      intro="A short list: the cookies we set, what they do, and how long they live."
      updated="Last updated: 15 November 2026"
    >
      <h2>Cookies we set</h2>
      <ul>
        <li>
          <strong>accessToken</strong> and <strong>refreshToken</strong> —
          httpOnly cookies that keep you signed in. The browser cannot read
          them, and they are cleared when you log out or delete your account.
        </li>
        <li>
          <strong>Theme</strong> — remembers whether you use the dark or the
          light theme, so the page does not flash on every visit.
        </li>
        <li>
          <strong>Sound preference</strong> — remembers whether the key sounds
          are on or muted.
        </li>
      </ul>

      <h2>Local storage</h2>
      <p>
        The custom texts you paste for practice are stored in your own
        browser (local storage), never on our servers, and never sent to us.
        Clearing your browser storage removes them.
      </p>

      <h2>Advertising cookies</h2>
      <p>
        We keep the typing test free by showing ads on the home page and in
        the signed-in lobbies (practice, battles and contests). Those ads are
        served by <strong>Adsterra</strong>, which may use cookies to select
        and measure them. The units are a native widget and a standard
        banner — never a pop-up, a pop-under or a full-page interstitial.
      </p>
      <p>
        Ads are on by default and there is no consent wall: the typing test
        works whether or not you look at an ad. If you would rather not see
        them, turn them off below and the choice is remembered in your
        browser. You can change your mind at any time from this page.
      </p>
      <p>
        Ads never appear on a typing screen. The test, the practice arena and
        the battles are always ad-free, because an ad that moves while you are
        typing is an accident waiting to happen. Signed-in pages can show one
        ad in a right-hand column on wide screens — the practice hub, the
        battle lobby and the contest list — and that column is hidden on
        narrow screens and never on a race screen.
      </p>

      <h2>Turning them off</h2>
      <p>
        Your browser can block cookies. Blocking the session cookies means you
        cannot stay signed in, but the public typing test still works. See the{" "}
        <a className="text-accent underline" href="/privacy">
          privacy policy
        </a>{" "}
        for what each one is used for.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <CookieChoicesButton />
        <span className="text-[12px] text-faint">
          Opt out of ads, or change your mind later.
        </span>
      </div>
    </InfoPage>
  );
}
