import en from "./messages/en.json";
import vi from "./messages/vi.json";
import { DEFAULT_LOCALE, type Locale } from "./config";
import { createTranslator, type Messages, type Translator } from "./translator";

const MESSAGES: Record<Locale, Messages> = {
  vi: vi as Messages,
  en: en as Messages,
};

/** Cây message của một locale. Dùng ở server, truyền xuống client qua props. */
export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
}

/** Translator dùng trong server component. */
export function getTranslator(locale: Locale): Translator {
  return createTranslator(locale, getMessages(locale));
}

export { createTranslator };
export type { Messages, Translator };
export type { MessageKey, MessageListKey } from "./translator";
export * from "./config";
