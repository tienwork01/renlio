"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CycleTable } from "@/components/demo/CycleTable";
import { ResultsPanel, type DemoStatus } from "@/components/demo/ResultsPanel";
import { StatementInput, type DemoTab } from "@/components/demo/StatementInput";
import { Section, SectionHead } from "@/components/ui/Section";
import { createTranslator, type Messages } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { analyze, type AnalyzeResult } from "@/lib/detect";
import { SAMPLES } from "@/lib/samples";

interface DemoProps {
  locale: Locale;
  /** JSON thuần nên truyền được từ server component xuống client. */
  messages: Messages;
}

const STEP_DELAY_MS = 220;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Phần lõi của trang: engine phát hiện subscription chạy ngay tại đây, trong
 * trình duyệt. Sao kê người dùng dán vào không đi qua bất kỳ request nào.
 */
export function Demo({ locale, messages }: DemoProps) {
  const { t, tList } = useMemo(() => createTranslator(locale, messages), [locale, messages]);
  const sample = SAMPLES[locale];

  const [tab, setTab] = useState<DemoTab>("sample");
  const [text, setText] = useState(sample.statement);
  const [userEdited, setUserEdited] = useState(false);
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [stepLabel, setStepLabel] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<{ title: string; hint: string } | null>(null);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Đổi ngôn ngữ -> nạp sao kê mẫu tương ứng, trừ khi người dùng đã tự sửa
  useEffect(() => {
    if (tab === "sample" && !userEdited) {
      setText(SAMPLES[locale].statement);
      setResult(null);
      setStatus("idle");
    }
  }, [locale, tab, userEdited]);

  function handleTabChange(next: DemoTab) {
    setTab(next);
    if (next === "sample") {
      setText(SAMPLES[locale].statement);
      setUserEdited(false);
    } else if (!userEdited) {
      setText("");
    }
  }

  function handleValueChange(next: string) {
    setText(next);
    setUserEdited(true);
  }

  const runAnalysis = useCallback(
    (source: string, dayFirst: boolean) => {
      try {
        const analysis = analyze(source, { today: new Date(), localeDayFirst: dayFirst });
        if (analysis.stats.transactions === 0) {
          setError({ title: t("results.errorTitle"), hint: t("results.errorHint") });
          setStatus("error");
          return;
        }
        setResult(analysis);
        setExcluded(new Set());
        setStatus("done");
      } catch (cause) {
        console.error("[Renlio] lỗi phân tích:", cause);
        setError({ title: t("results.errorTitle"), hint: t("results.errorHint") });
        setStatus("error");
      }
    },
    [t],
  );

  function handleAnalyze() {
    const source = text.trim();
    if (!source) {
      setError({ title: t("results.errorEmpty"), hint: "" });
      setStatus("error");
      return;
    }

    const dayFirst = tab === "sample" ? sample.localeDayFirst : locale === "vi";

    clearTimers();
    setStatus("running");
    setProgress(0);

    if (prefersReducedMotion()) {
      runAnalysis(source, dayFirst);
      return;
    }

    // Hiển thị các bước thật của thuật toán thay vì spinner vô nghĩa
    const steps = tList<string>("results.steps");
    steps.forEach((label, index) => {
      const id = window.setTimeout(() => {
        setStepLabel(label);
        setProgress(Math.round(((index + 1) / steps.length) * 100));
      }, index * STEP_DELAY_MS);
      timers.current.push(id);
    });

    const done = window.setTimeout(() => runAnalysis(source, dayFirst), steps.length * STEP_DELAY_MS);
    timers.current.push(done);
  }

  function handleFile(file: File) {
    // FileReader đọc ngay trên máy người dùng, không upload đi đâu
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? "");
      setText(content);
      setUserEdited(true);
    };
    reader.readAsText(file);
  }

  function handleToggle(key: string, included: boolean) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (included) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <Section id="demo" labelledBy="demo-title" tone="ink" glow>
      <SectionHead
        eyebrow={t("demo.eyebrow")}
        title={t("demo.title")}
        titleId="demo-title"
        lead={t("demo.lead")}
      />

      <div className="rounded-2xl border border-line bg-surface p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <StatementInput
            t={t}
            tab={tab}
            value={text}
            busy={status === "running"}
            onTabChange={handleTabChange}
            onValueChange={handleValueChange}
            onFile={handleFile}
            onAnalyze={handleAnalyze}
          />

          <div>
            <h3 className="sr-only">{t("a11y.resultsHeading")}</h3>
            <output htmlFor="statement" aria-live="polite" className="block">
              <ResultsPanel
                t={t}
                locale={locale}
                status={status}
                stepLabel={stepLabel}
                progress={progress}
                result={result}
                error={error}
                excluded={excluded}
                onToggle={handleToggle}
              />
            </output>
          </div>
        </div>

        <CycleTable t={t} tList={tList} />
      </div>
    </Section>
  );
}
