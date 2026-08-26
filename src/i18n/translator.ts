import type { Locale } from "./config";
// import type: chỉ lấy kiểu từ JSON, không bundle dữ liệu vào file này
import type viMessages from "./messages/vi.json";

/** Toàn bộ cây message của một locale — plain JSON nên serialize được qua RSC. */
export type Messages = typeof viMessages;

type Primitive = string | number | boolean;

/**
 * Sinh union các key dạng "hero.title" từ chính cấu trúc vi.json.
 * Nhờ vậy `t("hero.titl")` là lỗi biên dịch, không phải lỗi lúc chạy.
 */
type StringPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends Primitive
    ? `${Prefix}${K}`
    : T[K] extends readonly unknown[]
      ? never
      : T[K] extends object
        ? StringPaths<T[K], `${Prefix}${K}.`>
        : never;
}[keyof T & string];

type ArrayPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends readonly unknown[]
    ? `${Prefix}${K}`
    : T[K] extends Primitive
      ? never
      : T[K] extends object
        ? ArrayPaths<T[K], `${Prefix}${K}.`>
        : never;
}[keyof T & string];

export type MessageKey = StringPaths<Messages>;
export type MessageListKey = ArrayPaths<Messages>;

export type TranslationVars = Record<string, string | number>;

export interface Translator {
  locale: Locale;
  messages: Messages;
  /** Lấy một chuỗi, thay thế các biến dạng `{name}`. */
  t: (key: MessageKey, vars?: TranslationVars) => string;
  /** Lấy một mảng (danh sách tính năng, FAQ, dòng bảng…). */
  tList: <T>(key: MessageListKey) => T[];
}

function resolve(messages: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>((node, part) => {
    if (node && typeof node === "object") return (node as Record<string, unknown>)[part];
    return undefined;
  }, messages);
}

function interpolate(template: string, vars?: TranslationVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
  );
}

/**
 * Isomorphic: dùng được ở server component (nhận messages từ getMessages) và
 * ở client component (nhận messages qua props), nên chỉ locale đang dùng bị
 * gửi xuống trình duyệt.
 */
export function createTranslator(locale: Locale, messages: Messages): Translator {
  return {
    locale,
    messages,

    t(key, vars) {
      const value = resolve(messages, key);
      if (typeof value === "string") return interpolate(value, vars);
      if (typeof value === "number" || typeof value === "boolean") return String(value);
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[i18n] thiếu key "${key}" cho locale "${locale}"`);
      }
      return key;
    },

    tList<T>(key: MessageListKey): T[] {
      const value = resolve(messages, key);
      if (Array.isArray(value)) return value as T[];
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[i18n] key "${key}" không phải mảng cho locale "${locale}"`);
      }
      return [];
    },
  };
}
