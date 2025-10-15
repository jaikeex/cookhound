import type { Locale } from '@/common/types';

type TimeUnits = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';
type PluralCategory = 'one' | 'few' | 'many' | 'other';

/**
 * Defines the structure for a language's localization rules.
 */
interface LanguagePack {
    /**
     * A function that determines the correct pluralization category for a given number.
     *
     * @param n The number to categorize.
     * @returns The plural category.
     */
    pluralization: (n: number) => PluralCategory;

    /**
     * A function that formats the final output string.
     * This allows for different sentence structures across languages.
     *
     * @param value The numeric value.
     * @param unit The translated time unit (e.g., "day", "days").
     * @returns The final, formatted string.
     */
    formatter: (value: number, unit: string) => string;

    /**
     * Translation strings for each time unit, categorized by plural form.
     */
    translations: Record<TimeUnits, Partial<Record<PluralCategory, string>>>;
}

const en: LanguagePack = {
    pluralization: (n) => (n === 1 ? 'one' : 'other'),
    formatter: (value, unit) => `${value} ${unit}`,
    translations: {
        year: { one: 'year', other: 'years' },
        month: { one: 'month', other: 'months' },
        day: { one: 'day', other: 'days' },
        hour: { one: 'hour', other: 'hours' },
        minute: { one: 'minute', other: 'minutes' },
        second: { one: 'second', other: 'seconds' }
    }
};

const cs: LanguagePack = {
    pluralization: (n) => {
        if (n === 1) return 'one';
        if (n >= 2 && n <= 4) return 'few';
        return 'many';
    },
    formatter: (value, unit) => `${value} ${unit}`,
    translations: {
        year: { one: 'rok', few: 'roky', many: 'let' },
        month: { one: 'měsíc', few: 'měsíce', many: 'měsíců' },
        day: { one: 'den', few: 'dny', many: 'dní' },
        hour: { one: 'hodina', few: 'hodiny', many: 'hodin' },
        minute: { one: 'minuta', few: 'minuty', many: 'minut' },
        second: { one: 'sekunda', few: 'sekundy', many: 'sekund' }
    }
};

const languagePacks: Record<Locale, LanguagePack> = {
    en,
    cs
};

/**
 * Calculates the difference between a timestamp and now, returning a readable,
 * localized string. This function is now language-agnostic.
 *
 * @param timestamp The timestamp to compare with the current time (in milliseconds).
 * @param locale The locale to use for the output string.
 * @returns A localized string representing the time difference.
 */
export function getAgeString(createdAt: string, locale: Locale): string {
    if (!createdAt || !locale) return '';

    const timestamp = new Date(createdAt).getTime();

    const langPack = languagePacks[locale];
    if (!langPack) {
        return '';
    }

    const difference = Date.now() - timestamp;

    const seconds = Math.floor(difference / 1000);
    if (seconds < 60) {
        const category = langPack.pluralization(seconds);
        const unit =
            langPack.translations.second[category] ||
            langPack.translations.second.other;
        return langPack.formatter(seconds, unit!);
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        const category = langPack.pluralization(minutes);
        const unit =
            langPack.translations.minute[category] ||
            langPack.translations.minute.other;
        return langPack.formatter(minutes, unit!);
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        const category = langPack.pluralization(hours);
        const unit =
            langPack.translations.hour[category] ||
            langPack.translations.hour.other;
        return langPack.formatter(hours, unit!);
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
        const category = langPack.pluralization(days);
        const unit =
            langPack.translations.day[category] ||
            langPack.translations.day.other;
        return langPack.formatter(days, unit!);
    }

    const months = Math.floor(days / 30.44);
    if (months < 12) {
        const category = langPack.pluralization(months);
        const unit =
            langPack.translations.month[category] ||
            langPack.translations.month.other;
        return langPack.formatter(months, unit!);
    }

    const years = Math.floor(days / 365.25);
    const category = langPack.pluralization(years);
    const unit =
        langPack.translations.year[category] ||
        langPack.translations.year.other;
    return langPack.formatter(years, unit!);
}
