/**
 * Cờ bật/tắt tính năng đọc từ biến môi trường.
 *
 * CHỈ dùng trong server component. Biến `SUBSCRIBE_WEBHOOK_URL` không có tiền
 * tố NEXT_PUBLIC_ nên phía client sẽ thấy `undefined` — import file này vào
 * client component sẽ gây lệch giữa HTML server và DOM sau hydrate.
 */

/**
 * Có nơi thật để lưu email hay chưa.
 *
 * - Chưa đặt → trang chạy ở chế độ **giới thiệu sản phẩm**: ẩn hẳn form đăng
 *   ký, CTA cuối trang dẫn xuống phần demo. Không bao giờ hiện một form mà
 *   bấm vào chắc chắn lỗi.
 * - Đã đặt → bật thu email trở lại, không cần sửa dòng code nào.
 *
 * Các trang là SSG nên giá trị này được cố định lúc build: đặt biến xong phải
 * build/deploy lại thì mới có hiệu lực.
 */
export const LEAD_CAPTURE_ENABLED = Boolean(process.env.SUBSCRIBE_WEBHOOK_URL?.trim());
