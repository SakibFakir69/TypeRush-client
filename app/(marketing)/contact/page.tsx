import type { Metadata } from "next";
import { InfoPage } from "@/components/seo/InfoPage";
import { absoluteUrl, ogImages } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the TypePotijogita team: feedback, bug reports, partnership and press requests.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact TypePotijogita",
    description: "Feedback, bug reports, partnerships and press requests.",
    url: absoluteUrl("/contact"),
    images: ogImages("Contact TypePotijogita"),
  },
};

export default function ContactPage() {
  return (
    <InfoPage
      title="Contact"
      intro="Feedback, bug reports, partnerships and press — all of it lands in the same inbox."
    >
      <h2>Email</h2>
      <p>
        Write to{" "}
        <a
          className="text-accent underline"
          href="mailto:hello@typerush.app"
        >
          hello@typerush.app
        </a>
        . We read everything, and bug reports with a browser and a screen
        recording usually get fixed first.
      </p>

      <h2>What helps us fix a bug fastest</h2>
      <ul>
        <li>What you did, step by step.</li>
        <li>What you expected to happen, and what happened instead.</li>
        <li>Your browser and device (for example: Chrome on Windows 11).</li>
        <li>
          A screenshot or a short screen recording — for typing bugs, the
          exact passage helps more.
        </li>
      </ul>

      <h2>Other ways in</h2>
      <ul>
        <li>
          <strong>Source code</strong> — the client and the API are open on{" "}
          <a
            className="text-accent underline"
            href="https://github.com/SakibFakir69/TypeRush-client"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          . Issues and pull requests are welcome.
        </li>
        <li>
          <strong>Press and partnerships</strong> — use the same address and
          mention it in the subject line so it reaches the right person.
        </li>
        <li>
          <strong>Privacy questions</strong> — see the{" "}
          <a className="text-accent underline" href="/privacy">
            privacy policy
          </a>{" "}
          for exactly what is stored, then ask if anything is unclear.
        </li>
      </ul>
    </InfoPage>
  );
}
