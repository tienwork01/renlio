import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Container } from "@/components/ui/Section";
import type { Translator } from "@/i18n";
import { localePath } from "@/lib/site";

/**
 * Khung dùng chung cho trang Quyền riêng tư và Điều khoản. Trang pháp lý có
 * thật, bấm được — trang thiếu chúng trông không đáng tin và bị đánh giá thấp
 * về E-E-A-T.
 */
export function LegalPage({
  t,
  locale,
  title,
  updated,
  paragraphs,
}: Pick<Translator, "t" | "locale"> & {
  title: string;
  updated: string;
  paragraphs: string[];
}) {
  return (
    <>
      <SiteHeader t={t} locale={locale} />

      <main id="main">
        <article className="py-12 md:py-16">
          <Container>
            <div className="mx-auto max-w-3xl">
              <h1 className="mb-3 text-[clamp(1.75rem,1.4rem+1.8vw,2.5rem)]">{title}</h1>
              <p className="mb-8 text-sm text-faint">{updated}</p>

              <div className="grid gap-4 text-ink-2">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>

              <Link
                href={localePath(locale)}
                className="mt-10 inline-flex items-center gap-2 font-semibold no-underline hover:underline"
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
                {t("legal.backHome")}
              </Link>
            </div>
          </Container>
        </article>
      </main>

      <SiteFooter t={t} locale={locale} />
    </>
  );
}
