'use client';

import React, { useCallback, useEffect } from 'react';
import {
    ButtonBase,
    Typography,
    type BaseButtonProps
} from '@/client/components';

type ButtonWithCooldownProps = Readonly<{
    cooldown: number;
}> &
    BaseButtonProps;

export const ButtonWithCooldown: React.FC<ButtonWithCooldownProps> = ({
    children,
    cooldown,
    onClick,
    ...props
}) => {
    const [isCooldown, setIsCooldown] = React.useState(false);
    const [remaining, setRemaining] = React.useState<number>(60);

    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            setIsCooldown(true);
            setRemaining(cooldown / 1000);

            setTimeout(() => {
                setIsCooldown(false);
            }, cooldown);

            if (onClick === undefined) {
                return;
            }

            onClick(event);
        },
        [cooldown, onClick]
    );

    useEffect(() => {
        if (!isCooldown) {
            return;
        }

        const interval = setInterval(() => {
            setRemaining((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isCooldown]);

    return (
        <div className="flex flex-col items-center gap-2">
            <ButtonBase {...props} disabled={isCooldown} onClick={handleClick}>
                {children}
            </ButtonBase>

            {isCooldown ? (
                <Typography as="span">
                    {`You can try again in ${remaining} seconds`}
                </Typography>
            ) : null}
        </div>
    );
};
