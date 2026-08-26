/**
 * Engine phát hiện subscription.
 *
 * Không phụ thuộc DOM hay Node API — chạy được cả trên server (RSC) và trong
 * trình duyệt. Trên trang chủ, engine này chạy 100% client-side: sao kê của
 * người dùng không bao giờ đi qua network.
 *
 * Quy trình: parseStatement (đọc CSV/text) → detectSubscriptions (gom nhóm,
 * chấm điểm chu kỳ) → analyze (gộp cả hai).
 */

/* ------------------------------------------------------------------ *
 * Kiểu dữ liệu
 * ------------------------------------------------------------------ */
export type CycleId =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "bimonthly"
  | "quarterly"
  | "semiannual"
  | "annual";

export type Currency = "VND" | "USD" | "EUR";

export type ConfidenceLevel = "high" | "medium" | "low";

export type RejectReason =
  | "single"
  | "no-cycle"
  | "amount-varies"
  | "irregular"
  | "weak-evidence";

export interface Transaction {
  date: Date;
  description: string;
  amount: number;
  balance: number | null;
  raw: string;
}

export interface Charge {
  date: Date;
  amount: number;
}

export interface Subscription {
  key: string;
  name: string;
  category: string;
  known: boolean;
  merchant: string;
  amount: number;
  cycle: CycleId;
  monthlyAmount: number;
  yearlyAmount: number;
  occurrences: number;
  firstCharge: Date;
  lastCharge: Date;
  nextCharge: Date;
  daysUntilNext: number;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  history: Charge[];
}

export interface RejectedGroup {
  key: string;
  name: string;
  occurrences: number;
  reason: RejectReason;
}

export interface DetectionStats {
  transactions: number;
  debits: number;
  merchants: number;
  found: number;
  ignored: number;
  totalMonthly: number;
  totalYearly: number;
  skippedLines: number;
}

export interface AnalyzeResult {
  subscriptions: Subscription[];
  rejected: RejectedGroup[];
  stats: DetectionStats;
  currency: Currency;
}

export interface AnalyzeOptions {
  /** Ngày tham chiếu để tính "còn bao nhiêu ngày". Mặc định: hôm nay. */
  today?: Date;
  /** dd/mm (true) hay mm/dd (false) khi dữ liệu không tự tiết lộ. */
  localeDayFirst?: boolean;
}

interface CycleSpec {
  id: CycleId;
  min: number;
  max: number;
  days: number;
  monthlyFactor: number;
}

interface KnownService {
  name: string;
  cat: string;
  match: string[];
}

/* ------------------------------------------------------------------ *
 * Từ điển dịch vụ đã biết → chuẩn hoá tên + phân loại
 * ------------------------------------------------------------------ */
