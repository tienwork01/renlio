import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/layout/LegalPage";
import { getTranslator } from "@/i18n";
import { isLocale, type Locale } from "@/i18n/config";
import { localePath } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  const { t, tList } = getTranslator(locale);
  const [intro] = tList<string>("legal.termsBody");

  return {
    title: `${t("legal.termsTitle")} — Renlio`,
    description: intro ?? t("meta.description"),
    alternates: {
      canonical: localePath(locale, "terms"),
      languages: {
        vi: localePath("vi", "terms"),
        en: localePath("en", "terms"),
        "x-default": localePath("en", "terms"),
      },
    },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { t, tList } = getTranslator(locale);

  return (
    <LegalPage
      t={t}
      locale={locale}
      title={t("legal.termsTitle")}
      updated={t("legal.termsUpdated")}
      paragraphs={tList<string>("legal.termsBody")}
    />
  );
}
