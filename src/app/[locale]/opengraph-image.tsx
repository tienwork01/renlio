import { ImageResponse } from "next/og";
import { getTranslator } from "@/i18n";
import { isLocale, type Locale } from "@/i18n/config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Renlio";

/**
 * Ảnh chia sẻ mạng xã hội được sinh lúc build, nên không cần bảo trì file PNG
 * thủ công và luôn khớp nội dung từng ngôn ngữ.
 *
 * Font tải từ Google Fonts để hiển thị đúng dấu tiếng Việt; nếu môi trường
 * build không có mạng thì rơi về font mặc định thay vì làm hỏng cả bản build.
 */
async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@700&display=swap",
      { headers: { "User-Agent": "Mozilla/5.0" } },
    ).then((response) => response.text());

    const url = /src: url\((https:[^)]+)\) format\('(truetype|opentype)'\)/.exec(css)?.[1];
    if (!url) return null;
    return await fetch(url).then((response) => response.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  const { t, tList } = getTranslator(locale);
  const trust = tList<string>("hero.trust");

  const font = await loadFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#15130f",
          color: "#faf8f5",
          padding: "72px",
          fontFamily: font ? "Be Vietnam Pro" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, color: "#5fcfa6" }}>
          <div
            style={{
              width: 44,
              height: 32,
              borderRadius: 8,
              border: "3px solid #5fcfa6",
              display: "flex",
            }}
          />
          Renlio
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 62, lineHeight: 1.15, letterSpacing: "-0.02em", maxWidth: 980 }}>
            {t("meta.title").replace("Renlio — ", "")}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <div style={{ fontSize: 76, color: "#faf8f5", letterSpacing: "-0.03em" }}>
              {t("hero.figTotalAmount")}
            </div>
            <div style={{ fontSize: 34, color: "#a9a091" }}>{t("hero.perMonth")}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 28, fontSize: 26, color: "#a9a091" }}>
          {trust.map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: 999, background: "#5fcfa6", display: "flex" }} />
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Be Vietnam Pro", data: font, style: "normal", weight: 700 }] : undefined,
    },
  );
}