export const KNOWN_SERVICES: KnownService[] = [
  { name: "Netflix", cat: "streaming", match: ["NETFLIX"] },
  { name: "Spotify", cat: "music", match: ["SPOTIFY"] },
  { name: "YouTube Premium", cat: "streaming", match: ["YOUTUBE"] },
  { name: "Disney+", cat: "streaming", match: ["DISNEY"] },
  { name: "Apple iCloud", cat: "cloud", match: ["ICLOUD"] },
  { name: "Apple One", cat: "bundle", match: ["APPLE ONE"] },
  { name: "Apple Music", cat: "music", match: ["APPLE MUSIC"] },
  { name: "Amazon Prime", cat: "streaming", match: ["AMAZON PRIME", "PRIME VIDEO"] },
  { name: "HBO Max", cat: "streaming", match: ["HBO"] },
  { name: "VieON", cat: "streaming", match: ["VIEON", "VIE ON"] },
  { name: "FPT Play", cat: "streaming", match: ["FPT PLAY", "FPTPLAY"] },
  { name: "Galaxy Play", cat: "streaming", match: ["GALAXY PLAY", "GALAXYPLAY"] },
  { name: "Adobe Creative Cloud", cat: "software", match: ["ADOBE"] },
  { name: "Microsoft 365", cat: "software", match: ["MICROSOFT 365", "OFFICE 365", "MSFT 365", "MICROSOFT"] },
  { name: "Notion", cat: "software", match: ["NOTION"] },
  { name: "Figma", cat: "software", match: ["FIGMA"] },
  { name: "Canva", cat: "software", match: ["CANVA"] },
  { name: "ChatGPT Plus", cat: "ai", match: ["OPENAI", "CHATGPT"] },
  { name: "Claude Pro", cat: "ai", match: ["ANTHROPIC", "CLAUDE AI"] },
  { name: "GitHub", cat: "developer", match: ["GITHUB"] },
  { name: "Vercel", cat: "developer", match: ["VERCEL"] },
  { name: "Cloudflare", cat: "developer", match: ["CLOUDFLARE"] },
  { name: "Dropbox", cat: "cloud", match: ["DROPBOX"] },
  { name: "Google One", cat: "cloud", match: ["GOOGLE ONE", "GOOGLE STORAGE"] },
  { name: "Zoom", cat: "software", match: ["ZOOM"] },
  { name: "Slack", cat: "software", match: ["SLACK"] },
  { name: "Duolingo", cat: "education", match: ["DUOLINGO"] },
  { name: "ELSA Speak", cat: "education", match: ["ELSA"] },
  { name: "Coursera", cat: "education", match: ["COURSERA"] },
  { name: "California Fitness", cat: "fitness", match: ["CALIFORNIA FITNESS", "CAL FITNESS"] },
  { name: "Getfit Gym", cat: "fitness", match: ["GETFIT", "GET FIT GYM"] },
  { name: "Viettel", cat: "telecom", match: ["VIETTEL"] },
  { name: "VinaPhone", cat: "telecom", match: ["VINAPHONE", "VNPT"] },
  { name: "MobiFone", cat: "telecom", match: ["MOBIFONE"] },
  { name: "Namecheap", cat: "developer", match: ["NAMECHEAP"] },
  { name: "GoDaddy", cat: "developer", match: ["GODADDY"] },
  { name: "LinkedIn Premium", cat: "software", match: ["LINKEDIN"] },
  { name: "Grammarly", cat: "software", match: ["GRAMMARLY"] },
  { name: "Tinder", cat: "lifestyle", match: ["TINDER"] },
  { name: "Strava", cat: "fitness", match: ["STRAVA"] },
];

/** Tiền tố cổng thanh toán cần gỡ khỏi mô tả giao dịch. */
const GATEWAY_TOKENS = [
  "SQ *", "SQ*", "SQUARE *", "PAYPAL *", "PAYPAL*", "PP *", "STRIPE *",
  "POS ", "ECOM ", "ECOMM ", "VISA ", "MASTERCARD ", "MASTER CARD ", "JCB ",
  "NAPAS ", "IBFT ", "ATM ", "TRF ", "CK ", "GD ", "TT ", "THANH TOAN ",
  "MUA HANG ", "CHUYEN KHOAN ", "PAYMENT ", "PMT ", "RECURRING ",
  "AUTOPAY ", "AUTO DEBIT ", "DEBIT ", "MOMO ", "ZALOPAY ", "VNPAY ",
];

/** Hậu tố địa lý / mã quốc gia thường dính kèm descriptor. */
const GEO_SUFFIX = [
  "LOS GATOS CA", "LOS GATOS", "SAN FRANCISCO CA", "SAN JOSE CA", "CUPERTINO CA",
  "SEATTLE WA", "NEW YORK NY", "AMSTERDAM NL", "AMSTERDAM", "DUBLIN IE", "DUBLIN",
  "SINGAPORE SG", "SINGAPORE", "HONG KONG HK", "HONG KONG", "TOKYO JP",
  "HA NOI", "HANOI", "HCM", "HO CHI MINH", "TP HCM", "DA NANG",
  "US", "USA", "SG", "SGP", "HK", "HKG", "JP", "NL", "IE", "GB", "VN", "VNM",
];

/** Mô tả cho thấy đây là tiền VÀO → không phải subscription. */
const CREDIT_HINTS = [
  "LUONG", "SALARY", "PAYROLL", "HOAN TIEN", "REFUND", "REVERSAL", "CASHBACK",
  "LAI TIEN GUI", "INTEREST", "NHAN TIEN", "CREDIT FROM", "DEPOSIT", "TIEN VE",
  "CHUYEN DEN", "INCOMING",
];

/** Từ khoá làm tăng độ tin cậy khi chưa nhận diện được thương hiệu. */
const SUBSCRIPTION_HINTS = [
  "SUBSCRIPTION", "SUBS", "MEMBERSHIP", "PREMIUM", "PLUS", "PRO PLAN",
  "MONTHLY", "ANNUAL", "RENEWAL", "GIA HAN", "HOI VIEN", "GOI THANG",
  "CLOUD", "HOSTING", "DOMAIN", "LICENSE", "SAAS", "GYM", "FITNESS",
];

