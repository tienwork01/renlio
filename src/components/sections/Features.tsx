import { Card, IconBadge } from "@/components/ui/Card";
import { FeatureIcon } from "@/components/ui/FeatureIcon";
import { Section, SectionHead } from "@/components/ui/Section";
import type { Translator } from "@/i18n";
import { SECTION_IDS } from "@/lib/site";

interface FeatureItem {
  icon: string;
  title: string;
  body: string;
}

export function Features({ t, tList }: Pick<Translator, "t" | "tList">) {
  const items = tList<FeatureItem>("features.items");

  return (
    <Section id={SECTION_IDS.features} labelledBy="features-title">
      <SectionHead
        center
        eyebrow={t("features.eyebrow")}
        title={t("features.title")}
        titleId="features-title"
      />

      <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.title}>
            <Card as="article" interactive className="h-full">
              <IconBadge>
                <FeatureIcon name={item.icon} />
              </IconBadge>
              <h3 className="mb-2 text-[1.1875rem]">{item.title}</h3>
              <p className="text-[0.9375rem] text-muted">{item.body}</p>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
