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
    editing,
    error,
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
                        className={classNames('min-w-24')}
                        color="secondary"
                        onClick={onEdit}
                        outlined
                        size="sm"
                    >
                        {loading ? <Loader /> : t('app.general.confirm')}
                    </ButtonBase>
                ) : (
                    <ButtonBase
                        className={classNames('min-w-24')}
                        color="subtle"
                        onClick={onEdit}
                        outlined
                        size="sm"
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