export const CYCLES: CycleSpec[] = [
  { id: "weekly", min: 6, max: 8, days: 7, monthlyFactor: 30.44 / 7 },
  { id: "biweekly", min: 12, max: 16, days: 14, monthlyFactor: 30.44 / 14 },
  { id: "monthly", min: 25, max: 35, days: 30.44, monthlyFactor: 1 },
  { id: "bimonthly", min: 55, max: 67, days: 60.88, monthlyFactor: 0.5 },
  { id: "quarterly", min: 84, max: 98, days: 91.31, monthlyFactor: 1 / 3 },
  { id: "semiannual", min: 172, max: 195, days: 182.6, monthlyFactor: 1 / 6 },
  { id: "annual", min: 348, max: 382, days: 365.25, monthlyFactor: 1 / 12 },
];

const MONTHS_PER_CYCLE: Partial<Record<CycleId, number>> = {
  monthly: 1,
  bimonthly: 2,
  quarterly: 3,
  semiannual: 6,
  annual: 12,
};

const DAY_MS = 86_400_000;

/* ------------------------------------------------------------------ *
 * Tiện ích chuỗi
 * ------------------------------------------------------------------ */
function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[Đđ]/g, "D");
}

function upperClean(value: string): string {
  return stripDiacritics(String(value)).toUpperCase();
}

function hasAny(haystack: string, needles: string[]): boolean {
  return needles.some((needle) => haystack.includes(needle));
}

/**
 * Chuẩn hoá descriptor bẩn trên sao kê thành một khoá ổn định.
 * `"NETFLIX.COM 866-579-7172 US"` → `"NETFLIX.COM"`
 */
