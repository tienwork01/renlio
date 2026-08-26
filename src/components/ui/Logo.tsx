import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/lib/site";

/**
 * Dấu hiệu thương hiệu: thẻ ngân hàng cách điệu. Vẽ inline để không tốn thêm
 * request và tự đổi màu theo token.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? "size-7 shrink-0 text-brand-600"}
    >
      <path d="M3 17V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </svg>
  );
}

export function Logo({ locale }: { locale: Locale }) {
  return (
    <Link
      href={localePath(locale)}
      className="inline-flex items-center gap-2 font-heading text-[1.1875rem] font-bold tracking-[-0.02em] text-ink transition-colors duration-200 hover:text-brand-600"
    >
      <LogoMark />
      Renlio
    </Link>
  );
}
