import React from 'react';
import type { FormInputProps } from '@/client/components/molecules/Form/types';
import { Checkbox, InputLabel } from '@/client/components';
import { classNames } from '@/client/utils';

export type FormCheckboxProps = Readonly<{
    size?: 'sm' | 'md' | 'lg';
}> &
    FormInputProps;

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
    id,
    label,
    className,
    disabled,
    name,
    size = 'md'
}) => {
    return (
        <div
            className={classNames('w-full flex items-center gap-2', className)}
        >
            <Checkbox id={id} name={name} disabled={disabled} size={size} />
            <InputLabel
                htmlFor={id}
                text={label}
                disabled={disabled}
                className="cursor-pointer"
            />
        </div>
    );
};
