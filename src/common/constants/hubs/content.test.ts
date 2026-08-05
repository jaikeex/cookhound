import { describe, it, expect } from 'vitest';
import { CATEGORY_IDS, CS_TAG_CATEGORIES } from '@/common/constants/tags';
import { buildHubShortLabel, buildHubIndexLinkLabel } from './content';

//|=============================================================================================|//

describe('buildHubShortLabel', () => {
    it('completes a cuisine adjective with its noun', () => {
        expect(
            buildHubShortLabel('italian', 'italská', CATEGORY_IDS.cuisine)
        ).toBe('Italská kuchyně');
        expect(buildHubShortLabel('czech', 'česká', CATEGORY_IDS.cuisine)).toBe(
            'Česká kuchyně'
        );
    });

    it('prefers the override for a cuisine name that is not an adjective', () => {
        // 'blízký východ kuchyně' is what the derived rule would produce.
        expect(
            buildHubShortLabel(
                'middle-eastern',
                'blízký východ',
                CATEGORY_IDS.cuisine
            )
        ).toBe('Kuchyně Blízkého východu');
    });

    it('only capitalizes outside the cuisine category', () => {
        expect(buildHubShortLabel('soup', 'polévka', CATEGORY_IDS.type)).toBe(
            'Polévka'
        );
        expect(
            buildHubShortLabel('gluten-free', 'bez lepku', CATEGORY_IDS.diet)
        ).toBe('Bez lepku');
        expect(
            buildHubShortLabel(
                'very-easy',
                'velmi snadné',
                CATEGORY_IDS.difficulty
            )
        ).toBe('Velmi snadné');
    });

    it('leaves an already capitalized name alone', () => {
        expect(
            buildHubShortLabel('christmas', 'Vánoce', CATEGORY_IDS.season)
        ).toBe('Vánoce');
    });

    it('never renders a lowercase label for a seeded tag', () => {
        // Tag.name is stored lowercase, and a chip that starts lowercase reads
        // as a stray word rather than as a category.
        const lowercase = CS_TAG_CATEGORIES.type
            .map((csName) =>
                buildHubShortLabel('soup', csName, CATEGORY_IDS.type)
            )
            .filter(
                (label) => label.charAt(0) !== label.charAt(0).toUpperCase()
            );

        expect(lowercase).toEqual([]);
    });
});

//|=============================================================================================|//

describe('buildHubIndexLinkLabel', () => {
    it('declines the czech noun for the count', () => {
        expect(buildHubIndexLinkLabel('Polévka', 1)).toBe('Polévka — 1 recept');
        expect(buildHubIndexLinkLabel('Polévka', 4)).toBe(
            'Polévka — 4 recepty'
        );
        expect(buildHubIndexLinkLabel('Polévka', 5)).toBe(
            'Polévka — 5 receptů'
        );
        expect(buildHubIndexLinkLabel('Polévka', 22)).toBe(
            'Polévka — 22 receptů'
        );
    });
});
