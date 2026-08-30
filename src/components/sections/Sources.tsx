import { Chip } from "@/components/ui/Chip";
import { FeatureIcon } from "@/components/ui/FeatureIcon";
import { Section, SectionHead } from "@/components/ui/Section";
import type { Translator } from "@/i18n";
import { SECTION_IDS } from "@/lib/site";

interface SourceItem {
  icon: string;
  title: string;
  bestFor: string;
  body: string;
}

/**
 * Bento grid thay cho bốn card bằng nhau.
 *
 * Bốn ô cùng kích cỡ ngầm nói "bốn cách này ngang nhau", trong khi thực tế
 * chúng không ngang nhau. Kích thước ô nói ra thứ tự quan trọng để người đọc
 * không cần đọc hết mới hiểu:
 *
 *   hàng 1  tạo tay (3) + import sao kê (3)   hai cách chính, ngang nhau
 *   hàng 2  theo dõi Gmail (4) + forward (2)  Gmail tiện hơn, forward là lối
 *                                             thoát cho người không muốn cấp quyền
 */
const SPANS = ["lg:col-span-3", "lg:col-span-3", "lg:col-span-4", "lg:col-span-2"];

export function Sources({ t, tList }: Pick<Translator, "t" | "tList">) {
  const items = tList<SourceItem>("sources.items");

  return (
    <Section id={SECTION_IDS.sources} labelledBy="sources-title">
      <SectionHead
        eyebrow={t("sources.eyebrow")}
        title={t("sources.title")}
        titleId="sources-title"
        lead={t("sources.lead")}
      />

      <ol className="rise-stagger grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {items.map((item, index) => (
          <li key={item.title} className={SPANS[index] ?? "lg:col-span-3"}>
            <article className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-6 transition-colors duration-200 hover:border-brand-600 md:p-7">
              <div className="mb-5 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-600 transition-colors duration-200"
                >
                  <FeatureIcon name={item.icon} className="size-5" />
                </span>
                <h3 className="text-[1.125rem]">{item.title}</h3>
              </div>

              <p className="mb-4">
                <Chip>
                  <span className="sr-only">{t("sources.bestForLabel")}: </span>
                  {item.bestFor}
                </Chip>
              </p>

              <p className="text-[0.9375rem] text-muted">{item.body}</p>
            </article>
          </li>
        ))}
      </ol>
    </Section>
  );
}
