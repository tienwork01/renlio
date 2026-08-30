import { Section, SectionHead } from "@/components/ui/Section";
import type { Translator } from "@/i18n";

interface Stat {
  value: string;
  label: string;
}

/**
 * Ba con số, không đóng khung trong card.
 *
 * Card làm con số trông như một mục trong danh sách. Bỏ khung đi, để cỡ chữ
 * và khoảng trắng làm việc, rồi chỉ dùng một đường kẻ mảnh phân tách — con số
 * trở thành khoảnh khắc, không phải một ô nữa.
 */
export function Problem({ t, tList }: Pick<Translator, "t" | "tList">) {
  const stats = tList<Stat>("problem.stats");

  return (
    <Section id="problem" labelledBy="problem-title">
      <SectionHead
        eyebrow={t("problem.eyebrow")}
        title={t("problem.title")}
        titleId="problem-title"
        lead={t("problem.lead")}
      />

      <dl className="rise-stagger grid gap-10 md:grid-cols-3 md:gap-8">
        {stats.map((stat, index) => (
          <div
            key={stat.value}
            className={
              index > 0
                ? "border-line pt-8 md:border-t-0 md:border-l md:pt-0 md:pl-8 max-md:border-t"
                : ""
            }
          >
            <dt className="num display mb-3 font-heading text-[clamp(2.4rem,1.8rem+2.4vw,3.5rem)] font-bold text-ink">
              {stat.value}
            </dt>
            <dd className="m-0 text-[0.9375rem] text-muted">{stat.label}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
