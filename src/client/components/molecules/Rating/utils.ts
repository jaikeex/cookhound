import { MAX_RATING, StarState } from '@/client/components';

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
        // If the rating is halved, the for loops will start at index 1, so that there is space for the half star
        for (let i = 1; i < ratingMathed; i++) {
            stars.push(StarState.FULL);
        }

        stars.push(StarState.HALF);

        for (let i = 1; i < MAX_RATING - ratingMathed; i++) {
            stars.push(StarState.EMPTY);
        }
    } else {
        // If the rating is not halved, the for loops start at 0 as usual
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
