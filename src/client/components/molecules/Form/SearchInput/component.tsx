'use client';

import React, { useCallback, useEffect, useState, type ReactNode } from 'react';
import { BaseInput, ButtonBase, InputLabel, Loader } from '@/client/components';
import type { FormInputProps } from '@/client/components/molecules/Form/types';
import { classNames } from '@/client/utils';
import { useLocale } from '@/client/store';

export type SearchInputProps = Readonly<{
    children?: ReactNode;
    isLoading?: boolean;
    label?: string;
    onBlur?: () => void;
    onFocus?: () => void;
    onSearch?: () => void;
    placeholder?: string;
    ref?: React.RefObject<HTMLDivElement | null>;
    value?: string;
}> &
    Omit<FormInputProps, 'type' | 'label' | 'children'>;

export const SearchInput: React.FC<SearchInputProps> = ({
    children,
    className,
    defaultValue,
    disabled,
    id,
    isLoading,
    label,
    name,
    onBlur,
    onChange,
    onFocus,
    onSearch,
    placeholder,
    ref,
    value
}) => {
    const { t } = useLocale();

    const [inputValue, setInputValue] = useState(value ?? defaultValue ?? '');

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setInputValue(e.target.value);
            onChange?.(e);
        },
        [onChange]
    );

    const handleSearch = useCallback(() => {
        onSearch?.();
    }, [onSearch]);

    const handleInputKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            } else if (e.key === 'Escape') {
                setInputValue('');
            }
        },
        [handleSearch]
    );

    useEffect(() => {
        setInputValue(value ?? '');
    }, [value]);

    return (
        <div className={classNames('relative w-full', className)} ref={ref}>
            {label && (
                <InputLabel htmlFor={id} text={label} disabled={disabled} />
            )}
            <div className="relative">
                <BaseInput
                    type={'search'}
                    placeholder={placeholder}
                    className="pr-[106px]"
                    id={id}
                    name={name}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    disabled={disabled}
                    autoComplete={'off'}
                    min={0}
                />
                <ButtonBase
                    color="secondary"
                    size="sm"
                    icon={isLoading ? undefined : 'search'}
                    onClick={handleSearch}
                    className="absolute w-24 transform -translate-y-1/2 right-1 top-1/2"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader /> : t('app.general.search')}
                </ButtonBase>
                {children}
            </div>
        </div>
    );
};
