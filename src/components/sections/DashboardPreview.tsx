import { Section, SectionHead } from "@/components/ui/Section";
import type { Translator } from "@/i18n";
import { SECTION_IDS } from "@/lib/site";

interface UpcomingItem {
  name: string;
  detail: string;
}

/** Chiều cao cột (px) của biểu đồ 6 tháng — chi phí tăng dần theo thời gian. */
const BARS = [70, 100, 114, 148, 162, 170];
const MONTH_LABELS = ["03", "04", "05", "06", "07", "08"];
const CHART_BASELINE = 400;

export function DashboardPreview({ t, tList }: Pick<Translator, "t" | "tList">) {
  const upcoming = tList<UpcomingItem>("dashboard.upcomingItems");

  return (
    <Section id={SECTION_IDS.dashboard} labelledBy="dashboard-title">
      <SectionHead
        eyebrow={t("dashboard.eyebrow")}
        title={t("dashboard.title")}
        titleId="dashboard-title"
        lead={t("dashboard.lead")}
      />

      <figure className="rise m-0">
          <div className="overflow-x-auto rounded-2xl border border-line bg-surface-2 p-3 shadow-lift">
            <svg
              viewBox="0 0 900 470"
              role="img"
              aria-labelledby="dash-title dash-desc"
              className="h-auto w-full min-w-[640px] font-body"
            >
              <title id="dash-title">{t("dashboard.svgTitle")}</title>
              <desc id="dash-desc">{t("dashboard.svgDesc")}</desc>

              <rect width="900" height="470" rx="14" fill="var(--surface)" stroke="var(--line)" />

              {/* 3 thẻ số liệu */}
              <g>
                <rect x="24" y="24" width="272" height="104" rx="12" fill="var(--surface-2)" stroke="var(--line)" />
                <text x="44" y="54" fontSize="12" fontWeight="600" fill="var(--muted)">
                  {t("dashboard.tile1")}
                </text>
                <text x="44" y="94" fontSize="30" fontWeight="700" fill="var(--money)" className="num font-heading">
                  {t("dashboard.tile1Value")}
                </text>
                <text x="44" y="114" fontSize="12" fill="var(--muted)" className="num">
                  {t("dashboard.tile1Sub")}
                </text>

                <rect x="312" y="24" width="272" height="104" rx="12" fill="var(--surface-2)" stroke="var(--line)" />
                <text x="332" y="54" fontSize="12" fontWeight="600" fill="var(--muted)">
                  {t("dashboard.tile2")}
                </text>
                <text x="332" y="94" fontSize="30" fontWeight="700" fill="var(--ink)" className="num font-heading">
                  {t("dashboard.tile2Value")}
                </text>
                <text x="332" y="114" fontSize="12" fill="var(--muted)">
                  {t("dashboard.tile2Sub")}
                </text>

                <rect x="600" y="24" width="276" height="104" rx="12" fill="var(--money-bg)" stroke="var(--money-line)" />
                <text x="620" y="54" fontSize="12" fontWeight="600" fill="var(--money)">
                  {t("dashboard.tile3")}
                </text>
                <text x="620" y="94" fontSize="30" fontWeight="700" fill="var(--money)" className="font-heading">
                  {t("dashboard.tile3Value")}
                </text>
                <text x="620" y="114" fontSize="12" fill="var(--money)" className="num">
                  {t("dashboard.tile3Sub")}
                </text>
              </g>

              {/* Biểu đồ 6 tháng */}
              <g>
                <rect x="24" y="152" width="560" height="294" rx="12" fill="var(--surface-2)" stroke="var(--line)" />
                <text x="44" y="182" fontSize="13" fontWeight="600" fill="var(--ink)">
                  {t("dashboard.chartTitle")}
                </text>
                <line x1="44" y1={CHART_BASELINE} x2="564" y2={CHART_BASELINE} stroke="var(--line-strong)" />

                <g fill="var(--brand-600)">
                  {BARS.map((height, index) => (
                    <rect
                      key={MONTH_LABELS[index]}
                      x={70 + index * 82}
                      y={CHART_BASELINE - height}
                      width="46"
                      height={height}
                      rx="5"
                    />
                  ))}
                </g>

                <g fontSize="12" fill="var(--muted)" textAnchor="middle" className="num">
                  {MONTH_LABELS.map((label, index) => (
                    <text key={label} x={93 + index * 82} y="420">
                      {label}
                    </text>
                  ))}
                </g>

                <text x="44" y="440" fontSize="11" fill="var(--muted)">
                  {t("dashboard.chartNote")}
                </text>
              </g>

              {/* Sắp trừ tiền */}
              <g>
                <rect x="600" y="152" width="276" height="294" rx="12" fill="var(--surface-2)" stroke="var(--line)" />
                <text x="620" y="182" fontSize="13" fontWeight="600" fill="var(--ink)">
                  {t("dashboard.upcoming")}
                </text>

                {upcoming.slice(0, 4).map((item, index) => {
                  const y = 198 + index * 60;
                  return (
                    <g key={item.name}>
                      <rect x="616" y={y} width="244" height="52" rx="8" fill="var(--surface)" stroke="var(--line)" />
                      <text x="632" y={y + 22} fontSize="13" fontWeight="600" fill="var(--ink)">
                        {item.name}
                      </text>
                      <text x="632" y={y + 40} fontSize="12" fill="var(--muted)" className="num">
                        {item.detail}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">{t("dashboard.caption")}</figcaption>
        </figure>
    </Section>
  );
}
