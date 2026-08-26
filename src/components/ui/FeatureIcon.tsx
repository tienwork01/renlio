import {
  BarChart3,
  Bell,
  FileSpreadsheet,
  Forward,
  ListChecks,
  MailCheck,
  PencilLine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Một bộ icon duy nhất (Lucide) cho cả nguồn dữ liệu và tính năng — không dùng
 * emoji làm icon, và mọi icon cùng viewBox 24 nên kích thước luôn đồng nhất.
 * Khoá icon được khai báo trong file JSON message.
 */
const ICONS: Record<string, LucideIcon> = {
  // Nguồn dữ liệu
  pencil: PencilLine,
  statement: FileSpreadsheet,
  gmail: MailCheck,
  forward: Forward,
  // Tính năng
  check: ListChecks,
  chart: BarChart3,
  bell: Bell,
};

export function FeatureIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? ListChecks;
  return <Icon aria-hidden="true" strokeWidth={2} className={className ?? "size-5.5"} />;
}
