import React from 'react';
import type { FormInputProps } from '@/client/components/molecules/Form/types';
import { Checkbox, InputLabel } from '@/client/components';
import classNames from 'classnames';

export type FormCheckboxProps = FormInputProps;

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
    id,
    label,
    className,
    disabled,
    name
}) => {
    return (
        <div
            className={classNames('w-full flex items-center gap-2', className)}
        >
            <Checkbox id={id} name={name} disabled={disabled} />
            <InputLabel
                htmlFor={id}
                text={label}
                disabled={disabled}
                className="cursor-pointer"
            />
        </div>
    );
};
