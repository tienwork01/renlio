import { Card, IconBadge } from "@/components/ui/Card";
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
 * Bốn nguồn nhập dữ liệu. Section này trả lời câu hỏi lớn nhất của người đọc
 * sau khi xem demo sao kê: "gói của tôi không đi qua thẻ thì sao?" — nên nó
 * đứng ngay sau phần demo, và mỗi thẻ nói rõ mình phù hợp với trường hợp nào
 * thay vì chỉ liệt kê tính năng.
 */
export function Sources({ t, tList }: Pick<Translator, "t" | "tList">) {
  const items = tList<SourceItem>("sources.items");

  return (
    <Section id={SECTION_IDS.sources} labelledBy="sources-title">
      <SectionHead
        center
        eyebrow={t("sources.eyebrow")}
        title={t("sources.title")}
        titleId="sources-title"
        lead={t("sources.lead")}
      />

      <ol className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.title}>
            <Card as="article" interactive className="flex h-full flex-col">
              <IconBadge>
                <FeatureIcon name={item.icon} />
              </IconBadge>

              <h3 className="mb-2 text-[1.0625rem]">{item.title}</h3>

              <p className="mb-3">
                <Chip>
                  <span className="sr-only">{t("sources.bestForLabel")}: </span>
                  {item.bestFor}
                </Chip>
              </p>

              <p className="text-[0.9375rem] text-muted">{item.body}</p>
            </Card>
          </li>
        ))}
      </ol>
    </Section>
  );
}
