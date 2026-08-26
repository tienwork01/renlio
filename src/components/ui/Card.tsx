import type { ElementType, ReactNode } from "react";

interface CardProps {
  as?: ElementType;
  /** Đổi viền + shadow khi hover, không dùng transform để tránh nhảy layout. */
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}

export function Card({ as: Tag = "div", interactive, className, children }: CardProps) {
  return (
    <Tag
      className={[
        "rounded-2xl border border-line bg-surface p-6 shadow-sm",
        interactive ? "transition-colors duration-200 hover:border-brand-600 hover:shadow-md" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}

export function IconBadge({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="mb-4 inline-flex size-11 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-brand-600"
    >
      {children}
    </span>
  );
}
