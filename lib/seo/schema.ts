export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a good WPM typing speed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Average typing speed is 40 WPM. 60+ WPM is considered fast, and professional typists often reach 80-100+ WPM.",
      },
    },
    {
      "@type": "Question",
      name: "How does TypePotijogita measure accuracy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "TypePotijogita calculates accuracy as the percentage of correctly typed characters against total characters typed, measured in real time.",
      },
    },
    {
      "@type": "Question",
      name: "Is TypePotijogita free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, TypePotijogita is free for typing tests and practice. Account sign-in is required to save history and join contests.",
      },
    },
  ],
};

export const appSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "TypePotijogita",
  url: "https://typerush.app",
  applicationCategory: "UtilitiesApplication",
  description: "Free online typing speed test with practice mode and live typing contests.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};