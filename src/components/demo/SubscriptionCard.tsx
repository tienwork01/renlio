"use client";

import { Chip } from "@/components/ui/Chip";
import type { Translator } from "@/i18n";
import type { Currency, Subscription } from "@/lib/detect";
import { formatDate, formatMoney, isoDate } from "@/lib/format";

/** Sắp bị trừ trong vòng 3 ngày -> gắn nhãn cảnh báo. */
const SOON_DAYS = 3;

const CONFIDENCE_TONE = {
  high: "ok",
  medium: "warn",
  low: "bad",
} as const;

interface SubscriptionCardProps extends Pick<Translator, "t" | "locale"> {
  subscription: Subscription;
  currency: Currency;
  included: boolean;
  onToggle: (key: string, included: boolean) => void;
}

export function SubscriptionCard({
  t,
  locale,
  subscription,
  currency,
  included,
  onToggle,
}: SubscriptionCardProps) {
  const soon = subscription.daysUntilNext >= 0 && subscription.daysUntilNext <= SOON_DAYS;

  const relative =
    subscription.daysUntilNext <= 0
      ? t("results.today")
      : subscription.daysUntilNext === 1
        ? t("results.tomorrow")
        : t("results.inDays", { days: subscription.daysUntilNext });

  return (
    <div
      className={[
        "grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 rounded-xl border border-line bg-surface p-4 transition-colors duration-200 hover:border-brand-600",
        included ? "" : "opacity-50",
      ].join(" ")}
    >
      <label className="flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={included}
          onChange={(event) => onToggle(subscription.key, event.target.checked)}
          className="size-[1.125rem] cursor-pointer accent-brand-600"
        />
        <span className="sr-only">{t("results.toggleLabel", { name: subscription.name })}</span>
      </label>

      <div className="min-w-0">
        <div className="mb-0.5 flex flex-wrap items-center gap-2 font-heading text-base font-semibold">
          {subscription.name}
          <Chip tone={CONFIDENCE_TONE[subscription.confidenceLevel]} dot>
            {t(`results.confidence.${subscription.confidenceLevel}`)} {subscription.confidence}
          </Chip>
          {soon ? <Chip tone="bad">{t("results.soon")}</Chip> : null}
        </div>

        <p className="text-[0.8125rem] text-muted">
          {t("results.nextCharge")}{" "}
          <time dateTime={isoDate(subscription.nextCharge)}>
            {formatDate(subscription.nextCharge, locale)}
          </time>{" "}
          · {relative} · {t("results.occurrences", { count: subscription.occurrences })}
        </p>

        <span
          title={subscription.merchant}
          className="block truncate font-mono text-xs text-faint"
        >
          {subscription.merchant}
        </span>
      </div>

      <div className="text-right">
        <div
          className={[
            "num font-heading text-[1.0625rem] font-bold whitespace-nowrap",
            included ? "" : "line-through",
          ].join(" ")}
        >
          {formatMoney(subscription.amount, currency)}
        </div>
        <div className="text-[0.8125rem] text-muted">{t(`results.cycle.${subscription.cycle}`)}</div>
      </div>
    </div>
  );
}
