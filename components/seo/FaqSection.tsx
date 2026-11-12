import { faqSchemaFor, type FaqItem } from "@/lib/seo/schema";

/**
 * A FAQ block that renders the questions *and* the matching `FAQPage`
 * schema from the same list. Google only honours a FAQ schema whose
 * questions and answers appear on the page, so the two can never drift
 * apart this way.
 */
export function FaqSection({
  items,
  heading = "Frequently asked questions",
  id,
  className = "",
}: {
  items: FaqItem[];
  heading?: string;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`space-y-3 ${className}`}>
      <h2 className="text-xl font-extrabold">{heading}</h2>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          // `<` is escaped so a stray angle bracket can never break the tag.
          __html: JSON.stringify(faqSchemaFor(items)).replace(/</g, "\\u003c"),
        }}
      />

      {items.map((item) => (
        <details key={item.q} className="rounded-xl border border-line bg-card p-4">
          <summary className="cursor-pointer text-sm font-bold">{item.q}</summary>
          <p className="mt-2 text-[13px] leading-6 text-muted">{item.a}</p>
        </details>
      ))}
    </section>
  );
}
