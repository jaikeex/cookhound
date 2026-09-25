'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { classNames, cooldownCaption } from '@/client/utils';
import { Star } from '@/client/components/atoms/Star';
import type { StarState } from '@/client/components/atoms/Star/types';
import { Typography } from '@/client/components/atoms/Typography';
import {
    generateStars,
    MAX_RATING,
    RATING_CLASS_CONFIG,
    type RatingSize
} from '@/client/components/molecules/Rating/utils';
import { useCooldown } from '@/client/hooks';
import { t } from '@/client/locales';

export type RatingInteractiveProps = Readonly<{
    className?: string;
    cooldown?: number;
    cooldownKey?: string;
    disabled?: boolean;
    fill?: 'gold' | 'silver' | 'bronze';
    iconSize?: number;
    onClick?: (rating: number) => void;
    onDisabledClick?: () => void;
    rating: number | null;
    size?: RatingSize;
}>;

export const RatingInteractive: React.FC<RatingInteractiveProps> = ({
    className,
    cooldown,
    cooldownKey,
    disabled,
    fill = 'gold',
    iconSize = 24,
    onClick,
    onDisabledClick,
    rating,
    size = 'md'
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPulsing, setIsPulsing] = useState(false);

    const hasRating = rating !== null;

    const { startCooldown, isOnCooldown, remainingTime } = useCooldown(
        cooldown ?? 0,
        cooldownKey ?? 'rating'
    );

    const isSubmitting = useRef(false);

    const [stars, setStars] = useState<StarState[]>(generateStars(rating ?? 0));

    const handleMouseMove = useCallback(
        (index: number) => (isInLeftHalf: boolean) => {
            // Don't update stars on hover during cooldown
            if (isOnCooldown || disabled) return;

            const hoverRating = index + (isInLeftHalf ? 0.5 : 1);

            setIsHovered(true);
            setStars(generateStars(hoverRating));
        },
        [isOnCooldown, disabled]
    );

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
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
                if (cooldown) {
                    startCooldown();
                }

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

    const caption = isOnCooldown
        ? cooldownCaption(Math.max(1, Math.ceil(remainingTime / 1000)))
        : hasRating
          ? null
          : t('app.recipe.not-yet-rated');

    // A disabled widget still reacts to clicks when a fallback handler is supplied,
    // so the cursor has to keep advertising that
    const isClickable = disabled ? Boolean(onDisabledClick) : !isOnCooldown;

    return (
        <div className={classNames('relative', className)}>
            <div
                className={classNames(
                    'flex items-center max-w-fit mx-auto',
                    RATING_CLASS_CONFIG.gap[size],
                    (disabled || isOnCooldown) && 'opacity-80',
                    isOnCooldown && 'cursor-not-allowed'
                )}
                onMouseLeave={handleMouseLeave}
                onClick={disabled ? onDisabledClick : handleClick}
            >
                {stars.map((star, index) => (
                    <Star
                        key={index}
                        disabled={!isClickable}
                        onMouseMove={handleMouseMove(index)}
                        state={star}
                        iconSize={iconSize}
                        fill={stars[index] !== 'empty' ? fill : 'silver'}
                        className={classNames(
                            RATING_CLASS_CONFIG.starSize[size],
                            !hasRating &&
                                (isHovered ? 'opacity-100' : 'opacity-80')
                        )}
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

            {caption ? (
                <Typography
                    variant={'body-sm'}
                    className="w-fit mx-auto mt-1 tabular-nums"
                >
                    {caption}
                </Typography>
            ) : null}
        </div>
    );
};
