import type { Metadata } from "next";
import { InfoPage } from "@/components/seo/InfoPage";
import { absoluteUrl, ogImages } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What TypePotijogita stores, why it stores it, how long it keeps it and how to have it deleted.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy — TypePotijogita",
    description:
      "What TypePotijogita stores, why, for how long, and how to delete it.",
    url: absoluteUrl("/privacy"),
    images: ogImages("Privacy Policy — TypePotijogita"),
  },
};

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      intro="What we store, why we store it, and how to get rid of it."
      updated="Last updated: 12 November 2026"
    >
      <h2>The short version</h2>
      <p>
        The typing test works without an account and without storing anything
        about you. If you create an account we keep your email address, your
        typing results and the badges you unlocked, because that is what makes
        your progress curve and your leaderboard row work. We do not sell your
        data and we do not run third-party advertising trackers.
      </p>

      <h2>What we store</h2>
      <ul>
        <li>
          <strong>Account data</strong> — email address, display name, full
          name, country, avatar image and a hashed password (we never store
          the password itself).
        </li>
        <li>
          <strong>Typing results</strong> — for every finished run: words per
          minute, accuracy, error count, elapsed time, run length and the
          timestamp. These power your progress curve, your personal bests and
          the leaderboards.
        </li>
        <li>
          <strong>Account activity</strong> — experience points, rating,
          contests joined, battles played and which badges you unlocked.
        </li>
        <li>
          <strong>Session data</strong> — short-lived authentication cookies
          and tokens, kept so you stay signed in.
        </li>
        <li>
          <strong>Your own texts</strong> — if you paste a custom text to
          practise with, it is kept in your own browser (local storage) and is
          never sent to us.
        </li>
      </ul>

      <h2>Why we store it</h2>
      <ul>
        <li>To show your speed, accuracy, curve and streak after every run.</li>
        <li>To place you on the leaderboards and to settle contests and battles.</li>
        <li>To unlock badges and grant experience as you improve.</li>
        <li>To keep your account secure and to answer support requests.</li>
      </ul>

      <h2>Who else sees it</h2>
      <p>
        Nobody sells your data. A small number of service providers process it
        on our behalf: the email provider that delivers one-time codes and
        password resets, the image host that stores avatars, and the
        infrastructure host that runs the API. Each of them receives only what
        it needs to do its job.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Your typing results stay while your account exists, because the
        leaderboards and the progress curve are built from them. If you
        delete your account, your profile and your authentication data are
        removed straight away and your typing results are removed with them.
      </p>

      <h2>Deleting your account</h2>
      <p>
        You can delete your account from the settings screen at any time. That
        removes your profile and your results; leaderboard rows that carry
        only a display name are removed with them.
      </p>

      <h2>Cookies</h2>
      <p>
        We use a small number of cookies, all of them needed to keep you
        signed in and to remember your theme and sound preferences. They are
        described in the{" "}
        <a className="text-accent underline" href="/cookies">
          cookie policy
        </a>
        .
      </p>

      <h2>Contact</h2>
      <p>
        Questions about any of this go to{" "}
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
