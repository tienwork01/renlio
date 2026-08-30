import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Section, SectionHead } from "@/components/ui/Section";
import type { Translator } from "@/i18n";
import { SECTION_IDS } from "@/lib/site";

export function Pricing({ t, tList }: Pick<Translator, "t" | "tList">) {
  const perks = tList<string>("pricing.perks");

  return (
    <Section id={SECTION_IDS.pricing} labelledBy="pricing-title">
      <SectionHead align="center" eyebrow={t("pricing.eyebrow")} title={t("pricing.title")} titleId="pricing-title" />

      <div className="mx-auto max-w-md rounded-2xl border-2 border-brand-600 bg-surface p-8 text-center shadow-lift">
        <h3 className="text-xl">{t("pricing.planName")}</h3>
        <strong className="num my-3 block font-heading text-[clamp(2.5rem,2rem+2.5vw,3.5rem)] leading-none tracking-[-0.03em]">
          {t("pricing.amount")}
        </strong>
        <p className="text-sm text-muted">{t("pricing.note")}</p>

        <ul className="my-6 grid list-none gap-2 text-left">
          {perks.map((perk) => (
            <li key={perk} className="flex items-start gap-2 text-[0.9375rem]">
              <Check aria-hidden="true" className="mt-1 size-[1.125rem] shrink-0 text-ok" strokeWidth={2.5} />
              <span>{perk}</span>
            </li>
          ))}
        </ul>

        <ButtonLink href={`#${SECTION_IDS.demo}`} block>
          {t("pricing.cta")}
        </ButtonLink>
      </div>
    </Section>
  );
}
