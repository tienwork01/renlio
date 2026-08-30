import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/layout/LegalPage";
import { getTranslator } from "@/i18n";
import { isLocale, type Locale } from "@/i18n/config";
import { SITE, localePath } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  const { t, tList } = getTranslator(locale);
  const [intro] = tList<string>("legal.privacyBody");

  return {
    title: `${t("legal.privacyTitle")} — Renlio`,
    description: intro ?? t("meta.description"),
    alternates: {
      canonical: localePath(locale, "privacy"),
      languages: {
        vi: localePath("vi", "privacy"),
        en: localePath("en", "privacy"),
        "x-default": localePath("en", "privacy"),
      },
    },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { t, tList } = getTranslator(locale);

  return (
    <LegalPage
      t={t}
      locale={locale}
      title={t("legal.privacyTitle")}
      updated={t("legal.privacyUpdated")}
      paragraphs={tList<string>("legal.privacyBody").map((text) => text.replaceAll("{email}", SITE.email))}
    />
  );
}
