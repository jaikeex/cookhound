'use client';

import React, { useCallback, useState } from 'react';
import type { StarState } from '@/client/components';
import { Star } from '@/client/components';
import {
    generateStars,
    getRatingFromStars
} from '@/client/components/molecules/Rating/utils';

export type RatingProps = Readonly<{
    className?: string;
    fill?: 'gold' | 'silver' | 'bronze';
    iconSize?: number;
    onClick?: (rating: number) => void;
    rating: number | null;
}>;

export const MAX_RATING = 5;

export const Rating: React.FC<RatingProps> = ({
    className,
    fill = 'gold',
    iconSize = 24,
    onClick,
    rating
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPulsing, setIsPulsing] = useState(false);
    const [stars, setStars] = useState<StarState[]>(generateStars(rating ?? 0));

    const handleMouseMove = useCallback(
        (index: number) => (isInLeftHalf: boolean) => {
            const hoverRating = index + (isInLeftHalf ? 0.5 : 1);

            setIsHovered(true);
            setStars(generateStars(hoverRating));
        },
        []
    );

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        setStars(generateStars(rating ?? 0));
    }, [rating]);

    const handleClick = useCallback(() => {
        setIsPulsing(true);
        onClick?.(getRatingFromStars(stars));

        setTimeout(() => {
            setIsPulsing(false);
        }, 1000);
    }, [stars, onClick]);

    return (
        <div className={className}>
            <div
                className={'flex items-center gap-2 max-w-fit'}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            >
                {stars.map((star, index) => (
                    <Star
                        key={index}
                        onMouseMove={handleMouseMove(index)}
                        state={star}
                        iconSize={iconSize}
                        fill={stars[index] !== 'empty' ? fill : 'silver'}
                        pulse={
                            isPulsing && isHovered && stars[index] !== 'empty'
                        }
                        highlight={isHovered && stars[index] !== 'empty'}
                    />
                ))}
            </div>

            {/*{rating === null ? (*/}
            {/*    <Typography variant={'body-sm'}>Not yet rated</Typography>*/}
            {/*) : null}*/}
        </div>
    );
};
