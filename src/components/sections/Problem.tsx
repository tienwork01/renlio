import { Section, SectionHead } from "@/components/ui/Section";
import type { Translator } from "@/i18n";

interface Stat {
  value: string;
  label: string;
}

export function Problem({ t, tList }: Pick<Translator, "t" | "tList">) {
  const stats = tList<Stat>("problem.stats");

  return (
    <Section id="problem" labelledBy="problem-title">
      <SectionHead
        center
        eyebrow={t("problem.eyebrow")}
        title={t("problem.title")}
        titleId="problem-title"
        lead={t("problem.lead")}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.value} className="rounded-2xl border border-line bg-surface p-6">
            <strong className="num mb-2 block font-heading text-[clamp(2rem,1.6rem+1.8vw,2.75rem)] leading-none tracking-[-0.03em] text-money">
              {stat.value}
            </strong>
            <span className="block text-[0.9375rem] text-muted">{stat.label}</span>
          </article>
        ))}
      </div>
    </Section>
  );
}
