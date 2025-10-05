import { ButtonBase, Typography } from '@/client/components';
import { classNames } from '@/client/utils';
import React from 'react';

type ButtonRowProps = Readonly<{
    className?: string;
    buttonText: string;
    buttonSize?: 'sm' | 'md' | 'lg';
    buttonClassName?: string;
    onClick: () => void;
    heading?: string;
    buttonColor?: 'primary' | 'secondary' | 'danger' | 'subtle' | 'warning';
    label?: string;
    outlined?: boolean;
}>;

export const ButtonRow: React.FC<ButtonRowProps> = ({
    className,
    buttonText,
    buttonSize = 'sm',
    buttonClassName,
    heading,
    label,
    onClick,
    buttonColor = 'subtle',
    outlined = false
}) => {
    return (
        <div className={classNames('flex flex-col gap-2', className)}>
            {heading ? (
                <Typography variant="heading-xs" className="font-semibold">
                    {heading}
                </Typography>
            ) : null}
            <div className="flex items-center justify-between gap-8">
                {label ? (
                    <Typography variant="body-sm">{label}</Typography>
                ) : null}

                <ButtonBase
                    className={`${label ? 'ml-auto' : 'w-full'} ${buttonClassName}`}
                    size={buttonSize}
                    color={buttonColor}
                    onClick={onClick}
                    aria-label={buttonText}
                    outlined={outlined}
                >
                    {buttonText}
                </ButtonBase>
            </div>
        </div>
    );
};
