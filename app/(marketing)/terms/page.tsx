import type { Metadata } from "next";
import { InfoPage } from "@/components/seo/InfoPage";
import { absoluteUrl, ogImages } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The rules for using TypePotijogita: your account, your runs, the leaderboards, contests and acceptable use.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service — TypePotijogita",
    description: "The rules for using TypePotijogita.",
    url: absoluteUrl("/terms"),
    images: ogImages("Terms of Service — TypePotijogita"),
  },
};

export default function TermsPage() {
  return (
    <InfoPage
      title="Terms of Service"
      intro="The rules for using TypePotijogita. Plain language, no surprises."
      updated="Last updated: 12 November 2026"
    >
      <h2>Using the service</h2>
      <p>
        TypePotijogita is free to use. You need an account to save results,
        appear on leaderboards, join contests and unlock badges. One account
        per person, and you are responsible for what happens under it.
      </p>

      <h2>Your runs and your content</h2>
      <p>
        You keep ownership of the text you type, including custom texts you
        paste — those never leave your browser. You give us permission to store
        your run results (speed, accuracy, errors, length, timestamp) and to
        show them on leaderboards and contests under your display name.
      </p>

      <h2>Leaderboards and contests</h2>
      <ul>
        <li>
          <strong>Play fair.</strong> No bots, no scripts, no emulators, no
          multiple accounts to farm a leaderboard.
        </li>
        <li>
          <strong>Accuracy counts.</strong> A run is judged on WPM first and
          accuracy second, and both are recorded with the run.
        </li>
        <li>
          <strong>Runs of different lengths are ranked separately.</strong> A
          15-second score is never compared with a 60-second score.
        </li>
        <li>
          <strong>Disputes go to us.</strong> If a result looks wrong, report
          it and we will look at the stored run.
        </li>
      </ul>

      <h2>Acceptable use</h2>
      <p>
        Do not use the service to break the law, to attack the site or its
        users, to scrape it at a rate that hurts other people, or to upload
        content you have no right to use. We may suspend accounts that do.
      </p>

      <h2>Availability</h2>
      <p>
        We aim to keep the service running, but we do not guarantee uptime.
        The site can be in maintenance mode for a while — your data stays
        where it is and your curve picks up where it left off.
      </p>

      <h2>Ending your account</h2>
      <p>
        You can delete your account whenever you like from the settings
        screen. We can also suspend or delete an account that breaks these
        terms or the law.
      </p>

      <h2>Changes and contact</h2>
      <p>
        If these terms change we will update the date at the top of this page.
        Questions go to{" "}
        <a
          className="text-accent underline"
          href="mailto:hello@typerush.app"
        >
          hello@typerush.app
        </a>
        .
      </p>
    </InfoPage>
  );
}
