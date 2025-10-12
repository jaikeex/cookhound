import * as en from './en.json';
import * as cs from './cs.json';
import type { SUPPORTED_LOCALES } from '@/common/constants';

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type Messages = Record<I18nMessage, string>;
export type Locales = Record<Locale, Messages>;

export type I18nMessage = keyof typeof en;

export const enMessages = en;
export const csMessages = cs;

export const locales: Locales = {
    en: enMessages,
    cs: csMessages
};
