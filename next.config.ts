import type { NextConfig } from "next";

/**
 * In rõ chế độ đang chạy ngay trong log build, để không thể deploy nhầm mà
 * không biết trang đang ở dạng nào.
 */
const leadCapture = Boolean(process.env.SUBSCRIBE_WEBHOOK_URL?.trim());
console.log(
  leadCapture
    ? "▲ Renlio: SUBSCRIBE_WEBHOOK_URL đã đặt — bật thu email (section nhắc lịch + form ở CTA cuối trang)."
    : "▲ Renlio: SUBSCRIBE_WEBHOOK_URL chưa đặt — chế độ giới thiệu sản phẩm, không hiện form đăng ký nào.",
);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Landing page tĩnh: không cần image optimization server-side
  images: { unoptimized: true },
};

export default nextConfig;
