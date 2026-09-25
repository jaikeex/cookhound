import { StarState } from '@/client/components/atoms/Star/types';

export const MAX_RATING = 5;

export type RatingSize = 'sm' | 'md' | 'lg';

export const RATING_CLASS_CONFIG = {
    starSize: { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' },
    gap: { sm: 'gap-1', md: 'gap-2', lg: 'gap-3' }
} as const satisfies Record<'starSize' | 'gap', Record<RatingSize, string>>;

const VALUE_MAP = {
    [StarState.FULL]: 1,
    [StarState.HALF]: 0.5,
    [StarState.EMPTY]: 0
};

/**
 * Generates an array of StarState based on the rating
 *
 * @param rating The rating to generate the stars for
 * @returns An array of StarState
 */
export const generateStars = (rating: number): Array<StarState> => {
    const stars = [];

    const ratingMathed = Math.min(MAX_RATING, Math.max(0, rating));
    const isHalf = ratingMathed % 1 !== 0;

    if (isHalf) {
        for (let i = 1; i < ratingMathed; i++) {
            stars.push(StarState.FULL);
        }

        stars.push(StarState.HALF);

        for (let i = 1; i < MAX_RATING - ratingMathed; i++) {
            stars.push(StarState.EMPTY);
        }
    } else {
        for (let i = 0; i < ratingMathed; i++) {
            stars.push(StarState.FULL);
        }

        for (let i = 0; i < MAX_RATING - ratingMathed; i++) {
            stars.push(StarState.EMPTY);
        }
    }

    return stars;
};

/**
 * Gets the rating number from an array of StarState
 *
 * @param stars The array of StarState
 * @returns The rating
 */
export const getRatingFromStars = (stars: StarState[]): number =>
    stars.reduce((acc, star) => acc + VALUE_MAP[star], 0);
