import type { Metadata } from "next";
import { InfoPage } from "@/components/seo/InfoPage";
import { absoluteUrl, ogImages } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Advertise on TypePotijogita",
  description:
    "Reach the people who care about typing speed: sponsor a placement, a typing contest or a guide on TypePotijogita.",
  alternates: { canonical: "/advertise" },
  openGraph: {
    title: "Advertise on TypePotijogita",
    description:
      "Sponsor a placement, a typing contest or a guide — and reach typists who are actively trying to get faster.",
    url: absoluteUrl("/advertise"),
    images: ogImages("Advertise on TypePotijogita"),
  },
};

const PLACEMENTS = [
  {
    name: "Recommended product",
    price: "from $150 / month",
    body: "A short, clearly labelled block on the guide pages — the keyboard, keycap set or typing tool you want readers to try. Written by us, never an auto-generated list of affiliate links.",
  },
  {
    name: "Sponsor a typing contest",
    price: "from $300 / month",
    body: "Your name on the contest, your prize in the winner's hands, and a short mention in the announcement. The most memorable placement on the site, and the one our typists talk about.",
  },
  {
    name: "Brand guide",
    price: "from $400, one-off",
    body: "A written guide about your product written for typists, published under your name with a link back. The first-touch asset for a launch — and the piece that keeps earning afterwards.",
  },
  {
    name: "Leaderboard placement",
    price: "from $250 / month",
    body: "A labelled placement next to the global leaderboard, seen by everyone who finishes a run.",
  },
];

export default function AdvertisePage() {
  return (
    <InfoPage
      title="Advertise on TypePotijogita"
      intro="TypePotijogita is read by people who are trying to type faster — the audience a keyboard, a keycap set, an ergonomic split board or a typing trainer is made for."
    >
      <h2>Why this audience</h2>
      <p>
        Every visitor here came for one reason: they want to know how fast
        they type, and then they want to type faster. That is a short,
        unusually focused intent, and it is exactly the intent that a good
        keyboard, a better posture or a typing course sells to. There is no
        other audience on the internet that is this concentrated.
      </p>
      <p>
        Placements are placed by hand, labelled, and never cover the typing
        test. The test is the product; an ad on top of it would cost you
        more than it earns.
      </p>

      <h2>Placements and rates</h2>
      <ul>
        {PLACEMENTS.map((p) => (
          <li key={p.name}>
            <strong>{p.name}</strong> — {p.price}. {p.body}
          </li>
        ))}
      </ul>

      <h2>Affiliate programme</h2>
      <p>
        Prefer commission to a flat fee? We run a straightforward affiliate
        programme with a 30-day cookie window and a payout on every paid
        order. Products that fit: mechanical keyboards, keycap sets, ergonomic
        split keyboards, typing tutors, and books on touch typing. No
        approval wall, no minimum volume — just a link and a honest review
        of what you actually use.
      </p>

      <h2>Audience figures</h2>
      <p>
        We publish our traffic and audience data here once we have a full
        quarter of Search Console and analytics history, so that a sponsor
        can see real numbers rather than a promise. Until then, ask us for
        the current figures and we will send them over.
      </p>

      <h2>Get in touch</h2>
      <p>
        Tell us what you sell and where you would like to appear, and we will
        come back with a rate card, a sample placement and the audience data:{" "}
        <a
          className="text-accent underline"
          href="mailto:hello@typepotijogita.com?subject=Advertising%20on%20TypePotijogita"
        >
          hello@typepotijogita.com
        </a>
        . We answer every mail.
      </p>
    </InfoPage>
  );
}
