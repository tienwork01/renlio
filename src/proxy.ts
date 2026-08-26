import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, VI_COUNTRIES, isLocale, type Locale } from "@/i18n/config";

const COOKIE_NAME = "renlio.locale";

/**
 * Chọn ngôn ngữ theo thứ tự ưu tiên:
 *
 *   1. Cookie — lựa chọn người dùng đã bấm, luôn thắng mọi suy luận tự động.
 *   2. Accept-Language — tín hiệu thật về ngôn ngữ người dùng đọc được.
 *   3. IP country (header của Vercel/Cloudflare) — chỉ là phương án dự phòng,
 *      vì VPN và người Việt ở nước ngoài làm nó sai thường xuyên.
 *   4. Mặc định `en`.
 *
 * Quan trọng cho SEO: chỉ redirect ở đường dẫn gốc "/". Đã vào /vi hoặc /en
 * thì giữ nguyên, kể cả khi IP nói khác — nếu redirect cứng theo IP, Googlebot
 * (crawl từ IP Mỹ) sẽ không bao giờ index được bản tiếng Việt.
 */
function detectLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (isLocale(cookie)) return cookie;

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  for (const part of acceptLanguage.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase() ?? "";
    if (tag.startsWith("vi")) return "vi";
    if (tag.startsWith("en")) return "en";
  }

  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-country-code") ??
    "";
  if (VI_COUNTRIES.has(country.toUpperCase())) return "vi";

  return DEFAULT_LOCALE;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Đã có tiền tố locale -> không đụng vào
  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  // Nhớ suy luận để lần sau không phải đoán lại; người dùng bấm đổi ngôn ngữ
  // sẽ ghi đè cookie này.
  response.cookies.set(COOKIE_NAME, locale, { path: "/", maxAge: 31_536_000, sameSite: "lax" });
  return response;
}

export const config = {
  // Bỏ qua file tĩnh, API, và các file SEO có đường dẫn cố định
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|.*\\..*).*)"],
};
