'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { classNames } from '@/client/utils';
import type { StarState } from '@/client/components';
import { Star, Tooltip, Typography } from '@/client/components';
import { generateStars } from '@/client/components/molecules/Rating/utils';
import { useCooldown, useScreenSize } from '@/client/hooks';
import { useLocale, useSnackbar } from '@/client/store';

export type RatingSize = 'sm' | 'md' | 'lg';

const classConfig = {
    starSize: { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' },
    gap: { sm: 'gap-1', md: 'gap-2', lg: 'gap-3' }
};

export type RatingProps = Readonly<{
    className?: string;
    cooldown?: number;
    cooldownKey?: string;
    disabled?: boolean;
    fill?: 'gold' | 'silver' | 'bronze';
    iconSize?: number;
    onClick?: (rating: number) => void;
    rating: number | null;
    size?: RatingSize;
}>;

export const MAX_RATING = 5;

export const Rating: React.FC<RatingProps> = ({
    className,
    cooldown,
    cooldownKey,
    disabled,
    fill = 'gold',
    iconSize = 24,
    onClick,
    rating,
    size = 'md'
}) => {
    const { t } = useLocale();
    const { alert } = useSnackbar();
    const { isMobile } = useScreenSize();

    const [isHovered, setIsHovered] = useState(false);
    const [isPulsing, setIsPulsing] = useState(false);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    const hasRating = rating !== null;

    const { startCooldown, isOnCooldown, remainingTime } = useCooldown(
        cooldown ?? 0,
        cooldownKey ?? 'rating'
    );

    const isSubmitting = useRef(false);
    const ref = useRef<HTMLDivElement | null>(null);

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
            if (isOnCooldown && isMobile) {
                alert({
                    message: t('app.recipe.you-can-rate-again-in', {
                        seconds: remainingTime
                            ? Math.round(remainingTime / 1000)
                            : 0
                    }),
                    variant: 'info'
                });
            }

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
        [
            onClick,
            isOnCooldown,
            startCooldown,
            cooldown,
            isMobile,
            alert,
            remainingTime,
            t
        ]
    );

    useEffect(() => {
        if (isPulsing) {
            return;
        }

        setStars(generateStars(rating ?? 0));
    }, [rating, isPulsing]);

    return (
        <div className={classNames('relative', className)}>
            <div
                ref={ref}
                className={classNames(
                    'flex items-center max-w-fit',
                    classConfig.gap[size],
                    (disabled || isOnCooldown) && 'opacity-80'
                )}
                onMouseLeave={handleMouseLeave}
                onClick={disabled ? undefined : handleClick}
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
                        className={classNames(
                            classConfig.starSize[size],
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

            <Tooltip
                text={`${t('app.recipe.you-can-rate-again-in', {
                    seconds: remainingTime
                        ? Math.round(remainingTime / 1000)
                        : 0
                })}`}
                className={'w-36 max-w-36 hidden md:block'}
                visible={isOnCooldown && isTooltipVisible}
                targetRef={ref}
            />

            {!hasRating ? (
                <Typography variant={'body-sm'} className="w-fit mx-auto mt-1">
                    {t('app.recipe.not-yet-rated')}
                </Typography>
            ) : null}
        </div>
    );
};
