/**
 * Cấu hình Google Analytics.
 *
 * ID đo lường không phải bí mật — nó luôn lộ trong source của trang — nên để
 * sẵn giá trị mặc định cho chạy được ngay, đồng thời vẫn cho ghi đè bằng biến
 * môi trường khi cần tách property giữa các môi trường.
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() || "G-GRM1W0QN3C";

/**
 * Chỉ bắn dữ liệu ở bản production.
 *
 * Nếu không chặn, mỗi lần chạy `npm run dev` là một lượt truy cập giả trong
 * báo cáo — và số liệu của những tuần đầu, lúc traffic thật còn ít, sẽ bị
 * chính bạn làm nhiễu nặng nhất.
 */
export const ANALYTICS_ENABLED =
  process.env.NODE_ENV === "production" && GA_MEASUREMENT_ID.length > 0;
