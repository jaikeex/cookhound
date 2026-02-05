import React from 'react';
import { ButtonBase } from '@/client/components';

export type GoogleSigninProps = Readonly<{
    label: string | null;
    onClick: () => void;
    pending?: boolean;
}>;

export const GoogleSigninButton: React.FC<GoogleSigninProps> = ({
    label,
    onClick,
    pending
}) => {
    return (
        <ButtonBase
            onClick={onClick}
            icon="google"
            className="normal-case text-sm bg-white! border! border-gray-300! text-gray-800! hover:bg-gray-200!"
            textClassName="mr-2"
            textVariant="label"
            disabled={pending}
            aria-label={label ?? 'Sign in with Google'}
        >
            {label ?? 'Sign in with Google'}
        </ButtonBase>
    );
};
