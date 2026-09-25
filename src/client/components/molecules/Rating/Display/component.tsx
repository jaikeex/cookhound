import React from 'react';
import { classNames } from '@/client/utils';
import { Star } from '@/client/components/atoms/Star';
import {
    generateStars,
    RATING_CLASS_CONFIG,
    type RatingSize
} from '@/client/components/molecules/Rating/utils';

export type RatingDisplayProps = Readonly<{
    className?: string;
    fill?: 'gold' | 'silver' | 'bronze';
    iconSize?: number;
    rating: number;
    size?: RatingSize;
}>;

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
    className,
    fill = 'gold',
    iconSize = 24,
    rating,
    size = 'md'
}) => (
    <div className={classNames('relative', className)}>
        <div
            className={classNames(
                'flex items-center max-w-fit mx-auto opacity-80',
                RATING_CLASS_CONFIG.gap[size]
            )}
        >
            {generateStars(rating).map((star, index) => (
                <Star
                    key={index}
                    disabled
                    state={star}
                    iconSize={iconSize}
                    fill={star !== 'empty' ? fill : 'silver'}
                    className={RATING_CLASS_CONFIG.starSize[size]}
                />
            ))}
        </div>
    </div>
);
