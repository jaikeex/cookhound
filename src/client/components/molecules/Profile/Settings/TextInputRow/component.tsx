'use client';

import { ButtonBase, Loader, TextInput, Typography } from '@/client/components';
import { useLocale } from '@/client/store';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

type TextInputRowProps = Readonly<{
    className?: string;
    heading: string;
    defaultValue: string;
    isPending: boolean;
    onSave: (value: string) => Promise<void>;
    name: string;
    inputId: string;
}>;

export const TextInputRow: React.FC<TextInputRowProps> = ({
    className,
    heading,
    defaultValue,
    isPending,
    onSave,
    name,
    inputId
}) => {
    const { t } = useLocale();

    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(defaultValue);

    const startEditing = useCallback(() => {
        setIsEditing(true);
    }, []);

    const stopEditing = useCallback(() => {
        setValue(defaultValue);
        setIsEditing(false);
    }, [defaultValue]);

    const handleValueChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.value);
        },
        []
    );

    const handleSave = useCallback(async () => {
        await onSave?.(value);

        stopEditing();
    }, [onSave, stopEditing, value]);

    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    return (
        <div className={className}>
            <Typography variant="heading-xs" className="font-semibold">
                {heading}
            </Typography>
            <div className="flex items-center justify-between mt-2 gap-4">
                {isEditing ? (
                    <TextInput
                        defaultValue={value}
                        onChange={handleValueChange}
                        id={inputId}
                        name={name}
                        className="max-w-96 h-8"
                    />
                ) : (
                    <Typography variant="body-sm">{defaultValue}</Typography>
                )}
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <ButtonBase
                            size="sm"
                            disabled={isPending}
                            className="min-w-24 h-8"
                            color="subtle"
                            icon={'cancel'}
                            outlined
                            onClick={stopEditing}
                        >
                            {t('app.general.cancel')}
                        </ButtonBase>
                    ) : null}
                    <ButtonBase
                        size="sm"
                        disabled={isPending}
                        className="min-w-24 h-8"
                        color={isEditing ? 'secondary' : 'subtle'}
                        outlined
                        onClick={isEditing ? handleSave : startEditing}
                    >
                        {isPending ? (
                            <Loader size="sm" className="w-4 h-4" />
                        ) : isEditing ? (
                            t('app.general.save')
                        ) : (
                            t('app.general.change')
                        )}
                    </ButtonBase>
                </div>
            </div>
        </div>
    );
};
