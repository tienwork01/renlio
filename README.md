# Renlio — landing page

Landing page cho Renlio: web app phát hiện subscription từ sao kê ngân hàng và email hoá đơn.

Điểm khác biệt của trang này so với một landing page thường: **phần lõi của sản phẩm chạy thật ngay trên trang**. Khối "Thử ngay" là engine phát hiện subscription hoàn chỉnh, chạy 100% trong trình duyệt người dùng — không có backend, không có upload. Nó vừa là demo, vừa là bằng chứng cho lời cam kết bảo mật ở phần dưới trang.

## Kiến trúc nội dung

Trang tách rõ **dữ liệu vào bằng cách nào** khỏi **Renlio làm gì với dữ liệu đó**, vì đó là hai câu hỏi khác nhau của người đọc:

| Section | Trả lời câu hỏi |
| --- | --- |
| Hero → Vấn đề | Tôi có đang mất tiền không? |
| Thử ngay (demo) | Cái này có thật không? |
| Nhắc lịch (thu email) | Tôi muốn được nhắc |
| **Nguồn dữ liệu (4 cách)** | **Trường hợp của tôi có được hỗ trợ không?** |
| Dashboard | Kết quả trông như thế nào? |
| Tính năng (3 việc) | Renlio làm gì với dữ liệu? |
| Bảo mật → Giá → FAQ | Tôi có nên tin không? Mất bao nhiêu? |

Section **Nguồn dữ liệu** đặt ngay sau demo là có chủ đích: người vừa xem demo sao kê sẽ hỏi ngay "gym tôi trả tiền mặt thì sao?". Bốn thẻ là tạo tay · import sao kê · theo dõi Gmail · forward email, mỗi thẻ ghi rõ **phù hợp khi nào** thay vì chỉ liệt kê tính năng — và "tạo tay" được đóng khung là lưới an toàn cho mọi thứ ba nguồn kia không thấy được.

```bash
npm install
npm run dev
```

Mở http://localhost:3000 — middleware sẽ chuyển tới `/vi` hoặc `/en` tuỳ ngôn ngữ trình duyệt và IP.

| Lệnh | Việc |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Build production |
| `npm start` | Chạy bản build |
| `npm test` | Test engine phát hiện subscription (23 test) |
| `npm run typecheck` | `tsc --noEmit` |

## Stack

- **Next.js 16** App Router, React 19, TypeScript strict
- **Tailwind CSS v4** — token định nghĩa bằng CSS custom properties, map vào `@theme inline`
- **lucide-react** — một bộ icon duy nhất, không dùng emoji làm icon
- Không thư viện i18n: dictionary JSON + translator ~90 dòng
- Không thư viện chart: dashboard là inline SVG dùng chính token màu của trang

## Cấu trúc

```
src/
├─ app/
│  ├─ [locale]/
│  │  ├─ layout.tsx            root layout: <html lang>, font, metadata + hreflang
│  │  ├─ page.tsx              lắp các section
│  │  ├─ opengraph-image.tsx   ảnh OG 1200×630 sinh lúc build
│  │  ├─ privacy/page.tsx
│  │  └─ terms/page.tsx
│  ├─ api/subscribe/route.ts   nhận email, chuyển tiếp tới webhook
│  ├─ globals.css              design token + base style
│  ├─ icon.svg  robots.ts  sitemap.ts
│  └─ ...
├─ components/
│  ├─ layout/                  SiteHeader, SiteFooter, LocaleSwitch, MobileCta, LegalPage
│  ├─ sections/                Hero, Problem, Demo, Reminder, Sources, DashboardPreview,
│  │                           Features, Security, Pricing, Faq, FinalCta, SubscribeForm
│  ├─ demo/                    StatementInput, ResultsPanel, SubscriptionCard, CycleTable
│  ├─ ui/                      Button, Card, Chip, Section, Logo, Reveal, FeatureIcon
│  └─ seo/JsonLd.tsx
├─ i18n/
│  ├─ messages/vi.json         bản gốc — thêm key ở đây trước
│  ├─ messages/en.json
│  ├─ translator.ts            t() / tList(), key type-safe suy ra từ vi.json
│  ├─ config.ts                danh sách locale, locale mặc định
│  └─ index.ts                 getMessages(), getTranslator()
├─ lib/
│  ├─ detect.ts                engine phát hiện subscription
│  ├─ samples.ts               2 sao kê mẫu (VN + quốc tế)
│  ├─ format.ts                định dạng tiền và ngày
│  └─ site.ts                  URL site, đường dẫn theo locale, id các section
├─ proxy.ts                    chọn locale theo cookie → Accept-Language → IP
└─ scripts/test-detect.ts
```

Chỉ 5 component là client component: `Demo`, `StatementInput`, `ResultsPanel`, `SubscriptionCard`, `SubscribeForm`, cộng `LocaleSwitch` / `MobileCta` / `Reveal`. Toàn bộ phần còn lại render trên server, nên HTML gửi về đã có sẵn nội dung — điều kiện cần cho SEO.

