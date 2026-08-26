"use client";

import { AlertCircle, FileText, Loader2 } from "lucide-react";
import { SubscriptionCard } from "@/components/demo/SubscriptionCard";
import type { Translator } from "@/i18n";
import type { AnalyzeResult } from "@/lib/detect";
import { formatMoney } from "@/lib/format";

export type DemoStatus = "idle" | "running" | "done" | "error";

interface ResultsPanelProps extends Pick<Translator, "t" | "locale"> {
  status: DemoStatus;
  stepLabel: string;
  progress: number;
  result: AnalyzeResult | null;
  error: { title: string; hint: string } | null;
  excluded: Set<string>;
  onToggle: (key: string, included: boolean) => void;
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line-strong p-6 text-center text-muted">
      {children}
    </div>
  );
}

export function ResultsPanel({
  t,
  locale,
  status,
  stepLabel,
  progress,
  result,
  error,
  excluded,
  onToggle,
}: ResultsPanelProps) {
  if (status === "running") {
    return (
      <div>
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-line">
          <span
            className="block h-full rounded-full bg-brand-600 transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <Frame>
          <Loader2 aria-hidden="true" className="size-6 animate-spin text-brand-600" />
          <p>{stepLabel || t("results.analyzing")}</p>
        </Frame>
      </div>
    );
  }

  if (status === "error" && error) {
    return (
      <Frame>
        <AlertCircle aria-hidden="true" className="size-10 text-bad" />
        <p>
          <strong className="text-ink">{error.title}</strong>
        </p>
        {error.hint ? <p className="text-sm">{error.hint}</p> : null}
      </Frame>
    );
  }

  if (status === "idle" || !result) {
    return (
      <Frame>
        <FileText aria-hidden="true" className="size-10 text-line-strong" strokeWidth={1.5} />
        <p>
          {t("demo.emptyBefore")}
          <strong className="text-ink">{t("demo.emptyStrong")}</strong>
          {t("demo.emptyAfter")}
        </p>
      </Frame>
    );
  }

  if (result.subscriptions.length === 0) {
    return (
      <Frame>
        <AlertCircle aria-hidden="true" className="size-10 text-line-strong" />
        <p>
          <strong className="text-ink">{t("results.emptyTitle")}</strong>
        </p>
        <p className="text-sm">{t("results.emptyHint")}</p>
      </Frame>
    );
  }

  const kept = result.subscriptions.filter((sub) => !excluded.has(sub.key));
  const monthly = kept.reduce((sum, sub) => sum + sub.monthlyAmount, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-x-8 gap-y-4 rounded-2xl border border-line bg-surface-2 p-6">
        <div className="min-w-0">
          <span className="mb-1 block text-[0.8125rem] font-semibold tracking-[0.04em] text-muted uppercase">
            {t("results.totalLabel")}
          </span>
          <strong className="num block font-heading text-[clamp(1.75rem,1.4rem+1.6vw,2.5rem)] leading-none tracking-[-0.03em] text-money">
            {formatMoney(monthly, result.currency)}
            <span className="text-[0.45em] font-semibold">{t("results.perMonth")}</span>
          </strong>
          <span className="num mt-1 block text-sm text-muted">
            {t("results.perYear", { amount: formatMoney(monthly * 12, result.currency) })}
          </span>
        </div>

        <div>
          <span className="mb-1 block text-[0.8125rem] font-semibold tracking-[0.04em] text-muted uppercase">
            {t("results.foundLabel")}
          </span>
          <strong className="num block font-heading text-2xl">{kept.length}</strong>
        </div>
      </div>

      {/* Bước xác nhận: người dùng tự bỏ tick, không tin 100% vào máy */}
      <p className="mb-4 rounded-xl bg-surface-2 px-4 py-3 text-sm text-muted">
        {t("results.selectedNote")}
      </p>

      <ul className="grid list-none gap-3">
        {result.subscriptions.map((sub) => (
          <li key={sub.key}>
            <SubscriptionCard
              t={t}
              locale={locale}
              subscription={sub}
              currency={result.currency}
              included={!excluded.has(sub.key)}
              onToggle={onToggle}
            />
          </li>
        ))}
      </ul>

      <p className="mt-4 rounded-xl bg-surface-2 px-4 py-3 text-sm text-muted">
        {t("results.ignoredNote", {
          groups: result.stats.ignored,
          lines: result.stats.skippedLines,
        })}
      </p>
    </div>
  );
}
