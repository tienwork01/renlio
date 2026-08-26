import type { ReactNode } from "react";

interface SectionProps {
  id?: string;
  /** id của heading, dùng cho aria-labelledby — mỗi section có nhãn riêng. */
  labelledBy?: string;
  invert?: boolean;
  className?: string;
  children: ReactNode;
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className ?? ""}`}>{children}</div>
  );
}

export function Section({ id, labelledBy, invert, className, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={[
        "py-16 md:py-24",
        invert ? "section-invert bg-bg text-ink" : "",
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
  center?: boolean;
}

export function SectionHead({ eyebrow, title, titleId, lead, center }: SectionHeadProps) {
  return (
    <div className={`mb-8 max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow ? (
        <p className="mb-3 font-heading text-[0.8125rem] font-semibold tracking-[0.08em] text-brand-600 uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 id={titleId} className="mb-4 text-[clamp(1.6rem,1.25rem+1.7vw,2.4rem)] text-ink">
        {title}
      </h2>
      {lead ? <p className="text-lg text-muted">{lead}</p> : null}
    </div>
  );
}
