import { ArrowRight, Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import type { Translator } from "@/i18n";
import { SECTION_IDS } from "@/lib/site";

interface FigItem {
  initial: string;
  name: string;
  date: string;
  dateLabel: string;
  amount: string;
}

export function Hero({ t, tList }: Pick<Translator, "t" | "tList">) {
  const trust = tList<string>("hero.trust");
  const figItems = tList<FigItem>("hero.figItems");

  return (
    <section id="hero" aria-labelledby="hero-title" className="pt-8 pb-16 md:pb-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <h1
              id="hero-title"
              className="mb-5 text-[clamp(2rem,1.35rem+3.2vw,3.5rem)] text-ink"
            >
              {t("hero.titleBefore")}
              <em className="text-brand-600 not-italic">{t("hero.titleEm")}</em>
              {t("hero.titleAfter")}
            </h1>

            <p className="mb-5 max-w-xl text-[1.1875rem] text-muted">{t("hero.lead")}</p>

            <div className="mb-5 flex flex-wrap gap-3">
              <ButtonLink href={`#${SECTION_IDS.demo}`}>
                {t("hero.cta")}
                <ArrowRight aria-hidden="true" className="size-[1.125rem] shrink-0" />
              </ButtonLink>
              <ButtonLink href={`#${SECTION_IDS.features}`} variant="ghost">
                {t("hero.cta2")}
              </ButtonLink>
            </div>

            <ul className="flex list-none flex-wrap gap-x-4 gap-y-2 text-[0.9375rem] text-muted">
              {trust.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check aria-hidden="true" className="size-4 shrink-0 text-ok" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Minh hoạ: descriptor bẩn -> subscription sạch */}
          <Reveal>
            <figure className="m-0" aria-labelledby="hero-fig-caption">
              <div className="grid gap-3 rounded-2xl border border-line bg-surface p-4 shadow-lift sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div className="min-w-0">
                  <span className="mb-2 block font-heading text-[0.6875rem] font-bold tracking-[0.1em] text-faint uppercase">
                    {t("hero.figRaw")}
                  </span>
                  <pre className="m-0 overflow-x-auto rounded-xl border border-dashed border-line-strong bg-surface-2 p-3 font-mono text-[0.6875rem] leading-relaxed text-faint">
                    {t("hero.rawSample")}
                  </pre>
                </div>

                <div aria-hidden="true" className="flex items-center justify-center text-brand-600 max-sm:rotate-90">
                  <ArrowRight className="size-6" />
                </div>

                <ul className="grid list-none gap-2">
                  {figItems.map((item) => (
                    <li key={item.name}>
                      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
                        <span
                          aria-hidden="true"
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 font-heading text-sm font-bold text-brand-600"
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

                <p className="col-span-full mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-3">
                  <span className="text-sm text-muted">{t("hero.figTotal")}</span>
                  <strong className="num font-heading text-[1.375rem] text-money">
                    {t("hero.figTotalAmount")}
                    <span className="text-[0.6em] font-semibold">{t("hero.perMonth")}</span>
                  </strong>
                </p>
              </div>
              <figcaption id="hero-fig-caption" className="mt-3 text-center text-sm text-muted">
                {t("hero.figCaption")}
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
