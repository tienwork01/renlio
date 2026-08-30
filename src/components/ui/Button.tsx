import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "inverse";
type Size = "lg" | "md" | "sm";

interface StyleProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  className?: string;
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-heading font-semibold leading-tight text-center " +
  "cursor-pointer transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-55";

const VARIANTS: Record<Variant, string> = {
  // Hover chỉ đổi màu, không scale — tránh layout shift
  primary: "bg-btn text-btn-fg shadow-sm hover:bg-btn-hover",
  ghost: "bg-surface text-ink border border-line-strong hover:bg-surface-2 hover:border-brand-600",
  // Dùng trên slab màu mực ở CTA cuối trang, nên màu cố định chứ không theo
  // token — slab đó luôn tối ở cả light lẫn dark mode.
  inverse: "bg-[#faf8f5] text-[#15130f] shadow-sm hover:bg-white",
};

const SIZES: Record<Size, string> = {
  lg: "px-7 py-4 text-[1.0625rem]",
  md: "px-5.5 py-3.5 text-base",
  sm: "px-3.5 py-2 text-[0.9375rem]",
};

export function buttonClass({ variant = "primary", size = "md", block, className }: StyleProps = {}): string {
  return [BASE, VARIANTS[variant], SIZES[size], block ? "w-full" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant,
  size,
  block,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & StyleProps & { children: ReactNode }) {
  return (
    <button className={buttonClass({ variant, size, block, className })} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  block,
  className,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & StyleProps & { children: ReactNode }) {
  return (
    <a className={buttonClass({ variant, size, block, className })} {...rest}>
      {children}
    </a>
  );
}
