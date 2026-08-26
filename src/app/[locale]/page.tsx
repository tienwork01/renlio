import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileCta } from "@/components/layout/MobileCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Demo } from "@/components/sections/Demo";
import { Reminder } from "@/components/sections/Reminder";
import { Sources } from "@/components/sections/Sources";
import { DashboardPreview } from "@/components/sections/DashboardPreview";
import { Features } from "@/components/sections/Features";
import { Security } from "@/components/sections/Security";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { getMessages, getTranslator } from "@/i18n";
import { isLocale } from "@/i18n/config";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { t, tList } = getTranslator(locale);
  const messages = getMessages(locale);

  return (
    <>
      <JsonLd t={t} tList={tList} locale={locale} />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded-xl focus:border-2 focus:border-brand-600 focus:bg-surface focus:px-4 focus:py-3 focus:font-semibold focus:no-underline"
      >
        {t("a11y.skip")}
      </a>

      <SiteHeader t={t} locale={locale} />

      <main id="main">
        <Hero t={t} tList={tList} />
        <Problem t={t} tList={tList} />
        {/* Demo là client component: engine chạy trong trình duyệt người dùng */}
        <Demo locale={locale} messages={messages} />
        <Reminder t={t} locale={locale} messages={messages} />
        {/* Đặt ngay sau demo: người đọc vừa thấy cách sao kê hoạt động sẽ hỏi
            "còn gói không đi qua thẻ thì sao?" */}
        <Sources t={t} tList={tList} />
        <DashboardPreview t={t} tList={tList} />
        <Features t={t} tList={tList} />
        <Security t={t} tList={tList} />
        <Pricing t={t} tList={tList} />
        <Faq t={t} tList={tList} />
        <FinalCta t={t} locale={locale} messages={messages} />
      </main>

      <SiteFooter t={t} locale={locale} />
      <MobileCta label={t("nav.cta")} />
    </>
  );
}
