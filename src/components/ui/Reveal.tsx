"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Hiện dần khi cuộn tới. Tôn trọng prefers-reduced-motion: khi người dùng tắt
 * chuyển động, nội dung hiện ngay từ đầu (class .reveal đã xử lý trong CSS).
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={["reveal", shown ? "reveal-in" : "", className ?? ""].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