## i18n

Tất cả chữ nằm trong `src/i18n/messages/{vi,en}.json`, truy cập bằng key dạng dot-path:

```tsx
const { t, tList } = getTranslator(locale);

t("hero.lead");
t("results.inDays", { days: 7 });          // "còn 7 ngày"
tList<FaqItem>("faq.items");               // mảng object
```

- `vi.json` là **bản gốc**. Kiểu `MessageKey` được suy ra từ chính nó, nên `t("hero.titl")` là lỗi biên dịch, và thêm key vào `vi.json` mà quên dịch sang `en.json` sẽ bị TypeScript bắt.
- Biến nội suy viết dạng `{name}` trong JSON.
- Client component **nhận `messages` qua props** thay vì tự import, nhờ đó bundle chỉ chứa locale đang dùng chứ không phải cả hai.

### Chọn ngôn ngữ theo IP

`src/proxy.ts` chọn theo thứ tự:

1. Cookie `renlio.locale` — người dùng đã tự bấm, luôn thắng
2. Header `Accept-Language` — tín hiệu thật về ngôn ngữ người dùng đọc được
3. IP country (`x-vercel-ip-country` / `cf-ipcountry`) — **chỉ là dự phòng**
4. Mặc định `en`

Chỉ đường dẫn gốc `/` bị redirect. Đã vào `/vi` hoặc `/en` thì giữ nguyên kể cả khi IP nói khác — **đây là điểm bắt buộc**: nếu redirect cứng theo IP, Googlebot (crawl từ IP Mỹ) sẽ không bao giờ index được bản tiếng Việt.

Nếu deploy sau một CDN khác, thêm tên header quốc gia của CDN đó vào `detectLocale()`.

## SEO & GEO

Semantic HTML:

- Đúng một `<h1>` mỗi trang, `h2` cho từng section, `h3` bên trong
- `<section aria-labelledby>` trỏ tới id của heading tương ứng
- `<figure>/<figcaption>` cho hero và dashboard, `<dl>/<dt>/<dd>` cho cam kết bảo mật, `<table>` thật cho bảng chu kỳ, `<time datetime>` cho ngày gia hạn, `<address>` cho liên hệ, `<output aria-live>` cho kết quả demo
- `<details>/<summary>` cho FAQ — Google index được nội dung bên trong

Cho engine trả lời bằng AI:

- `JsonLd.tsx` phát `Organization`, `WebSite`, `SoftwareApplication` (kèm `offers` giá 0) và `FAQPage`. Text trong `FAQPage` lấy từ đúng file JSON hiển thị trên trang, nên không bao giờ lệch nhau.
- `robots.ts` cho phép cả crawler tìm kiếm truyền thống và crawler AI (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…). Không cho đọc thì không thể được trích dẫn.
- `public/llms.txt` tóm tắt sản phẩm dưới dạng các câu khẳng định ngắn, tự chứa — kèm cả cách thuật toán hoạt động và các con số cụ thể, vì độ cụ thể là thứ được trích dẫn.
- Câu trả lời FAQ đi thẳng vào nội dung ngay câu đầu, không dạo đầu.

`sitemap.ts` phát 6 URL kèm `alternates.languages` để ghép đúng cặp hreflang.

## Trước khi chạy traffic

