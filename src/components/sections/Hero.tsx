import { ArrowRight, Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import type { Translator } from "@/i18n";
import { SECTION_IDS } from "@/lib/site";

interface FigItem {
  initial: string;
  name: string;
  date: string;
  dateLabel: string;
  amount: string;
}

/**
 * Hero nền tối, full-bleed.
 *
 * Mở đầu bằng khối tối tạo tương phản mạnh với phần thân sáng phía dưới, và
 * cho con số tiền — thứ đáng nhớ nhất trên trang — một cái nền để nổi bật.
 * Bố cục lệch 1.1fr/0.9fr thay vì chia đôi: cột chữ dẫn dắt, cột hình đỡ.
 */
export function Hero({ t, tList }: Pick<Translator, "t" | "tList">) {
  const trust = tList<string>("hero.trust");
  const figItems = tList<FigItem>("hero.figItems");

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="section-invert glow grain relative overflow-hidden bg-bg pt-10 pb-24 text-ink md:pt-16 md:pb-32"
    >
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <h1
              id="hero-title"
              className="display mb-6 text-[clamp(2.4rem,1.4rem+4.4vw,4.5rem)] text-ink"
            >
              {t("hero.titleBefore")}
              <em className="text-brand-600 not-italic">{t("hero.titleEm")}</em>
              {t("hero.titleAfter")}
            </h1>

            <p className="mb-8 max-w-xl text-lg text-muted md:text-xl">{t("hero.lead")}</p>

            <div className="mb-8 flex flex-wrap gap-3">
              <ButtonLink href={`#${SECTION_IDS.demo}`} size="lg">
                {t("hero.cta")}
                <ArrowRight aria-hidden="true" className="size-[1.125rem] shrink-0" />
              </ButtonLink>
              <ButtonLink href={`#${SECTION_IDS.sources}`} variant="ghost" size="lg">
                {t("hero.cta2")}
              </ButtonLink>
            </div>

            <ul className="flex list-none flex-wrap gap-x-5 gap-y-2 text-[0.9375rem] text-muted">
              {trust.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check aria-hidden="true" className="size-4 shrink-0 text-brand-600" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Minh hoạ: descriptor bẩn -> subscription sạch */}
          <figure className="rise m-0" aria-labelledby="hero-fig-caption">
            <div className="rounded-3xl border border-line bg-surface/80 p-4 shadow-lift backdrop-blur-sm sm:p-5">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div className="min-w-0">
                  <span className="label mb-2.5 block text-faint">{t("hero.figRaw")}</span>
                  <pre className="m-0 overflow-x-auto rounded-xl border border-dashed border-line-strong bg-surface-2 p-3 font-mono text-[0.6875rem] leading-relaxed text-faint">
                    {t("hero.rawSample")}
                  </pre>
                </div>

                <div
                  aria-hidden="true"
                  className="flex size-8 items-center justify-center justify-self-center rounded-full border border-line bg-surface-2 text-brand-600 max-sm:rotate-90"
                >
                  <ArrowRight className="size-4" />
                </div>

                <ul className="grid list-none gap-2">
                  {figItems.map((item) => (
                    <li key={item.name}>
                      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
                        <span
                          aria-hidden="true"
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 font-heading text-sm font-bold text-brand-600"
                        >
                          {item.initial}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-heading text-[0.9375rem] font-semibold">{item.name}</span>
                          <span className="block text-xs text-muted">
                            {t("hero.figNext")} <time dateTime={item.date}>{item.dateLabel}</time>
                          </span>
                        </span>
                        <span className="num ml-auto text-[0.9375rem] font-bold">{item.amount}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-4 flex items-baseline justify-between gap-3 border-t border-line pt-4">
                <span className="text-sm text-muted">{t("hero.figTotal")}</span>
                <strong className="num display font-heading text-[clamp(1.5rem,1.1rem+1.4vw,2rem)] text-money">
                  {t("hero.figTotalAmount")}
                  <span className="text-[0.5em] font-semibold text-muted">{t("hero.perMonth")}</span>
                </strong>
              </p>
            </div>

            <figcaption className="mt-4 text-center text-sm text-faint">{t("hero.figCaption")}</figcaption>
          </figure>
        </div>
      </Container>
    </section>
  );
}
