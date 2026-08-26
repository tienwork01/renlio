import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SubscribeForm } from "@/components/sections/SubscribeForm";
import type { Messages, Translator } from "@/i18n";
import { LEAD_CAPTURE_ENABLED } from "@/lib/flags";
import { SECTION_IDS } from "@/lib/site";

/**
 * Hai chế độ, tự chọn theo cấu hình:
 *
 * - Chưa có SUBSCRIBE_WEBHOOK_URL → trang giới thiệu sản phẩm thuần: CTA dẫn
 *   xuống phần demo, không hiện form nào.
 * - Đã có → thu email ngay tại đây.
 */
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

        <p className="mx-auto max-w-xl text-[#faf8f5]/75">
          {LEAD_CAPTURE_ENABLED ? t("finalCta.lead") : t("finalCta.leadSimple")}
        </p>

        {LEAD_CAPTURE_ENABLED ? (
          <SubscribeForm id="cta" locale={locale} messages={messages} variant="inline" />
        ) : (
          <div className="mt-6 flex justify-center">
            <ButtonLink href={`#${SECTION_IDS.demo}`} variant="inverse">
              {t("finalCta.cta")}
              <ArrowRight aria-hidden="true" className="size-[1.125rem] shrink-0" />
            </ButtonLink>
          </div>
        )}
      </div>
    </Section>
  );
}
