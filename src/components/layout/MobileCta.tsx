"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { SECTION_IDS } from "@/lib/site";

/**
 * Thanh CTA cố định đáy màn hình, chỉ hiện trên mobile sau khi hero cuộn qua.
 * Dùng IntersectionObserver thay vì scroll listener để không chạy handler
 * mỗi frame.
 */
export function MobileCta({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={[
        "fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-line bg-surface/95 p-3 shadow-lift backdrop-blur-md sm:hidden",
        visible ? "block" : "hidden",
      ].join(" ")}
    >
      <ButtonLink href={`#${SECTION_IDS.demo}`} block>
        {label}
      </ButtonLink>
    </div>
  );
}
