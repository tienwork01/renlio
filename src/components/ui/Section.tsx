import type { ReactNode } from "react";

/**
 * `paper` = nền sáng, `ink` = nền tối.
 *
 * Trang xen kẽ hai tông để tạo nhịp: mở đầu tối (hero), sáng ở phần thuyết
 * phục, tối lại đúng ba khoảnh khắc cần sức nặng — demo, bảo mật, CTA cuối.
 * Không có nhịp này thì mười section liên tiếp trên nền sáng đọc như một
 * danh sách dài, dù nội dung tốt đến đâu.
 */
export type Tone = "paper" | "ink";

interface SectionProps {
  id?: string;
  /** id của heading, dùng cho aria-labelledby — mỗi section có nhãn riêng. */
  labelledBy?: string;
  tone?: Tone;
  /** Quầng sáng toả phía sau, chỉ hợp với tone ink. */
  glow?: boolean;
  className?: string;
  children: ReactNode;
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className ?? ""}`}>{children}</div>
  );
}

export function Section({ id, labelledBy, tone = "paper", glow, className, children }: SectionProps) {
  const isInk = tone === "ink";

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={[
        "relative py-20 md:py-28",
        isInk ? "section-invert bg-bg text-ink" : "",
        isInk && glow ? "glow grain" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Container>{children}</Container>
    </section>
  );
}

interface SectionHeadProps {
  eyebrow?: string;
  title: string;
  titleId: string;
  lead?: string;
  /** Mặc định căn trái (đọc dễ hơn); chỉ căn giữa khi thật sự cần. */
  align?: "left" | "center";
}

export function SectionHead({ eyebrow, title, titleId, lead, align = "left" }: SectionHeadProps) {
  const centered = align === "center";

  return (
    <div className={`rise mb-12 max-w-3xl ${centered ? "mx-auto text-center" : ""}`}>
      {eyebrow ? (
        <p
          className={`label mb-4 flex items-center gap-2.5 text-brand-600 ${centered ? "justify-center" : ""}`}
        >
          <span aria-hidden="true" className="h-px w-6 bg-brand-600" />
          {eyebrow}
        </p>
      ) : null}

      <h2 id={titleId} className="display mb-4 text-[clamp(1.9rem,1.3rem+2.4vw,3rem)] text-ink">
        {title}
      </h2>

      {lead ? <p className="text-lg text-muted md:text-xl">{lead}</p> : null}
    </div>
  );
}
