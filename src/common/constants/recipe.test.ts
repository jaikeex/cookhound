import { describe, it, expect } from 'vitest';
import {
    RECIPE_DISPLAY_ID_REGEX,
    RECIPE_TITLE_SLUG_REGEX,
    LEGACY_DISPLAY_ID_REGEX
} from './recipe';

describe('RECIPE_DISPLAY_ID_REGEX', () => {
    it('accepts a fixed-length 6-digit id with a non-zero first digit', () => {
        expect(RECIPE_DISPLAY_ID_REGEX.test('100000')).toBe(true);
        expect(RECIPE_DISPLAY_ID_REGEX.test('999999')).toBe(true);
        expect(RECIPE_DISPLAY_ID_REGEX.test('482193')).toBe(true);
    });

    it('rejects leading zeros, wrong lengths and non-digits', () => {
        expect(RECIPE_DISPLAY_ID_REGEX.test('012345')).toBe(false);
        expect(RECIPE_DISPLAY_ID_REGEX.test('12345')).toBe(false);
        expect(RECIPE_DISPLAY_ID_REGEX.test('1234567')).toBe(false);
        expect(RECIPE_DISPLAY_ID_REGEX.test('12345a')).toBe(false);
        expect(
            RECIPE_DISPLAY_ID_REGEX.test('e3b0c442-98fc-4c14-b39f-92d1282048c0')
        ).toBe(false);
    });
});

describe('RECIPE_TITLE_SLUG_REGEX', () => {
    it('accepts dash-separated lowercase alphanumeric words', () => {
        expect(RECIPE_TITLE_SLUG_REGEX.test('svickova-na-smetane')).toBe(true);
        expect(RECIPE_TITLE_SLUG_REGEX.test('recept-2024')).toBe(true);
        expect(RECIPE_TITLE_SLUG_REGEX.test('gulas')).toBe(true);
    });

    it('rejects malformed title slugs', () => {
        expect(RECIPE_TITLE_SLUG_REGEX.test('')).toBe(false);
        expect(RECIPE_TITLE_SLUG_REGEX.test('-abc')).toBe(false);
        expect(RECIPE_TITLE_SLUG_REGEX.test('abc-')).toBe(false);
        expect(RECIPE_TITLE_SLUG_REGEX.test('a--b')).toBe(false);
        expect(RECIPE_TITLE_SLUG_REGEX.test('Abc')).toBe(false);
        expect(RECIPE_TITLE_SLUG_REGEX.test('a_b')).toBe(false);
        expect(RECIPE_TITLE_SLUG_REGEX.test('svíčková')).toBe(false);
    });
});

describe('LEGACY_DISPLAY_ID_REGEX', () => {
    it('accepts v4 uuids case-insensitively', () => {
        expect(
            LEGACY_DISPLAY_ID_REGEX.test('e3b0c442-98fc-4c14-b39f-92d1282048c0')
        ).toBe(true);
        expect(
            LEGACY_DISPLAY_ID_REGEX.test('E3B0C442-98FC-4C14-B39F-92D1282048C0')
        ).toBe(true);
    });

    it('rejects non-uuid params', () => {
        expect(LEGACY_DISPLAY_ID_REGEX.test('482193')).toBe(false);
        expect(LEGACY_DISPLAY_ID_REGEX.test('not-a-uuid')).toBe(false);
        expect(
            LEGACY_DISPLAY_ID_REGEX.test('e3b0c442-98fc-4c14-b39f-92d1282048c')
        ).toBe(false);
    });
});
