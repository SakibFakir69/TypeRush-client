import { SITE_NAME, SITE_URL } from "./site";

/**
 * The structured data the site publishes.
 *
 * Every page that renders a FAQ renders the matching `FAQPage` schema from
 * the same list of questions, so the visible copy and the markup can never
 * drift apart (Google ignores a FAQ schema that does not match the page).
 */

/** One question and its answer, as shown on the page. */
export type FaqItem = {
  q: string;
  a: string;
};

/** `FAQPage` schema for a list of questions. */
export function faqSchemaFor(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/** `BreadcrumbList` schema, e.g. Home → Guides → WPM test. */
export function breadcrumbSchema(
  crumbs: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

/** The application itself: a free typing test people can use right away. */
export const appSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  alternateName: "TypeRush typing test",
  url: SITE_URL,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  description:
    "Free online typing speed test with live WPM and accuracy, daily practice, typing contests and global leaderboards.",
  featureList: [
    "Typing speed test in 15, 30 and 60 seconds",
    "Live WPM, accuracy and error tracking",
    "Practice mode with paragraphs, quotes and your own text",
    "1v1 typing battles and typing contests",
    "Global leaderboards and a personal progress curve",
  ],
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

/** The publisher behind the site — used for the logo/author entity. */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/opengraph-image`,
  sameAs: ["https://github.com/SakibFakir69/TypeRush-client"],
};

/** The landing page's own questions (rendered by `FaqSection`). */
export const LANDING_FAQ: FaqItem[] = [
  {
    q: "What is a good WPM typing speed?",
    a: "Average typing speed is 40 WPM. 60+ WPM is considered fast, and professional typists often reach 80-100+ WPM.",
  },
  {
    q: "How does TypePotijogita measure accuracy?",
    a: "TypePotijogita calculates accuracy as the percentage of correctly typed characters against total characters typed, measured in real time.",
  },
  {
    q: "Is TypePotijogita free to use?",
    a: "Yes, TypePotijogita is free for typing tests and practice. Account sign-in is required to save history and join contests.",
  },
  {
    q: "Do I need an account to take the typing test?",
    a: "No. The public typing test runs without an account. Creating a free account is only needed to save your scores, track your progress curve and join leaderboards and contests.",
  },
  {
    q: "How long does a typing test take?",
    a: "You can run a 15, 30, 60 or 120 second test. Each run length keeps its own leaderboard, so a 60 second score is only ever compared with other 60 second runs.",
  },
  {
    q: "Can I practise with my own text?",
    a: "Yes. The practice arena accepts any text you paste — code, notes, a document — plus quotes and paragraph passages in English, Bangla and Hindi.",
  },
];

/** Kept for backwards compatibility with the original single-question set. */
export const faqSchema = faqSchemaFor(LANDING_FAQ);
