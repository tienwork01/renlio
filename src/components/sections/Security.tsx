import { Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import type { Translator } from "@/i18n";
import { SECTION_IDS } from "@/lib/site";

interface SecurityItem {
  title: string;
  body: string;
}

/**
 * Dùng <dl> thật: mỗi cam kết là một cặp thuật ngữ/định nghĩa. Cấu trúc này
 * vừa đúng nghĩa ngữ nghĩa, vừa dễ được trích dẫn nguyên khối.
 */
export function Security({ t, tList }: Pick<Translator, "t" | "tList">) {
  const items = tList<SecurityItem>("security.items");

  return (
    <Section id={SECTION_IDS.security} labelledBy="security-title" tone="ink" glow>
      <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="rise lg:sticky lg:top-28">
          <p className="label mb-4 flex items-center gap-2.5 text-brand-600">
            <span aria-hidden="true" className="h-px w-6 bg-brand-600" />
            {t("security.eyebrow")}
          </p>
          <h2 id="security-title" className="display mb-4 text-[clamp(1.9rem,1.3rem+2.4vw,3rem)]">
            {t("security.title")}
          </h2>
          <p className="text-lg text-muted">{t("security.lead")}</p>
        </div>

        <dl className="rise-stagger grid gap-5">
          {items.map((item, index) => (
            <div
              key={item.title}
              className={[
                "grid grid-cols-[auto_1fr] gap-x-3 gap-y-2",
                index < items.length - 1 ? "border-b border-line pb-4" : "",
              ].join(" ")}
            >
              <Check aria-hidden="true" className="mt-1 size-5 text-ok" strokeWidth={2} />
              <dt className="font-heading font-semibold">{item.title}</dt>
              <dd className="col-start-2 m-0 text-[0.9375rem] text-muted">{item.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
