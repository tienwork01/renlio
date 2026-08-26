import { Section, SectionHead } from "@/components/ui/Section";
import type { Translator } from "@/i18n";
import { SECTION_IDS } from "@/lib/site";

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * Câu hỏi viết đúng dạng câu hỏi, trả lời đi thẳng vào câu trả lời ngay câu đầu.
 * Cùng nội dung này được nhân đôi vào JSON-LD FAQPage (xem JsonLd.tsx) để cả
 * search engine lẫn engine trả lời bằng AI đọc được.
 */
export function Faq({ t, tList }: Pick<Translator, "t" | "tList">) {
  const items = tList<FaqItem>("faq.items");

  return (
    <Section id={SECTION_IDS.faq} labelledBy="faq-title">
      <SectionHead center eyebrow={t("faq.eyebrow")} title={t("faq.title")} titleId="faq-title" />

      <div className="mx-auto grid max-w-3xl gap-3">
        {items.map((item) => (
          <details
            key={item.q}
            className="group rounded-xl border border-line bg-surface transition-colors duration-200 open:border-brand-600 hover:border-line-strong"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4 font-heading text-[1.0625rem] font-semibold">
              <h3 className="text-[1.0625rem] font-semibold">{item.q}</h3>
              <span
                aria-hidden="true"
                className="ml-auto size-2.5 shrink-0 rotate-45 border-r-2 border-b-2 border-muted transition-transform duration-200 group-open:rotate-[225deg]"
              />
            </summary>
            <p className="px-4 pb-4 text-[0.9375rem] text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
