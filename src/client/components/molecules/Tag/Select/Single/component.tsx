import { Checkbox, Typography } from '@/client/components';
import { classNames } from '@/client/utils';
import React from 'react';

type TagSelectProps = Readonly<{
    name: string;
    className?: string;
    disabled?: boolean;
    isChecked?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}>;

export const TagSelect: React.FC<TagSelectProps> = ({
    name,
    disabled,
    className,
    isChecked,
    onChange
}) => {
    return (
        <div
            className={classNames('w-full flex items-center gap-2', className)}
        >
            <Checkbox
                id={name}
                name={name}
                disabled={disabled}
                size={'sm'}
                color="secondary"
                checked={isChecked}
                onChange={onChange}
            />

            <label
                htmlFor={name}
                className={`${disabled ? 'text-gray-600 dark:text-gray-400' : 'cursor-pointer'}`}
            >
                <Typography variant="body">{name}</Typography>
            </label>
        </div>
    );
};
