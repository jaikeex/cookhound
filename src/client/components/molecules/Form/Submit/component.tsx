import React from 'react';
import { ButtonBase, Loader } from '@/client/components';

export type SubmitProps = Readonly<{
    className?: string;
    disabled?: boolean;
    label: string;
    pending?: boolean;
}>;

export const Submit: React.FC<SubmitProps> = ({
    className,
    disabled,
    label,
    pending
}) => {
    return (
        <ButtonBase
            color="primary"
            className={className}
            disabled={disabled || pending}
            type={disabled ? 'button' : 'submit'}
        >
            {pending ? <Loader size="sm" /> : label}
        </ButtonBase>
    );
};
