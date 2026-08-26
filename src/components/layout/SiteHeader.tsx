import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { Logo } from "@/components/ui/Logo";
import { LocaleSwitch } from "@/components/layout/LocaleSwitch";
import type { Translator } from "@/i18n";
import { SECTION_IDS } from "@/lib/site";

export function SiteHeader({ t, locale }: Pick<Translator, "t" | "locale">) {
  const links = [
    { href: `#${SECTION_IDS.demo}`, label: t("nav.demo") },
    { href: `#${SECTION_IDS.sources}`, label: t("nav.sources") },
    { href: `#${SECTION_IDS.features}`, label: t("nav.features") },
    { href: `#${SECTION_IDS.security}`, label: t("nav.security") },
    { href: `#${SECTION_IDS.pricing}`, label: t("nav.pricing") },
    { href: `#${SECTION_IDS.faq}`, label: t("nav.faq") },
  ];

  return (
    // Floating navbar: cách viền top-4 chứ không dán vào top-0
    <header className="sticky top-4 z-50 my-4">
      <Container>
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface/90 px-4 py-3 shadow-sm backdrop-blur-md backdrop-saturate-150">
          <Logo locale={locale} />

          <nav aria-label={t("a11y.mainNav")} className="ml-auto hidden lg:block">
            <ul className="flex list-none gap-6">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[0.9375rem] font-semibold text-ink-2 no-underline transition-colors duration-200 hover:text-brand-600"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto lg:ml-0">
            <LocaleSwitch locale={locale} label={t("a11y.langGroup")} />
          </div>

          <ButtonLink href={`#${SECTION_IDS.demo}`} size="sm" className="hidden shrink-0 sm:inline-flex">
            {t("nav.cta")}
          </ButtonLink>
        </div>
      </Container>
    </header>
  );
}
