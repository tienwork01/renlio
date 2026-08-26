import { Section } from "@/components/ui/Section";
import { SubscribeForm } from "@/components/sections/SubscribeForm";
import type { Messages, Translator } from "@/i18n";
import { SECTION_IDS } from "@/lib/site";

export function FinalCta({
  t,
  locale,
  messages,
}: Pick<Translator, "t" | "locale"> & { messages: Messages }) {
  return (
    <Section id={SECTION_IDS.getStarted} labelledBy="cta-title">
      <div className="rounded-2xl bg-[#15130f] px-6 py-12 text-center text-[#faf8f5]">
        <h2 id="cta-title" className="mb-4 text-[clamp(1.6rem,1.25rem+1.7vw,2.4rem)] text-[#faf8f5]">
          {t("finalCta.title")}
        </h2>
        <p className="mx-auto max-w-xl text-[#faf8f5]/75">{t("finalCta.lead")}</p>
        <SubscribeForm id="cta" locale={locale} messages={messages} variant="inline" />
      </div>
    </Section>
  );
}
