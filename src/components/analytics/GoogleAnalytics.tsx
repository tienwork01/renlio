import Script from "next/script";
import { ANALYTICS_ENABLED, GA_MEASUREMENT_ID } from "@/lib/analytics";

/**
 * Google Analytics 4 (gtag.js).
 *
 * Dùng `next/script` với `afterInteractive` thay vì nhét thẳng thẻ <script>
 * vào <head>: Next sẽ nạp sau khi trang đã tương tác được, nên script analytics
 * không chặn render và không làm xấu LCP — vốn là một tín hiệu xếp hạng.
 *
 * Không render gì ở môi trường dev để số liệu không bị chính mình làm nhiễu.
 */
export function GoogleAnalytics() {
  if (!ANALYTICS_ENABLED) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
