"use client";

import { useRef, type ChangeEvent, type DragEvent } from "react";
import { ShieldCheck, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Translator } from "@/i18n";

export type DemoTab = "sample" | "own";

interface StatementInputProps extends Pick<Translator, "t"> {
  tab: DemoTab;
  value: string;
  busy: boolean;
  onTabChange: (tab: DemoTab) => void;
  onValueChange: (value: string) => void;
  onFile: (file: File) => void;
  onAnalyze: () => void;
}

export function StatementInput({
  t,
  tab,
  value,
  busy,
  onTabChange,
  onValueChange,
  onFile,
  onAnalyze,
}: StatementInputProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const dropzone = useRef<HTMLDivElement>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onFile(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dropzone.current?.classList.remove("border-brand-600", "bg-brand-50");
    const file = event.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  const tabs: Array<{ id: DemoTab; label: string }> = [
    { id: "sample", label: t("demo.tabSample") },
    { id: "own", label: t("demo.tabOwn") },
  ];

  return (
    <div>
      <div
        role="tablist"
        aria-label={t("a11y.tabs")}
        className="mb-5 inline-flex gap-1 rounded-full border border-line bg-surface-2 p-1"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls="demo-panel"
            onClick={() => onTabChange(item.id)}
            className={[
              "cursor-pointer rounded-full px-4 py-2 font-heading text-[0.9375rem] font-semibold transition-colors duration-200",
              tab === item.id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div id="demo-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        <label htmlFor="statement" className="mb-2 block font-heading text-[0.9375rem] font-semibold">
          {t("demo.inputLabel")}
        </label>
        <textarea
          id="statement"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          spellCheck={false}
          autoComplete="off"
          aria-describedby="statement-hint"
          className="min-h-44 w-full resize-y overflow-x-auto rounded-xl border border-line-strong bg-surface px-4 py-3 font-mono text-sm whitespace-pre text-ink transition-colors duration-200 hover:border-brand-600 focus:border-brand-600 focus:outline-none"
        />
        <p id="statement-hint" className="mt-2 mb-4 text-sm text-muted">
          {t("demo.inputHint")}
        </p>

        {tab === "own" ? (
          <div
            ref={dropzone}
            onClick={() => fileInput.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              dropzone.current?.classList.add("border-brand-600", "bg-brand-50");
            }}
            onDragLeave={() => dropzone.current?.classList.remove("border-brand-600", "bg-brand-50")}
            onDrop={handleDrop}
            className="mb-4 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line-strong bg-surface-2 p-6 text-center text-[0.9375rem] text-muted transition-colors duration-200 hover:border-brand-600 hover:bg-brand-50"
          >
            <Upload aria-hidden="true" className="size-6 text-brand-600" />
            <span>{t("demo.dropzone")}</span>
            {/* FileReader đọc ngay trên máy — không có upload nào xảy ra */}
            <input
              ref={fileInput}
              type="file"
              accept=".csv,.txt,.tsv,text/csv,text/plain"
              onChange={handleFileChange}
              className="sr-only"
            />
          </div>
        ) : null}

        <Button type="button" block onClick={onAnalyze} disabled={busy}>
          {busy ? t("results.analyzing") : t("demo.analyze")}
        </Button>

        <p className="mt-4 flex gap-3 rounded-xl bg-ok-bg p-3 text-sm text-ok">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-[1.125rem] shrink-0" />
          <span>{t("demo.privacy")}</span>
        </p>
      </div>
    </div>
  );
}
