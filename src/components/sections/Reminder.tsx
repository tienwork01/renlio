import { Section, SectionHead } from "@/components/ui/Section";
import { SubscribeForm } from "@/components/sections/SubscribeForm";
import type { Messages, Translator } from "@/i18n";
import { SECTION_IDS } from "@/lib/site";

/**
 * Ô thu email đặt ngay sau kết quả demo và được đóng khung như chính tính năng
 * nhắc lịch — người dùng đăng ký nhận nhắc, và họ sẽ nhận được nhắc thật.
 */
export function Reminder({
  t,
  locale,
  messages,
}: Pick<Translator, "t" | "locale"> & { messages: Messages }) {
  return (
    <Section id={SECTION_IDS.reminder} labelledBy="reminder-title">
      <SectionHead
        align="center"
        eyebrow={t("reminder.eyebrow")}
        title={t("reminder.title")}
        titleId="reminder-title"
        lead={t("reminder.lead")}
      />
      <SubscribeForm id="reminder" locale={locale} messages={messages} askBank />
    </Section>
  );
}
