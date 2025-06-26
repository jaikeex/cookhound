'use client';

import React from 'react';
import { Typography, ButtonBase, Loader } from '@/client/components';
import { classNames } from '@/client/utils';
import { useLocale } from '@/client/store';

type ShoppingListHeadProps = Readonly<{
    editing?: boolean;
    error?: Error;
    loading?: boolean;
    onEdit?: () => void;
}>;

export const ShoppingListHead: React.FC<ShoppingListHeadProps> = ({
    error,
    editing,
    loading,
    onEdit
}) => {
    const { t } = useLocale();

    return (
        <React.Fragment>
            <div className="flex items-center justify-between">
                <Typography variant="heading-md">Nákupní seznam</Typography>

                {editing ? (
                    <ButtonBase
                        color="secondary"
                        outlined
                        size="sm"
                        className={classNames('min-w-24')}
                        onClick={onEdit}
                    >
                        {loading ? <Loader /> : t('app.general.confirm')}
                    </ButtonBase>
                ) : (
                    <ButtonBase
                        color="subtle"
                        outlined
                        size="sm"
                        className={classNames('min-w-24')}
                        onClick={onEdit}
                    >
                        {loading ? <Loader size="xs" /> : t('app.general.edit')}
                    </ButtonBase>
                )}
            </div>
            {error ? (
                <Typography
                    variant="error"
                    className="mt-4 text-center text-red-500"
                >
                    {error.message}
                </Typography>
            ) : null}
        </React.Fragment>
    );
};
