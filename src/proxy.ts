import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, VI_COUNTRIES, isLocale, type Locale } from "@/i18n/config";

const COOKIE_NAME = "renlio.locale";

/**
 * Chọn ngôn ngữ theo thứ tự ưu tiên:
 *
 *   1. Cookie — CHỈ được ghi khi người dùng tự bấm đổi ngôn ngữ. Suy luận tự
 *      động không bao giờ ghi cookie, xem ghi chú ở `proxy()` bên dưới.
 *   2. IP country — ở Việt Nam rất nhiều người dùng Windows/Chrome tiếng Anh,
 *      nên Accept-Language không phản ánh đúng thị trường. Renlio là sản phẩm
 *      Việt Nam trước (VND, ngân hàng Việt), nên vị trí thắng ngôn ngữ máy.
 *   3. Accept-Language — bắt người Việt ở nước ngoài, và khách quốc tế.
 *   4. Mặc định `en`.
 *
 * Quan trọng cho SEO: chỉ redirect ở đường dẫn gốc "/". Đã vào /vi hoặc /en
 * thì giữ nguyên, kể cả khi IP nói khác — nếu redirect cứng theo IP, Googlebot
 * (crawl từ IP Mỹ) sẽ không bao giờ index được bản tiếng Việt.
 */
function detectLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (isLocale(cookie)) return cookie;

  const country = (
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-country-code") ??
    ""
  ).toUpperCase();
  if (VI_COUNTRIES.has(country)) return "vi";

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  for (const part of acceptLanguage.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase() ?? "";
    if (tag.startsWith("vi")) return "vi";
    if (tag.startsWith("en")) return "en";
  }

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

  // KHÔNG ghi cookie ở đây. Trước đây proxy lưu lại chính phỏng đoán của mình,
  // nên chỉ cần đoán sai một lần là người dùng bị khoá vào ngôn ngữ đó suốt một
  // năm — sửa thuật toán cũng không cứu được những người đã dính cookie cũ.
  // Cookie chỉ được ghi bởi LocaleSwitch, tức khi người dùng thật sự chọn.
  return NextResponse.redirect(url);
}

export const config = {
  // Bỏ qua file tĩnh, API, và các file SEO có đường dẫn cố định
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|.*\\..*).*)"],
};
