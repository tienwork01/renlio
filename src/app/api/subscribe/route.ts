import { NextResponse } from "next/server";

/**
 * Nhận email đăng ký nhắc lịch và chuyển tiếp tới nơi lưu trữ thật
 * (Formspree, Airtable, n8n, Worker riêng… — bất cứ endpoint nào nhận POST JSON).
 *
 * Nếu SUBSCRIBE_WEBHOOK_URL chưa được cấu hình, route trả 503 để form hiện
 * đúng trạng thái lỗi. Không trả 200 giả: hiển thị "đã đăng ký thành công" khi
 * chưa lưu được gì là lừa người dùng.
 */
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface SubscribePayload {
  email?: unknown;
  bank?: unknown;
  locale?: unknown;
}

export async function POST(request: Request) {
  let payload: SubscribePayload;
  try {
    payload = (await request.json()) as SubscribePayload;
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "invalid-email" }, { status: 400 });
  }

  const bank = typeof payload.bank === "string" ? payload.bank.slice(0, 32) : undefined;
  const locale = payload.locale === "vi" || payload.locale === "en" ? payload.locale : "en";

  const webhook = process.env.SUBSCRIBE_WEBHOOK_URL;
  if (!webhook) {
    console.error(
      "[Renlio] SUBSCRIBE_WEBHOOK_URL chưa được cấu hình — không lưu được email. " +
        "Đặt biến môi trường này trước khi chạy traffic (xem .env.example).",
    );
    return NextResponse.json({ error: "not-configured" }, { status: 503 });
  }

  try {
    const upstream = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        bank,
        locale,
        source: "landing",
        submittedAt: new Date().toISOString(),
      }),
    });

    if (!upstream.ok) {
      console.error(`[Renlio] webhook trả về ${upstream.status}`);
      return NextResponse.json({ error: "upstream-failed" }, { status: 502 });
    }
  } catch (cause) {
    console.error("[Renlio] không gọi được webhook:", cause);
    return NextResponse.json({ error: "upstream-unreachable" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
