import { ButtonBase } from '@/client/components/atoms/Button';
import { Typography } from '@/client/components/atoms/Typography';
import classNames from '@/client/utils/classnames';
import React from 'react';

type ButtonRowProps = Readonly<{
    className?: string;
    buttonText: string;
    onClick: () => void;
    buttonColor?: 'primary' | 'secondary' | 'danger' | 'subtle' | 'warning';
    label: string;
    outlined?: boolean;
}>;

export const ButtonRow: React.FC<ButtonRowProps> = ({
    className,
    buttonText,
    label,
    onClick,
    buttonColor = 'subtle',
    outlined = false
}) => {
    return (
        <div
            className={classNames(
                'flex items-center justify-between gap-8',
                className
            )}
        >
            <Typography variant="body-sm">{label}</Typography>

            <ButtonBase
                size="sm"
                color={buttonColor}
                onClick={onClick}
                aria-label={buttonText}
                outlined={outlined}
            >
                {buttonText}
            </ButtonBase>
        </div>
    );
};
