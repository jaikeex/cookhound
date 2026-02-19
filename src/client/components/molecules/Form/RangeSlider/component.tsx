'use client';

import React, { useCallback, useState } from 'react';
import { InputLabel, NumberInput } from '@/client/components';
import type { FormInputProps } from '@/client/components/molecules/Form/types';
import { classNames } from '@/client/utils';

export type RangeSliderProps = Readonly<{
    min: number;
    max: number;
    defaultMin?: number;
    defaultMax?: number;
    step?: number;
    allowDecimals?: boolean;
    minLabel?: string;
    maxLabel?: string;
    onChange?: (min: number, max: number) => void;
}> &
    Pick<FormInputProps, 'className' | 'disabled' | 'id' | 'label' | 'name'>;

export const RangeSlider: React.FC<RangeSliderProps> = ({
    min,
    max,
    defaultMin,
    defaultMax,
    step = 1,
    allowDecimals = false,
    minLabel = 'Min',
    maxLabel = 'Max',
    onChange,
    className,
    disabled = false,
    id,
    label,
    name
}) => {
    const [minValue, setMinValue] = useState<number>(defaultMin ?? min);
    const [maxValue, setMaxValue] = useState<number>(defaultMax ?? max);

    const [minInputText, setMinInputText] = useState<string>(
        String(defaultMin ?? min)
    );
    const [maxInputText, setMaxInputText] = useState<string>(
        String(defaultMax ?? max)
    );

    const minPercent = ((minValue - min) / (max - min)) * 100;
    const maxPercent = ((maxValue - min) / (max - min)) * 100;

    const handleMinSlider = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = Number(e.target.value);
            const clamped = Math.min(value, maxValue);

            setMinValue(clamped);
            setMinInputText(String(clamped));
            onChange?.(clamped, maxValue);
        },
        [maxValue, onChange]
    );

    const handleMaxSlider = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = Number(e.target.value);
            const clamped = Math.max(value, minValue);

            setMaxValue(clamped);
            setMaxInputText(String(clamped));
            onChange?.(minValue, clamped);
        },
        [minValue, onChange]
    );

    const parseInputValue = useCallback(
        (raw: string): number => {
            if (!allowDecimals) {
                return Math.round(Number(raw.replace(/[^0-9]/g, '')));
            }

            return Number(raw);
        },
        [allowDecimals]
    );

    //———————————————————————————————————————————————————————————————————————————————————————————//
    //                                      STALE CLOSURES                                       //
    //
    // I spent a good deal of time debugging this problem so putting an explanation here
    // for future me seems a good idea. (also should study closures in react more...)
    //
    // Originally the commit functions did not accept an argument, but read the min/max value
    // directly from the state. This introduced a problem in which the commited value was
    // always one step behind the user input (e.g. if the user wanted to write 10, the commit fn
    // was working with 1).
    // The problem is that in react, each render saves a snapshot of all current state values.
    // Functions created during that render close over that snapshot.
    // The setState action however does not modify this snapshot in place, but schedules
    // a new render and updates the state in THAT new render, not sooner. If the commit function
    // is called a line below the setState call, i.e. from the current render before the
    // state-changing render, it will still hold the old state values.
    //
    //———————————————————————————————————————————————————————————————————————————————————————————//

    const commitMinInput = useCallback(
        (text?: string) => {
            const raw = parseInputValue(text ?? minInputText);
            const clamped = Math.max(min, Math.min(raw, maxValue));

            setMinValue(clamped);
            setMinInputText(String(clamped));
            onChange?.(clamped, maxValue);
        },
        [min, maxValue, minInputText, onChange, parseInputValue]
    );

    const commitMaxInput = useCallback(
        (text?: string) => {
            const raw = parseInputValue(text ?? maxInputText);
            const clamped = Math.min(max, Math.max(raw, minValue));

            setMaxValue(clamped);
            setMaxInputText(String(clamped));
            onChange?.(minValue, clamped);
        },
        [max, minValue, maxInputText, onChange, parseInputValue]
    );

    const handleMinInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setMinInputText(value);

            if (Number(value) <= maxValue) {
                commitMinInput(value);
            }
        },
        [commitMinInput, maxValue]
    );

    const handleMaxInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setMaxInputText(value);

            if (Number(value) >= minValue) {
                commitMaxInput(value);
            }
        },
        [commitMaxInput, minValue]
    );

    const handleMinBlur = useCallback(() => {
        commitMinInput(minInputText);
    }, [commitMinInput, minInputText]);

    const handleMaxBlur = useCallback(() => {
        commitMaxInput(maxInputText);
    }, [commitMaxInput, maxInputText]);

    return (
        <div className={classNames('relative w-full', className)}>
            {label ? (
                <InputLabel htmlFor={id} text={label} disabled={disabled} />
            ) : null}

            <div className="relative mt-2 h-6 flex items-center">
                {/* This is the slider track itself */}
                <div className="absolute inset-x-0 h-1.5 rounded-full bg-gray-300 dark:bg-slate-700" />

                {/* Fills the active range with color */}
                <div
                    className="absolute h-1.5 rounded-full bg-blue-700 dark:bg-blue-400"
                    style={{
                        left: `${minPercent}%`,
                        right: `${100 - maxPercent}%`
                    }}
                />

                {/* Thumbs */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={minValue}
                    onChange={handleMinSlider}
                    disabled={disabled}
                    aria-label={minLabel}
                    className="range-slider-thumb range-slider-track absolute inset-x-0 z-5"
                />

                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={maxValue}
                    onChange={handleMaxSlider}
                    disabled={disabled}
                    aria-label={maxLabel}
                    // The z-index here makes it always display over the min value thumb, do not lower it
                    className="range-slider-thumb range-slider-track absolute inset-x-0 z-8"
                />
            </div>

            <div className="mt-2 flex gap-3">
                <div className="relative w-full">
                    <NumberInput
                        id={`${id}-min`}
                        name={`${name}-min`}
                        value={minInputText}
                        onChange={handleMinInput}
                        onBlur={handleMinBlur}
                        disabled={disabled}
                        min={min}
                        max={maxValue}
                        hideArrows
                    />
                </div>

                <div className="relative w-full">
                    <NumberInput
                        id={`${id}-max`}
                        name={`${name}-max`}
                        value={maxInputText}
                        onChange={handleMaxInput}
                        onBlur={handleMaxBlur}
                        disabled={disabled}
                        min={minValue}
                        max={max}
                        hideArrows
                    />
                </div>
            </div>
        </div>
    );
};
