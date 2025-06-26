import React from 'react';
import { InputError, InputLabel } from '@/client/components';
import type { FormInputProps } from '@/client/components/molecules/Form/types';
import { classNames } from '@/client/utils';
import { BaseTextarea } from '@/client/components/atoms/Input/BaseTextarea/component';

export type TextareaProps = Readonly<{
    onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
}> &
    FormInputProps;

export const Textarea: React.FC<TextareaProps> = ({
    className,
    disabled,
    error,
    id,
    label,
    name,
    onChange,
    onKeyDown,
    placeholder
}) => {
    return (
        <div className={classNames('w-full relative', className)}>
            <InputLabel htmlFor={id} text={label} disabled={disabled} />
            <BaseTextarea
                placeholder={placeholder}
                className={className}
                id={id}
                name={name}
                onChange={onChange}
                onKeyDown={onKeyDown}
                disabled={disabled}
                autoComplete={name}
            />
            {error ? <InputError message={error} /> : null}
        </div>
    );
};
