import type { ReactNode } from "react";

type Tone = "neutral" | "ok" | "warn" | "bad";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-2 border-line text-ink-2",
  ok: "bg-ok-bg border-transparent text-ok",
  warn: "bg-money-bg border-money-line text-money",
  bad: "bg-bad-bg border-transparent text-bad",
};

interface ChipProps {
  tone?: Tone;
  /** Dấu tròn nhỏ: để trạng thái không chỉ dựa vào màu sắc. */
  dot?: boolean;
  children: ReactNode;
}

export function Chip({ tone = "neutral", dot, children }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[0.8125rem] font-semibold ${TONES[tone]}`}
    >
      {dot ? <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}