1. **`NEXT_PUBLIC_SITE_URL`** — đặt trong `.env` (xem `.env.example`). Canonical, hreflang, sitemap và JSON-LD đều lấy từ biến này.
2. **`SUBSCRIBE_WEBHOOK_URL`** — nơi thật để lưu email (Formspree, Airtable, Cloudflare Worker, n8n…). Chưa đặt thì `/api/subscribe` trả **503** và form hiện đúng trạng thái lỗi. Đây là cố ý: hiển thị "đăng ký thành công" khi chưa lưu được gì là lừa người dùng, và nếu chạy ads thì Google/Meta đánh destination mismatch.
3. **Email đầu tiên gửi cho người đăng ký phải có giá trị thật** (bản tổng hợp chi phí của họ), không phải "cảm ơn đã đăng ký".
4. **Ba con số ở section Vấn đề** hiện là ước lượng nội bộ. Khi đã có traffic thật, thay bằng số do chính demo sinh ra ("người dùng Renlio trung bình tìm ra N gói, X₫/tháng") — đó là social proof thật, tự sinh, không cần bịa testimonial.
5. Kiểm tra JSON-LD bằng [Rich Results Test](https://search.google.com/test/rich-results) sau khi deploy.

## Engine phát hiện subscription

`src/lib/detect.ts`, không phụ thuộc DOM nên chạy được cả trên server và client.

1. **Đọc sao kê** — tự nhận delimiter (`,` `;` tab `|`), tự nhận cột ngày / mô tả / số tiền / số dư từ header lẫn từ dữ liệu. Hiểu ngày `dd/mm/yyyy` và `mm/dd/yyyy` (suy luận từ chính bộ dữ liệu: thấy thành phần đầu > 12 là dd/mm), hiểu số tiền `260.000` và `15.99` (sau dấu phân cách cuối có đúng 3 chữ số → dấu phân cách nghìn).
2. **Phân biệt cột số tiền với cột số dư** bằng quan hệ `số dư[i] − số dư[i−1] ≈ số tiền[i]` khi header không rõ. Đây là chỗ dễ sai nhất với sao kê Việt Nam.
3. **Chuẩn hoá descriptor** — gỡ tiền tố cổng thanh toán (`POS`, `SQ *`, `PAYPAL *`, `NAPAS`…), mã tham chiếu, số điện thoại, hậu tố địa lý; rồi khớp với từ điển ~40 dịch vụ để lấy tên chính thức.
4. **Chấm điểm chu kỳ** — nhóm phải lặp ≥ 2 lần, chu kỳ khớp một trong 7 khoảng (tuần → năm), số tiền chênh ≤ 35%.
5. **Điểm tin cậy 35–99** — dựa trên số lần lặp, độ đều của chu kỳ, độ ổn định số tiền, có nhận diện được thương hiệu hay không. Nhóm chỉ có 2 lần trừ tiền bị hạ mạnh điểm vì một khoảng cách duy nhất không kiểm chứng được tính định kỳ → hiện nhãn "Nên xem lại".

Kết quả luôn đi qua bước người dùng bỏ tick từng dòng — đúng chức năng "màn hình xác nhận" của sản phẩm, không phải chi tiết trang trí.

Sửa thuật toán thì chạy `npm test`: bộ test khoá lại các con số kỳ vọng trên cả hai sao kê mẫu (VN 8 gói / 2.378.917₫, EN 8 gói / $99.04), gồm cả các trường hợp phải **bị loại** (Grab, cà phê, tiền điện, lương).

## Bảng màu — Paper & Ink

Neutral ngả giấy thay cho slate lạnh, nút màu mực thay cho nút màu thương hiệu, và đúng **một** hue thương hiệu + **một** hue cảnh báo. Số tiền dùng màu mực và cỡ lớn: cỡ chữ là thứ nhấn mạnh, không phải màu.

| Token | Light | Dark | Dùng cho |
| --- | --- | --- | --- |
| `--bg` | `#faf8f5` | `#0f0e0c` | Nền trang |
| `--surface` | `#ffffff` | `#171512` | Thẻ, panel |
| `--line` | `#e6e1d8` | `#2c2822` | Đường viền |
| `--ink` | `#15130f` | `#f5f1e9` | Chữ, tiêu đề, số tiền |
| `--muted` | `#665f54` | `#a89f91` | Chữ phụ |
| `--brand-600` | `#0f6b4f` | `#4fc39a` | Link, icon, viền nhấn |
| `--bad` | `#b3401f` | `#ff9068` | "Sắp bị trừ", lỗi |
| `--btn` | `#15130f` | `#f5f1e9` | Nền nút — đảo màu theo mode |

Ba quy tắc khi sửa màu:

1. **Không dùng màu thương hiệu cho nút.** Nút là màu mực ở light mode và màu kem ở dark mode. Xanh rêu chỉ dành cho link, icon và viền nhấn — nhờ đó accent giữ được sức nặng thay vì bị dùng tràn lan.
2. **Số tiền không có màu riêng.** `--money` trỏ về màu mực. Nền cát `--money-bg` chỉ dùng cho thẻ "sắp bị trừ" và chip "nên xem lại".
3. **Section đảo màu tự lo cho mình.** Class `.section-invert` ghi đè toàn bộ token trong phạm vi của nó, nên mọi `bg-surface` / `text-ink` bên trong tự đổi — không cần viết biến thể `dark:` cho từng component.

## Accessibility

Đã đo tương phản thực tế trong trình duyệt ở cả hai mode. Bộ đo vẽ màu lên canvas rồi đọc pixel, nên xử lý đúng cả `lab()` và màu có alpha — đọc thẳng `getComputedStyle().color` bằng regex sẽ ra số sai.

| | Light | Dark |
| --- | --- | --- |
| Nút chính | 17.5:1 | 16.47:1 |
| Chữ body | 17.1:1 | 17.13:1 |
| Chữ phụ (muted) | 5.95:1 | 7.38:1 |
| Chữ nhạt nhất (faint) | 4.82:1 | 5.42:1 |
| Accent xanh rêu | 6.12:1 | 8.82:1 |
| Chip "Chắc chắn" / "Sắp trừ" | 7.44:1 / 7.23:1 | — |

Tất cả đạt WCAG AA (≥ 4.5:1 cho chữ thường).

Ngoài ra: skip link, focus ring 3px trên mọi phần tử tương tác, `prefers-reduced-motion` tắt toàn bộ chuyển động và bỏ luôn animation "các bước phân tích" của demo, trạng thái không chỉ dựa vào màu (chip có cả dấu tròn và chữ), mọi ô nhập đều có `<label>`.
