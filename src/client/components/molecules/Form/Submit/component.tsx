import React from 'react';
import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { Loader } from '@/client/components/atoms/Loader';

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
    pending,
    ...props
}) => {
    return (
        <ButtonBase
            {...props}
            color="primary"
            className={className}
            disabled={disabled || pending}
            type={disabled ? 'button' : 'submit'}
        >
            {pending ? <Loader size="sm" /> : label}
        </ButtonBase>
    );
};
