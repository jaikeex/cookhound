'use client';

import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
    useMemo
} from 'react';
import { BaseInput, Icon, InputError, InputLabel } from '@/client/components';
import type { FormInputProps } from '@/client/components/molecules/Form/types';
import { classNames } from '@/client/utils';
import { useLocale } from '@/client/store';

//~---------------------------------------------------------------------------------------------~//
//$                                           TYPES                                             $//
//~---------------------------------------------------------------------------------------------~//

export type ComboInputOption = Readonly<{
    value: string;
    label: string;
}>;

export type ComboInputProps = Readonly<{
    options: ReadonlyArray<ComboInputOption>;
    placeholder?: string;
    defaultValue?: string;
    noResultsMessage?: string;
    /** Called on every keystroke */
    onChange?: (value: string) => void;
    onSelect?: (option: ComboInputOption) => void;
    resetValueOnSelect?: boolean;
}> &
    Omit<FormInputProps, 'defaultValue' | 'onChange'>;

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export const ComboInput: React.FC<ComboInputProps> = ({
    className,
    defaultValue = '',
    disabled,
    error,
    id,
    label,
    name,
    noResultsMessage,
    onChange,
    onSelect,
    options,
    placeholder,
    resetValueOnSelect,
    ...props
}) => {
    const { t } = useLocale();

    const [inputValue, setInputValue] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const filteredOptions = useMemo(
        () =>
            options.filter((option) =>
                option.label.toLowerCase().includes(inputValue.toLowerCase())
            ),
        [inputValue, options]
    );

    //|-----------------------------------------------------------------------------------------|//
    //?                                    CLICK OUTSIDE                                        ?//
    //|-----------------------------------------------------------------------------------------|//

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    //|-----------------------------------------------------------------------------------------|//
    //?                             SCROLL HIGHLIGHTED ITEM INTO VIEW                           ?//
    //|-----------------------------------------------------------------------------------------|//

    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const item = listRef.current.children[highlightedIndex] as
                | HTMLElement
                | undefined;

            item?.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightedIndex]);

    //|-----------------------------------------------------------------------------------------|//
    //?                                      HANDLERS                                           ?//
    //|-----------------------------------------------------------------------------------------|//

    const selectOption = useCallback(
        (option: ComboInputOption) => {
            setInputValue(resetValueOnSelect ? '' : option.label);
            setIsOpen(false);
            setHighlightedIndex(-1);
            onSelect?.(option);
        },
        [onSelect, resetValueOnSelect]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;

            setInputValue(value);
            setIsOpen(true);
            setHighlightedIndex(-1);
            onChange?.(value);
        },
        [onChange]
    );

    const handleFocus = useCallback(() => {
        if (filteredOptions.length > 0 || inputValue.length > 0) {
            setIsOpen(true);
        }
    }, [filteredOptions.length, inputValue.length]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (!isOpen) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setIsOpen(true);
                    setHighlightedIndex(0);
                }
                return;
            }

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setHighlightedIndex((prev) =>
                        prev < filteredOptions.length - 1 ? prev + 1 : prev
                    );
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                    break;

                case 'Enter':
                    e.preventDefault();
                    if (
                        highlightedIndex >= 0 &&
                        filteredOptions[highlightedIndex]
                    ) {
                        selectOption(filteredOptions[highlightedIndex]);
                    }
                    break;

                case 'Escape':
                    setIsOpen(false);
                    setHighlightedIndex(-1);
                    break;

                case 'Tab':
                    setIsOpen(false);
                    setHighlightedIndex(-1);
                    break;

                default:
                    break;
            }
        },
        [isOpen, filteredOptions, highlightedIndex, selectOption]
    );

    /**
     * Using dataset index here replaces my usual curry fn approach in this case.
     * I acutally just learned about this and had to use it. Normally I would create
     * a curried definition for every single list item. That would create new closure
     * for every option, which is avoided by simply targeting the event target using
     * the dataset index field.
     */
    const handleOptionMouseDown = useCallback(
        (e: React.MouseEvent<HTMLLIElement>) => {
            e.preventDefault();

            const index = Number(e.currentTarget.dataset.index);
            const option = filteredOptions[index];

            if (option) {
                selectOption(option);
            }
        },
        [filteredOptions, selectOption]
    );

    const handleOptionMouseEnter = useCallback(
        (e: React.MouseEvent<HTMLLIElement>) => {
            setHighlightedIndex(Number(e.currentTarget.dataset.index));
        },
        []
    );

    //|-----------------------------------------------------------------------------------------|//
    //?                                          RENDER                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    const showDropdown = isOpen && filteredOptions.length > 0 && !disabled;

    const showNoResults =
        isOpen &&
        inputValue.length > 0 &&
        filteredOptions.length === 0 &&
        !disabled;

    return (
        <div
            ref={containerRef}
            className={classNames('relative w-full', className)}
        >
            {label ? (
                <InputLabel htmlFor={id} text={label} disabled={disabled} />
            ) : null}

            <div className="relative">
                <BaseInput
                    {...props}
                    type="text"
                    id={id}
                    name={name}
                    value={inputValue}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete="off"
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    className="pr-8"
                    role="combobox"
                    aria-expanded={showDropdown || showNoResults}
                    aria-controls={`${id}-listbox`}
                    aria-autocomplete="list"
                    aria-activedescendant={
                        highlightedIndex >= 0
                            ? `${id}-option-${highlightedIndex}`
                            : undefined
                    }
                />

                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                    <Icon
                        name="chevronDown"
                        size={16}
                        className={classNames(
                            'text-gray-500 dark:text-gray-400 transition-transform duration-200',
                            showDropdown ? 'rotate-90' : ''
                        )}
                    />
                </div>
            </div>

            {showDropdown ? (
                <ul
                    ref={listRef}
                    id={`${id}-listbox`}
                    role="listbox"
                    aria-label={label ? String(label) : name}
                    className={classNames(
                        'absolute z-50 mt-1 w-full overflow-y-auto',
                        'max-h-60 rounded-md shadow-lg',
                        'bg-gray-200 dark:bg-slate-950',
                        'border border-slate-600 dark:border-gray-300'
                    )}
                >
                    {filteredOptions.map((option, index) => (
                        <li
                            key={option.value}
                            id={`${id}-option-${index}`}
                            aria-selected={false}
                            role="option"
                            data-index={index}
                            onMouseDown={handleOptionMouseDown}
                            onMouseEnter={handleOptionMouseEnter}
                            className={classNames(
                                'cursor-pointer px-3 py-2 text-sm',
                                'text-gray-800 dark:text-gray-100',
                                'transition-colors duration-75',
                                index === highlightedIndex
                                    ? 'bg-blue-300 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300'
                                    : 'hover:bg-gray-300 dark:hover:bg-slate-800'
                            )}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            ) : null}

            {showNoResults ? (
                <div
                    role="status"
                    aria-live="polite"
                    className={classNames(
                        'absolute z-50 mt-1 w-full rounded-md shadow-lg',
                        'bg-gray-200 dark:bg-slate-950',
                        'border border-slate-600 dark:border-gray-300',
                        'px-3 py-2 text-sm',
                        'text-gray-500 dark:text-gray-400'
                    )}
                >
                    {noResultsMessage ?? t('app.general.no-results')}
                </div>
            ) : null}

            {error ? <InputError message={error} /> : null}
        </div>
    );
};
