'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { StarState } from '@/client/components';
import { Star, Tooltip } from '@/client/components';
import { generateStars } from '@/client/components/molecules/Rating/utils';
import { useCooldown } from '@/client/hooks';

export type RatingProps = Readonly<{
    className?: string;
    cooldown?: number;
    disabled?: boolean;
    fill?: 'gold' | 'silver' | 'bronze';
    iconSize?: number;
    onClick?: (rating: number) => void;
    rating: number | null;
}>;

export const MAX_RATING = 5;

export const Rating: React.FC<RatingProps> = ({
    className,
    cooldown,
    disabled,
    fill = 'gold',
    iconSize = 24,
    onClick,
    rating
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPulsing, setIsPulsing] = useState(false);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    const { startCooldown, isOnCooldown, remainingTime } = useCooldown(
        cooldown ?? 0
    );

    const isSubmitting = useRef(false);
    const ref = useRef<HTMLDivElement | null>(null);

    const [stars, setStars] = useState<StarState[]>(generateStars(rating ?? 0));

    const handleMouseMove = useCallback(
        (index: number) => (isInLeftHalf: boolean) => {
            // Don't update stars on hover during cooldown
            if (isOnCooldown) return;

            const hoverRating = index + (isInLeftHalf ? 0.5 : 1);

            setIsHovered(true);
            setStars(generateStars(hoverRating));
        },
        [isOnCooldown]
    );

    const handleMouseEnter = useCallback(() => {
        setIsTooltipVisible(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        setIsTooltipVisible(false);
        setStars(generateStars(rating ?? 0));
    }, [rating]);

    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            if (!onClick || isOnCooldown || isSubmitting.current) return;

            isSubmitting.current = true;

            // Calculate rating from click position
            const container = event.currentTarget;
            const rect = container.getBoundingClientRect();
            const x = event.clientX - rect.left;

            // Calculate which star was clicked and which half
            const starWidth = rect.width / MAX_RATING;
            const starIndex = Math.floor(x / starWidth);
            const halfWidth = starWidth / 2;
            const isInLeftHalf = x - starIndex * starWidth < halfWidth;

            const clickedRating = Math.min(
                starIndex + (isInLeftHalf ? 0.5 : 1),
                MAX_RATING
            );

            setIsPulsing(true);
            onClick(clickedRating);

            setTimeout(() => {
                cooldown && startCooldown();
                isSubmitting.current = false;
                setIsPulsing(false);
            }, 1000);
        },
        [onClick, isOnCooldown, startCooldown, cooldown]
    );

    useEffect(() => {
        if (isPulsing) {
            return;
        }

        setStars(generateStars(rating ?? 0));
    }, [rating, isPulsing]);

    return (
        <div className={className}>
            <div
                ref={ref}
                className={classNames(
                    'flex items-center gap-2 max-w-fit',
                    (disabled || isOnCooldown) &&
                        'cursor-not-allowed opacity-80'
                )}
                onMouseLeave={handleMouseLeave}
                onClick={disabled || isOnCooldown ? undefined : handleClick}
                onMouseEnter={handleMouseEnter}
            >
                {stars.map((star, index) => (
                    <Star
                        key={index}
                        disabled={disabled || isOnCooldown}
                        onMouseMove={handleMouseMove(index)}
                        state={star}
                        iconSize={iconSize}
                        fill={stars[index] !== 'empty' ? fill : 'silver'}
                        pulse={
                            isPulsing && isHovered && stars[index] !== 'empty'
                        }
                        highlight={
                            isHovered &&
                            stars[index] !== 'empty' &&
                            !isOnCooldown
                        }
                    />
                ))}
            </div>

            <Tooltip
                text={`You can rate this recipe again in ${
                    remainingTime ? Math.round(remainingTime / 1000) : 0
                } seconds`}
                visible={isOnCooldown && isTooltipVisible}
                targetRef={ref}
            />

            {/*{rating === null ? (*/}
            {/*    <Typography variant={'body-sm'}>Not yet rated</Typography>*/}
            {/*) : null}*/}
        </div>
    );
};
