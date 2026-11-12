import type { Metadata } from "next";
import { InfoPage } from "@/components/seo/InfoPage";
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
      updated="Last updated: 12 November 2026"
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

      <h2>No advertising cookies</h2>
      <p>
        We do not run advertising trackers, and we do not sell or share your
        browsing data. The analytics we keep are first-party, aggregate page
        counts — they never identify you.
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
    </InfoPage>
  );
}
