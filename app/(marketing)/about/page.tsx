import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/seo/InfoPage";
import { absoluteUrl, ogImages } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "TypePotijogita is a free typing speed test, practice arena and competition platform: measure your WPM, drill daily, race other typists and track your progress.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About TypePotijogita",
    description:
      "A free typing speed test, practice arena and competition platform.",
    url: absoluteUrl("/about"),
    images: ogImages("About TypePotijogita"),
  },
};

export default function AboutPage() {
  return (
    <InfoPage
      title="About TypePotijogita"
      intro="A free typing speed test, a practice arena that actually shows its work, and a place to race other typists."
    >
      <p>
        TypePotijogita measures how fast and how accurately you type, then
        keeps the record. Every finished run is stored, so your progress is a
        curve you can read instead of a feeling you half-remember.
      </p>

      <h2>What you can do here</h2>
      <ul>
        <li>
          <strong>Take a typing test</strong> in 15, 30, 60 or 120 seconds and
          see your WPM, accuracy and error count live, with no account needed.
        </li>
        <li>
          <strong>Practise deliberately</strong> with timed passages, real
          quotes or your own text — including English, Bangla and Hindi.
        </li>
        <li>
          <strong>Race other typists</strong> in a 1v1 battle or a scheduled
          contest, with Elo ratings that follow you.
        </li>
        <li>
          <strong>Track the long game</strong> with a 7, 30 and 90-day curve,
          personal bests, streaks and badges that unlock by themselves.
        </li>
      </ul>

      <h2>How we score a run</h2>
      <p>
        One word counts as five characters, spaces included. WPM is the number
        of correct characters divided by five, divided by the minutes
        elapsed. Accuracy is the share of characters you typed that matched
        the passage, so a fast run full of mistakes can never outrank a clean
        one on the same board. Runs of different lengths are ranked in
        separate leaderboards and are never compared with each other.
      </p>

      <h2>Who it is for</h2>
      <p>
        Students, writers, developers and anyone who spends the day typing —
        plus people who just want to know whether they are fast. The test is
        free and needs no account; an account only adds saved history,
        leaderboards, contests and badges.
      </p>

      <h2>Questions</h2>
      <p>
        The <Link className="text-accent underline" href="/contact">contact
        page</Link> reaches a human, and the guides on{" "}
        <Link className="text-accent underline" href="/typing-speed-test">
          typing speed
        </Link>
        ,{" "}
        <Link className="text-accent underline" href="/wpm-test">
          WPM
        </Link>{" "}
        and{" "}
        <Link className="text-accent underline" href="/type-practice">
          practice
        </Link>{" "}
        answer the questions people ask most often.
      </p>
    </InfoPage>
  );
}
