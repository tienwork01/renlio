import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Be_Vietnam_Pro, Source_Sans_3 } from "next/font/google";
import { getTranslator } from "@/i18n";
import { LOCALES, OG_LOCALE, isLocale, type Locale } from "@/i18n/config";
import { SITE, absoluteUrl, localePath } from "@/lib/site";
import "../globals.css";

/**
 * Be Vietnam Pro cho tiêu đề: bộ dấu tiếng Việt được thiết kế đúng, không bị
 * lệch như Poppins. Source Sans 3 cho body: dễ đọc, đủ ký tự tiếng Việt.
 */
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600"],
  variable: "--font-source-sans",
  display: "swap",
});

/** Mỗi locale được prerender thành một trang tĩnh riêng. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  const { t } = getTranslator(locale);

  return {
    metadataBase: new URL(SITE.url),
    title: t("meta.title"),
    description: t("meta.description"),
    // Mỗi ngôn ngữ một URL riêng + hreflang: search engine index được cả hai,
    // thay vì bị redirect theo IP và chỉ thấy một bản.
    alternates: {
      canonical: localePath(locale),
      languages: {
        vi: localePath("vi"),
        en: localePath("en"),
        "x-default": localePath("en"),
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((item) => item !== locale).map((item) => OG_LOCALE[item]),
      url: absoluteUrl(localePath(locale)),
      title: t("meta.title"),
      description: t("meta.description"),
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} className={`${beVietnamPro.variable} ${sourceSans.variable}`}>
      <head>
        <meta name="theme-color" content="#faf8f5" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0f0e0c" media="(prefers-color-scheme: dark)" />
      </head>
      <body>{children}</body>
    </html>
  );
}
