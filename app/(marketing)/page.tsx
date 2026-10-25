import { faqSchema } from "@/lib/seo/schema";


export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* visible FAQ section matching the schema above */}
      <section>
        <h2>Frequently Asked Questions</h2>
        <details>
          <summary>What is a good WPM typing speed?</summary>
          <p>Average typing speed is 40 WPM. 60+ WPM is considered fast, and professional typists often reach 80-100+ WPM.</p>
        </details>
        <details>
          <summary>How does TypeRush measure accuracy?</summary>
          <p>TypeRush calculates accuracy as the percentage of correctly typed characters against total characters typed, measured in real time.</p>
        </details>
        <details>
          <summary>Is TypeRush free to use?</summary>
          <p>Yes, TypeRush is free for typing tests and practice. Account sign-in is required to save history and join contests.</p>
        </details>
      </section>
    </>
  );
}