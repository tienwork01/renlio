"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { createTranslator, type Messages } from "@/i18n";
import type { Locale } from "@/i18n/config";

const BANKS = [
  { value: "vcb", label: "Vietcombank" },
  { value: "tcb", label: "Techcombank" },
  { value: "mb", label: "MB Bank" },
  { value: "acb", label: "ACB" },
  { value: "bidv", label: "BIDV" },
  { value: "vpb", label: "VPBank" },
  { value: "tpb", label: "TPBank" },
];

type FormState = "idle" | "sending" | "ok" | "error";

interface SubscribeFormProps {
  locale: Locale;
  messages: Messages;
  id: string;
  /** `inline` dùng trên nền brand ở CTA cuối trang. */
  variant?: "card" | "inline";
  /**
   * Hỏi thêm ngân hàng sau khi gửi email thành công. Bước 2 mới hỏi để không
   * làm giảm tỉ lệ điền ở bước 1, nhưng dữ liệu này quyết định thứ tự ưu tiên
   * viết parser cho từng ngân hàng.
   */
  askBank?: boolean;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function SubscribeForm({ locale, messages, id, variant = "card", askBank }: SubscribeFormProps) {
  const { t } = useMemo(() => createTranslator(locale, messages), [locale, messages]);

  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [savedEmail, setSavedEmail] = useState("");

  async function send(payload: Record<string, string>) {
    const response = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, locale }),
    });
    if (!response.ok) throw new Error(`http-${response.status}`);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setState("error");
      setMessage(t("reminder.invalidEmail"));
      return;
    }

    setState("sending");
    setMessage(t("reminder.sending"));

    try {
      await send({ email });
      setSavedEmail(email);
      setEmail("");
      setState("ok");
      setMessage(askBank ? t("reminder.okStep2") : t("reminder.ok"));
    } catch (cause) {
      // Không giả vờ thành công: nếu chưa cấu hình SUBSCRIBE_WEBHOOK_URL thì
      // API trả 503 và người dùng thấy đúng trạng thái lỗi.
      console.error("[Renlio] gửi email thất bại:", cause);
      setState("error");
      setMessage(t("reminder.error"));
    }
  }

  async function handleBankChange(value: string) {
    if (!value || !savedEmail) return;
    try {
      await send({ email: savedEmail, bank: value });
      setMessage(t("reminder.bankThanks"));
    } catch (cause) {
      console.error("[Renlio] gửi thông tin ngân hàng thất bại:", cause);
    }
  }

  const inline = variant === "inline";
  const emailId = `${id}-email`;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={
        inline
          ? "mx-auto mt-5 max-w-lg"
          : "mx-auto max-w-xl rounded-2xl border border-line bg-surface p-6 shadow-sm"
      }
    >
      <label
        htmlFor={emailId}
        className={inline ? "sr-only" : "mb-2 block font-heading text-[0.9375rem] font-semibold"}
      >
        {t("reminder.emailLabel")}
      </label>

      <div className="flex flex-wrap items-start gap-3">
        <input
          id={emailId}
          type="email"
          name="email"
          required
          autoComplete="email"
          value={email}
          placeholder={t("reminder.emailPlaceholder")}
          onChange={(event) => setEmail(event.target.value)}
          className="min-w-0 flex-[1_1_16rem] rounded-xl border border-line-strong bg-surface px-4 py-3 text-base text-ink transition-colors duration-200 hover:border-brand-600 focus:border-brand-600 focus:outline-none"
        />
        <Button type="submit" variant={inline ? "inverse" : "primary"} disabled={state === "sending"}>
          {t("reminder.submit")}
        </Button>
      </div>

      {message ? (
        <p
          role="status"
          aria-live="polite"
          className={[
            "mt-3 rounded-xl px-4 py-3 text-[0.9375rem]",
            state === "error"
              ? inline
                ? "bg-black/25 text-white"
                : "bg-bad-bg text-bad"
              : inline
                ? "bg-white/20 text-white"
                : "bg-ok-bg text-ok",
          ].join(" ")}
        >
          {message}
        </p>
      ) : null}

      {askBank && state === "ok" ? (
        <fieldset className="mt-6 border-0 p-0">
          <legend className="mb-2 font-heading text-[0.9375rem] font-semibold">
            {t("reminder.step2Title")}
          </legend>
          <label htmlFor={`${id}-bank`} className="sr-only">
            {t("reminder.step2Title")}
          </label>
          <select
            id={`${id}-bank`}
            name="bank"
            defaultValue=""
            onChange={(event) => void handleBankChange(event.target.value)}
            className="w-full cursor-pointer rounded-xl border border-line-strong bg-surface px-4 py-3 text-base text-ink transition-colors duration-200 hover:border-brand-600 focus:border-brand-600 focus:outline-none"
          >
            <option value="">{t("reminder.bankPlaceholder")}</option>
            {BANKS.map((bank) => (
              <option key={bank.value} value={bank.value}>
                {bank.label}
              </option>
            ))}
            <option value="other">{t("reminder.bankOther")}</option>
          </select>
        </fieldset>
      ) : null}
    </form>
  );
}
