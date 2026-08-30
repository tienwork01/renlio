import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { Logo } from "@/components/ui/Logo";
import type { Translator } from "@/i18n";
import { SECTION_IDS, SITE, localePath } from "@/lib/site";

export function SiteFooter({ t, locale }: Pick<Translator, "t" | "locale">) {
  const productLinks = [
    { href: `#${SECTION_IDS.demo}`, label: t("nav.demo") },
    { href: `#${SECTION_IDS.sources}`, label: t("nav.sources") },
    { href: `#${SECTION_IDS.features}`, label: t("nav.features") },
    { href: `#${SECTION_IDS.pricing}`, label: t("nav.pricing") },
    { href: `#${SECTION_IDS.faq}`, label: t("nav.faq") },
  ];

  return (
    // pb lớn hơn trên mobile để thanh CTA cố định không che nội dung footer
    <footer className="mt-16 border-t border-line pt-12 pb-28 text-[0.9375rem] text-muted sm:pb-8">
      <Container>
        <div className="mb-8 grid gap-8 sm:grid-cols-3">
          <div>
            <Logo locale={locale} />
            <p className="mt-3 max-w-md">{t("footer.tagline")}</p>
            {/* Email lấy từ SITE.email chứ không nằm trong file dịch: một nguồn
                sự thật duy nhất, đổi một chỗ là đổi hết mọi nơi. */}
            <address className="mt-3 not-italic">
              {t("footer.contactLabel")}:{" "}
              <a href={`mailto:${SITE.email}`} className="no-underline hover:text-brand-600 hover:underline">
                {SITE.email}
              </a>
            </address>
          </div>

          <nav aria-labelledby="footer-product">
            <h2
              id="footer-product"
              className="mb-3 text-[0.8125rem] font-bold tracking-[0.08em] text-ink uppercase"
            >
              {t("footer.product")}
            </h2>
            <ul className="list-none space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="no-underline hover:text-brand-600 hover:underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-legal">
            <h2
              id="footer-legal"
              className="mb-3 text-[0.8125rem] font-bold tracking-[0.08em] text-ink uppercase"
            >
              {t("footer.legal")}
            </h2>
            <ul className="list-none space-y-2">
              <li>
                <Link
                  href={localePath(locale, "privacy")}
                  className="no-underline hover:text-brand-600 hover:underline"
                >
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href={localePath(locale, "terms")}
                  className="no-underline hover:text-brand-600 hover:underline"
                >
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <a href={`#${SECTION_IDS.security}`} className="no-underline hover:text-brand-600 hover:underline">
                  {t("nav.security")}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <p className="border-t border-line pt-4 text-sm text-faint">{t("footer.copyright")}</p>
      </Container>
    </footer>
  );
}