export function normalizeDescriptor(raw: string): string {
  let s = upperClean(raw).replace(/[•·|;]+/g, " ").replace(/\s+/g, " ").trim();

  // Gỡ tiền tố cổng thanh toán (lặp vì có thể lồng nhau)
  let changed = true;
  while (changed) {
    changed = false;
    for (const token of GATEWAY_TOKENS) {
      if (s.startsWith(token)) {
        s = s.slice(token.length).trim();
        changed = true;
      }
    }
  }

  // Gỡ ngày tháng, mã tham chiếu, số điện thoại, số thẻ
  s = s
    .replace(/\b\d{2,4}-\d{3}-\d{4}\b/g, " ")
    .replace(/\b\d{1,2}[/\-.]\d{1,2}([/\-.]\d{2,4})?\b/g, " ")
    .replace(/\bREF[:# ]?\w+/g, " ")
    .replace(/\bTID[:# ]?\w+/g, " ")
    .replace(/\bID[:# ]?\d+/g, " ")
    .replace(/\b[\dX*]{4,}\b/g, " ")
    .replace(/[#*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Gỡ hậu tố địa lý (quét lại từ đầu mỗi lần cắt được)
  let again = true;
  while (again) {
    again = false;
    for (const suffix of GEO_SUFFIX) {
      const tail = ` ${suffix}`;
      if (s.length > tail.length + 1 && s.endsWith(tail)) {
        s = s.slice(0, -tail.length).trim();
        again = true;
      }
    }
  }

  return s.replace(/[.,\-_\s]+$/g, "").replace(/\s+/g, " ").trim();
}

/** Đổi khoá đã chuẩn hoá sang tên dịch vụ chính thức, nếu nhận diện được. */
function identifyService(key: string): { name: string; cat: string; known: boolean } {
  for (const svc of KNOWN_SERVICES) {
    if (svc.match.some((needle) => key.includes(needle))) {
      return { name: svc.name, cat: svc.cat, known: true };
    }
  }
  const words = key
    .split(" ")
    .slice(0, 3)
    .map((w) => (w.length <= 3 ? w : w.charAt(0) + w.slice(1).toLowerCase()));
  return { name: words.join(" ") || key, cat: "other", known: false };
}

/* ------------------------------------------------------------------ *
 * Parse số tiền và ngày
 * ------------------------------------------------------------------ */
/**
 * Hỗ trợ cả định dạng VN (`260.000`, `1.234.567`) và quốc tế (`15.99`, `1,234.56`).
 * Quy tắc: nếu sau dấu phân cách cuối cùng có đúng 3 chữ số → dấu phân cách nghìn.
 */
export function parseAmount(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const original = String(raw).trim();
  if (!original) return null;

  const negative =
    /^\(.*\)$/.test(original) || /^-/.test(original) || /-\s*$/.test(original) || /\bDR\b/i.test(original);

  const s = original.replace(/[()]/g, "").replace(/[^\d.,]/g, "");
  if (!/\d/.test(s)) return null;

  const decimalPos = Math.max(s.lastIndexOf("."), s.lastIndexOf(","));
  let value: number;

  if (decimalPos === -1) {
    value = Number.parseFloat(s);
  } else {
    const digitsAfter = s.length - decimalPos - 1;
    if (digitsAfter === 3) {
      value = Number.parseFloat(s.replace(/[.,]/g, ""));
    } else {
      const intPart = s.slice(0, decimalPos).replace(/[.,]/g, "");
      const fracPart = s.slice(decimalPos + 1).replace(/[.,]/g, "");
      value = Number.parseFloat(`${intPart || "0"}${fracPart ? `.${fracPart}` : ""}`);
    }
  }

  if (Number.isNaN(value)) return null;
  return negative ? -value : value;
}

const DATE_RE = /^(\d{1,4})[/\-.](\d{1,2})[/\-.](\d{2,4})$/;

function looksLikeDate(raw: string | undefined): boolean {
  return DATE_RE.test(String(raw ?? "").trim());
}

interface DateParts {
  a: number;
  b: number;
  year: number;
  iso: boolean;
}

function splitDate(raw: string | undefined): DateParts | null {
  const match = DATE_RE.exec(String(raw ?? "").trim());
  if (!match) return null;

  const p1 = Number.parseInt(match[1], 10);
  const p2 = Number.parseInt(match[2], 10);
  let p3 = Number.parseInt(match[3], 10);

  if (match[1].length === 4) return { a: p2, b: p3, year: p1, iso: true };
  if (p3 < 100) p3 += p3 > 70 ? 1900 : 2000;
  return { a: p1, b: p2, year: p3, iso: false };
}

function buildDate(parts: DateParts | null, dayFirst: boolean): Date | null {
  if (!parts) return null;

  let day: number;
  let month: number;
  if (parts.iso) {
    month = parts.a;
    day = parts.b;
  } else if (dayFirst) {
    day = parts.a;
    month = parts.b;
  } else {
    month = parts.a;
    day = parts.b;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(parts.year, month - 1, day));
  if (date.getUTCMonth() !== month - 1) return null; // ví dụ 31/02
  return date;
}

/* ------------------------------------------------------------------ *
 * Nhận diện cột
 * ------------------------------------------------------------------ */
type HeaderKind = "balance" | "credit" | "debit" | "amount" | "date" | "desc";

/** Thứ tự quan trọng: balance trước amount, date trước desc ("Ngày giao dịch"). */
const HEADER_KEYS: Array<[HeaderKind, string[]]> = [
  ["balance", ["SO DU", "DU CUOI", "DU DAU", "BALANCE", "CLOSING"]],
  ["credit", ["GHI CO", "PHAT SINH CO", "TIEN VAO", "CREDIT", "DEPOSIT", "MONEY IN", "PAID IN"]],
  ["debit", ["GHI NO", "PHAT SINH NO", "TIEN RA", "DEBIT", "WITHDRAWAL", "WITHDRAW", "MONEY OUT", "PAID OUT"]],
  ["amount", ["SO TIEN", "AMOUNT", "GIA TRI", "VALUE", "TIEN"]],
  ["date", ["NGAY", "DATE", "THOI GIAN", "POSTED"]],
  ["desc", ["NOI DUNG", "DIEN GIAI", "MO TA", "DESCRIPTION", "DETAIL", "MEMO", "NARRATIVE", "MERCHANT", "PAYEE", "GIAO DICH"]],
];

function headerKind(cell: string | undefined): HeaderKind | null {
  const header = upperClean(cell ?? "")
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!header) return null;

  for (const [kind, keys] of HEADER_KEYS) {
    if (keys.some((key) => header.includes(key))) return kind;
  }
  return null;
}

function detectDelimiter(lines: string[]): string | null {
  const candidates = [",", ";", "\t", "|"];
  let best: string | null = null;
  let bestScore = 0;

  for (const delimiter of candidates) {
    let total = 0;
    let rows = 0;
    for (const line of lines.slice(0, 12)) {
      const count = line.split(delimiter).length - 1;
      if (count >= 2) {
        total += count;
        rows++;
      }
    }
    if (rows >= Math.min(3, lines.length) && total > bestScore) {
      bestScore = total;
      best = delimiter;
    }
  }
  return best;
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuote = false;

  for (let i = 0; i < line.length; i++) {
    const char = line.charAt(i);
    if (char === '"') {
      if (inQuote && line.charAt(i + 1) === '"') {
        current += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (char === delimiter && !inQuote) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

/** `"12/07/2026  NETFLIX.COM 866-579-7172   -260.000"` → `[date, desc, amount]` */
function parseFreeLine(line: string): string[] | null {
  const dateMatch = /(\d{1,4}[/\-.]\d{1,2}[/\-.]\d{2,4})/.exec(line);
  if (!dateMatch) return null;

  const rest = line.slice(dateMatch.index + dateMatch[0].length);
  const amountMatch = /(-?\(?\s*\d[\d.,]*\s*\)?)\s*(VND|USD|EUR|₫|€|\$)?\s*$/i.exec(rest);
  if (!amountMatch) return null;

  const description = rest.slice(0, amountMatch.index).trim();
  if (!description) return null;
  return [dateMatch[0], description, amountMatch[0]];
}

/**
 * Tìm cột "số dư" bằng quan hệ `số dư[i] - số dư[i-1] ≈ số tiền[i]`.
 * Đây là cách đáng tin cậy nhất để phân biệt cột số tiền với cột số dư
 * khi header không rõ ràng.
 */
function findBalanceRelation(
  rows: string[][],
  cols: number[],
): { amount: number; balance: number } | null {
  let best: { amount: number; balance: number; ratio: number } | null = null;

  for (const amountCol of cols) {
    for (const balanceCol of cols) {
      if (amountCol === balanceCol) continue;

      let matches = 0;
      let tested = 0;
      for (let i = 1; i < rows.length; i++) {
        const prev = parseAmount(rows[i - 1][balanceCol]);
        const current = parseAmount(rows[i][balanceCol]);
        const amount = parseAmount(rows[i][amountCol]);
        if (prev === null || current === null || amount === null || amount === 0) continue;

        tested++;
        const delta = current - prev;
        const tolerance = Math.max(1, Math.abs(amount) * 0.01);
        if (Math.abs(delta - amount) <= tolerance || Math.abs(delta + amount) <= tolerance) matches++;
      }

      if (tested >= 3) {
        const ratio = matches / tested;
        if (ratio >= 0.7 && (!best || ratio > best.ratio)) {
          best = { amount: amountCol, balance: balanceCol, ratio };
        }
      }
    }
  }

  return best ? { amount: best.amount, balance: best.balance } : null;
}

/* ------------------------------------------------------------------ *
 * Thống kê
 * ------------------------------------------------------------------ */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

function classifyCycle(days: number): CycleSpec | null {
  return CYCLES.find((cycle) => days >= cycle.min && days <= cycle.max) ?? null;
}

/** Cộng 1 chu kỳ vào ngày, giữ nguyên ngày-trong-tháng khi có thể (31/01 → 28/02). */
function addCycle(date: Date, cycle: CycleSpec): Date {
  const next = new Date(date.getTime());

  if (cycle.id === "weekly") {
    next.setUTCDate(next.getUTCDate() + 7);
    return next;
  }
  if (cycle.id === "biweekly") {
    next.setUTCDate(next.getUTCDate() + 14);
    return next;
  }

  const months = MONTHS_PER_CYCLE[cycle.id];
  if (!months) {
    next.setUTCDate(next.getUTCDate() + Math.round(cycle.days));
    return next;
  }

  const day = next.getUTCDate();
  const target = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/* ------------------------------------------------------------------ *
 * Đọc sao kê
 * ------------------------------------------------------------------ */
export interface ParseResult {
  rows: Transaction[];
  skippedLines: number;
  currency: Currency;
  dayFirst: boolean;
  columns: Record<string, number>;
}

export function parseStatement(text: string, options: AnalyzeOptions = {}): ParseResult {
  const lines = String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const delimiter = detectDelimiter(lines);
  let skipped = 0;

  const rawRows: Array<{ cells: string[]; raw: string }> = [];
  for (const line of lines) {
    const cells = delimiter ? splitCsvLine(line, delimiter) : parseFreeLine(line);
    if (!cells) {
      skipped++;
      continue;
    }
    rawRows.push({ cells, raw: line });
  }

  // Dòng có ngày hợp lệ → dòng dữ liệu. Dòng đầu không có ngày → header.
  const dataRows: Array<{ cells: string[]; raw: string }> = [];
  let headerCells: string[] | null = null;
  for (const row of rawRows) {
    if (row.cells.some((cell) => looksLikeDate(cell))) dataRows.push(row);
    else {
      if (!headerCells) headerCells = row.cells;
      skipped++;
    }
  }

  if (dataRows.length === 0) {
    return { rows: [], skippedLines: skipped, currency: "VND", dayFirst: true, columns: {} };
  }

  // Suy luận thứ tự ngày/tháng từ chính bộ dữ liệu (dd/mm vs mm/dd)
  let dayFirst = options.localeDayFirst !== false;
  let sawDayFirst = false;
  let sawMonthFirst = false;
  for (const row of dataRows) {
    for (const cell of row.cells) {
      const parts = splitDate(cell);
      if (!parts || parts.iso) continue;
      if (parts.a > 12) sawDayFirst = true;
      else if (parts.b > 12) sawMonthFirst = true;
    }
  }
  if (sawDayFirst) dayFirst = true;
  else if (sawMonthFirst) dayFirst = false;

  /* --- Phân loại cột ---------------------------------------------- */
  const colCount = dataRows.reduce((max, row) => Math.max(max, row.cells.length), 0);
  const cellMatrix = dataRows.map((row) => row.cells);

  const dateCols: number[] = [];
  const numCols: number[] = [];
  const textScore: number[] = [];

  for (let col = 0; col < colCount; col++) {
    let dateHits = 0;
    let numHits = 0;
    let chars = 0;

    for (const row of dataRows) {
      const cell = row.cells[col] ?? "";
      if (looksLikeDate(cell)) {
        dateHits++;
      } else if (/\d/.test(cell) && /^[\d.,\-()\s]*$/.test(cell) && parseAmount(cell) !== null) {
        numHits++;
      } else if (/[A-Za-zÀ-ỹ]/.test(cell)) {
        chars += cell.length;
      }
    }

    textScore[col] = chars;
    if (dateHits / dataRows.length >= 0.6) dateCols.push(col);
    else if (numHits / dataRows.length >= 0.6) numCols.push(col);
  }

  const kinds: Array<HeaderKind | null> = headerCells ? headerCells.map(headerKind) : [];

  let dateCol = dateCols.length > 0 ? dateCols[0] : -1;
  for (const col of dateCols) {
    if (kinds[col] === "date") {
      dateCol = col;
      break;
    }
  }

  let amountCol = -1;
  let balanceCol = -1;
  let debitCol = -1;
  let creditCol = -1;

  for (const col of numCols) {
    const kind = kinds[col];
    if (kind === "balance" && balanceCol === -1) balanceCol = col;
    else if (kind === "credit" && creditCol === -1) creditCol = col;
    else if (kind === "debit" && debitCol === -1) debitCol = col;
    else if (kind === "amount" && amountCol === -1) amountCol = col;
  }

  // Header không đủ rõ → suy luận từ dữ liệu
  if (amountCol === -1 && debitCol === -1 && creditCol === -1) {
    const candidates = numCols.filter((col) => col !== balanceCol);
    if (candidates.length === 1) {
      amountCol = candidates[0];
    } else if (candidates.length > 1) {
      const relation = findBalanceRelation(cellMatrix, candidates);
      if (relation) {
        amountCol = relation.amount;
        balanceCol = relation.balance;
      } else {
        // Cột số dư thường lớn hơn nhiều so với cột số tiền
        amountCol = [...candidates].sort((a, b) => {
          const medA = median(cellMatrix.map((r) => parseAmount(r[a])).filter((v): v is number => v !== null && v !== 0).map(Math.abs));
          const medB = median(cellMatrix.map((r) => parseAmount(r[b])).filter((v): v is number => v !== null && v !== 0).map(Math.abs));
          return medA - medB;
        })[0];
      }
    }
  }

  let descCol = kinds.findIndex((kind, index) => kind === "desc" && index !== dateCol);
  if (descCol === -1) {
    let bestScore = 0;
    for (let col = 0; col < colCount; col++) {
      if (col === dateCol || col === amountCol || col === balanceCol) continue;
      if ((textScore[col] ?? 0) > bestScore) {
        bestScore = textScore[col] ?? 0;
        descCol = col;
      }
    }
  }

  /* --- Đọc từng dòng --------------------------------------------- */
  const rows: Transaction[] = [];
  const votes: Record<Currency, number> = { VND: 0, USD: 0, EUR: 0 };

  for (const row of dataRows) {
    const cells = row.cells;

    let date = dateCol >= 0 ? buildDate(splitDate(cells[dateCol]), dayFirst) : null;
    if (!date) {
      for (const cell of cells) {
        if (looksLikeDate(cell)) {
          date = buildDate(splitDate(cell), dayFirst);
          if (date) break;
        }
      }
    }
    if (!date) {
      skipped++;
      continue;
    }

    let amount: number | null = null;
    if (debitCol >= 0 || creditCol >= 0) {
      const debit = debitCol >= 0 ? parseAmount(cells[debitCol]) : null;
      const credit = creditCol >= 0 ? parseAmount(cells[creditCol]) : null;
      if (debit !== null && Math.abs(debit) > 0) amount = -Math.abs(debit);
      else if (credit !== null && Math.abs(credit) > 0) amount = Math.abs(credit);
    } else if (amountCol >= 0) {
      amount = parseAmount(cells[amountCol]);
    }
    if (amount === null || amount === 0) {
      skipped++;
      continue;
    }

    let description = descCol >= 0 ? (cells[descCol] ?? "") : "";
    if (!description || /^[\d.,\-\s]*$/.test(description)) {
      description = "";
      for (let col = 0; col < cells.length; col++) {
        if (col === dateCol || col === amountCol || col === balanceCol) continue;
        if (/^[\d.,\-\s]*$/.test(cells[col])) continue;
        if (cells[col].length > description.length) description = cells[col];
      }
    }
    if (!description) {
      skipped++;
      continue;
    }

    const joined = cells.join(" ");
    if (/₫|VND|VNĐ/i.test(joined)) votes.VND++;
    else if (/\$|USD/i.test(joined)) votes.USD++;
    else if (/€|EUR/i.test(joined)) votes.EUR++;

    rows.push({
      date,
      description,
      amount,
      balance: balanceCol >= 0 ? parseAmount(cells[balanceCol]) : null,
      raw: row.raw,
    });
  }

  // Số tiền không có dấu + có cột số dư → lấy dấu từ biến động số dư
  if (!rows.some((row) => row.amount < 0) && balanceCol >= 0) {
    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1].balance;
      const current = rows[i].balance;
      if (prev === null || current === null) continue;
      if (current - prev < 0) rows[i].amount = -Math.abs(rows[i].amount);
    }
  }

  // Không có ký hiệu tiền tệ: VND thường không có phần thập phân
  let currency: Currency = "VND";
  if (votes.USD > votes.VND && votes.USD >= votes.EUR) currency = "USD";
  else if (votes.EUR > votes.VND && votes.EUR > votes.USD) currency = "EUR";
  else if (votes.VND === 0 && votes.USD === 0 && votes.EUR === 0) {
    const hasCents = rows.some((row) => Math.abs(row.amount) % 1 !== 0);
    const allSmall = rows.length > 0 && rows.every((row) => Math.abs(row.amount) < 5000);
    currency = hasCents && allSmall ? "USD" : "VND";
  }

  return {
    rows,
    skippedLines: skipped,
    currency,
    dayFirst,
    columns: { date: dateCol, description: descCol, amount: amountCol, balance: balanceCol, debit: debitCol, credit: creditCol },
  };
}

/* ------------------------------------------------------------------ *
 * Phát hiện subscription
 * ------------------------------------------------------------------ */
export function detectSubscriptions(
  rows: Transaction[],
  options: AnalyzeOptions = {},
): Omit<AnalyzeResult, "currency"> {
  const reference = options.today ?? new Date();
  const today = new Date(
    Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate()),
  );

  // Chỉ giữ giao dịch tiền RA
  const hasNegative = rows.some((row) => row.amount < 0);
  const debits = rows
    .filter((row) => {
      if (hasAny(upperClean(row.description), CREDIT_HINTS)) return false;
      return hasNegative ? row.amount < 0 : true;
    })
    .map((row) => ({ date: row.date, description: row.description, amount: Math.abs(row.amount) }));

  // Gom nhóm theo descriptor đã chuẩn hoá
  const groups = new Map<string, Array<{ date: Date; description: string; amount: number }>>();
  for (const item of debits) {
    const key = normalizeDescriptor(item.description);
    if (!key) continue;
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }

  const subscriptions: Subscription[] = [];
  const rejected: RejectedGroup[] = [];

  for (const [key, bucket] of groups) {
    const items = [...bucket].sort((a, b) => a.date.getTime() - b.date.getTime());
    const service = identifyService(key);
    const base = { key, name: service.name, occurrences: items.length };

    if (items.length < 2) {
      rejected.push({ ...base, reason: "single" });
      continue;
    }

    const intervals: number[] = [];
    for (let i = 1; i < items.length; i++) intervals.push(daysBetween(items[i - 1].date, items[i].date));

    const medInterval = median(intervals);
    const cycle = classifyCycle(medInterval);
    if (!cycle) {
      rejected.push({ ...base, reason: "no-cycle" });
      continue;
    }

    const okIntervals = intervals.filter(
      (interval) => Math.abs(interval - medInterval) <= Math.max(3, medInterval * 0.25),
    ).length;
    const intervalScore = okIntervals / intervals.length;

    const amounts = items.map((item) => item.amount);
    const medAmount = median(amounts);
    const maxDeviation = Math.max(
      ...amounts.map((amount) => (medAmount ? Math.abs(amount - medAmount) / medAmount : 1)),
    );

    if (maxDeviation > 0.35) {
      rejected.push({ ...base, reason: "amount-varies" });
      continue;
    }
    if (intervalScore < 0.6) {
      rejected.push({ ...base, reason: "irregular" });
      continue;
    }

    const hint = hasAny(key, SUBSCRIPTION_HINTS);
    if (items.length === 2 && !service.known && !hint && maxDeviation > 0.02) {
      rejected.push({ ...base, reason: "weak-evidence" });
      continue;
    }

    // Điểm tin cậy 35-99.
    // Chỉ 1 khoảng cách (2 lần trừ tiền) thì không thể kiểm chứng tính định kỳ
    // → hạ mạnh điểm, để người dùng phải tự duyệt ở bước xác nhận.
    const periodicity = intervals.length >= 2 ? intervalScore : intervalScore * 0.4;
    const confidence = Math.max(
      35,
      Math.min(
        99,
        30 +
          Math.min(items.length, 6) * 6 +
          Math.round(periodicity * 18) +
          Math.round((1 - Math.min(maxDeviation / 0.35, 1)) * 14) +
          (service.known ? 8 : hint ? 3 : 0),
      ),
    );

    const lastCharge = items[items.length - 1].date;
    let nextCharge = addCycle(lastCharge, cycle);
    let guard = 0;
    while (nextCharge < today && guard++ < 60) nextCharge = addCycle(nextCharge, cycle);

    subscriptions.push({
      key,
      name: service.name,
      category: service.cat,
      known: service.known,
      merchant: items[items.length - 1].description,
      amount: round2(medAmount),
      cycle: cycle.id,
      monthlyAmount: round2(medAmount * cycle.monthlyFactor),
      yearlyAmount: round2(medAmount * cycle.monthlyFactor * 12),
      occurrences: items.length,
      firstCharge: items[0].date,
      lastCharge,
      nextCharge,
      daysUntilNext: daysBetween(today, nextCharge),
      confidence,
      confidenceLevel: confidence >= 80 ? "high" : confidence >= 60 ? "medium" : "low",
      history: items.map((item) => ({ date: item.date, amount: item.amount })),
    });
  }

  subscriptions.sort((a, b) => b.monthlyAmount - a.monthlyAmount);
  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.monthlyAmount, 0);

  return {
    subscriptions,
    rejected,
    stats: {
      transactions: rows.length,
      debits: debits.length,
      merchants: groups.size,
      found: subscriptions.length,
      ignored: rejected.length,
      totalMonthly: round2(totalMonthly),
      totalYearly: round2(totalMonthly * 12),
      skippedLines: 0,
    },
  };
}

/** Đường ống đầy đủ: văn bản sao kê → kết quả. */
export function analyze(text: string, options: AnalyzeOptions = {}): AnalyzeResult {
  const parsed = parseStatement(text, options);
  const detected = detectSubscriptions(parsed.rows, options);

  return {
    ...detected,
    currency: parsed.currency,
    stats: { ...detected.stats, skippedLines: parsed.skippedLines },
  };
}
