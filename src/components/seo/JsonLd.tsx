import type { FaqItem } from "@/components/sections/Faq";
import type { Translator } from "@/i18n";
import { LOCALES, type Locale } from "@/i18n/config";
import { SITE, absoluteUrl, localePath } from "@/lib/site";

/**
 * Dữ liệu có cấu trúc cho SEO và GEO (generative engine optimization).
 *
 * - `SoftwareApplication` + `offers` giá 0: mô tả sản phẩm là gì, giá bao nhiêu.
 * - `FAQPage`: nội dung dạng hỏi–đáp là thứ các engine trả lời bằng AI trích
 *   dẫn nhiều nhất; text ở đây khớp đúng với FAQ hiển thị trên trang.
 * - `inLanguage` + hreflang: nói rõ mỗi URL phục vụ ngôn ngữ nào.
 */
export function JsonLd({ t, tList, locale }: Pick<Translator, "t" | "tList" | "locale">) {
  const faqItems = tList<FaqItem>("faq.items");
  // featureList gộp cả nguồn dữ liệu và tính năng: đây là danh sách "Renlio
  // làm được gì" mà search engine và engine AI đọc, nên phải đủ cả bốn cách nhập.
  const features = [
    ...tList<{ title: string }>("sources.items"),
    ...tList<{ title: string }>("features.items"),
  ];

  const graph = [
    {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: SITE.name,
      url: SITE.url,
      email: SITE.email,
      description: t("footer.tagline"),
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url: SITE.url,
      name: SITE.name,
      inLanguage: [...LOCALES],
      publisher: { "@id": absoluteUrl("/#organization") },
    },
    {
      "@type": "SoftwareApplication",
      "@id": absoluteUrl("/#app"),
      name: SITE.name,
      applicationCategory: "FinanceApplication",
      applicationSubCategory: "Subscription tracker",
      operatingSystem: "Web",
      url: absoluteUrl(localePath(locale)),
      inLanguage: locale,
      description: t("meta.description"),
      featureList: features.map((feature) => feature.title),
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: locale === "vi" ? "VND" : "USD",
        availability: "https://schema.org/InStock",
      },
      publisher: { "@id": absoluteUrl("/#organization") },
    },
    {
      "@type": "FAQPage",
      "@id": absoluteUrl(`${localePath(locale)}#faq`),
      inLanguage: locale,
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      // Nội dung do chính chúng ta sinh từ file JSON tin cậy, không phải input người dùng
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}

export function localeAlternates(): Record<Locale | "x-default", string> {
  return {
    vi: absoluteUrl(localePath("vi")),
    en: absoluteUrl(localePath("en")),
    "x-default": absoluteUrl(localePath("en")),
  };
}
