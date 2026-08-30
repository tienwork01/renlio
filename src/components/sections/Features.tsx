import { FeatureIcon } from "@/components/ui/FeatureIcon";
import { Section, SectionHead } from "@/components/ui/Section";
import type { Translator } from "@/i18n";
import { SECTION_IDS } from "@/lib/site";

interface FeatureItem {
  icon: string;
  title: string;
  body: string;
}

/**
 * Danh sách đánh số, không đóng khung.
 *
 * Ngay phía trên đã là bento toàn card rồi; lặp lại card lần nữa làm hai
 * section dính vào nhau thành một khối. Ở đây dùng số thứ tự lớn + đường kẻ
 * mảnh trên đầu để đổi nhịp, và số thứ tự cũng nói đúng bản chất: đây là ba
 * bước nối tiếp nhau chứ không phải ba lựa chọn song song.
 */
export function Features({ t, tList }: Pick<Translator, "t" | "tList">) {
  const items = tList<FeatureItem>("features.items");

  return (
    <Section id={SECTION_IDS.features} labelledBy="features-title">
      <SectionHead eyebrow={t("features.eyebrow")} title={t("features.title")} titleId="features-title" />

      <ol className="rise-stagger grid list-none gap-10 md:grid-cols-3 md:gap-8">
        {items.map((item, index) => (
          <li key={item.title} className="border-t-2 border-ink pt-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <span aria-hidden="true" className="num display font-heading text-2xl font-bold text-brand-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <FeatureIcon name={item.icon} className="size-5 shrink-0 text-faint" />
            </div>

            <h3 className="mb-3 text-[1.1875rem]">{item.title}</h3>
            <p className="text-[0.9375rem] text-muted">{item.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
