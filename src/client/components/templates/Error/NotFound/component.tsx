'use client';

import { ButtonBase, Logo, Typography } from '@/client/components';
import { eventBus, AppEvent } from '@/client/events';
import { useLocale } from '@/client/store';
import * as React from 'react';
import { useCallback, useEffect } from 'react';

type NotFoundTemplateProps = Readonly<NonNullable<unknown>>;

export const NotFoundTemplate: React.FC<NotFoundTemplateProps> = () => {
    const { t } = useLocale();

    const handleNavigateHome = useCallback(() => {
        window.location.href = '/';
    }, []);

    useEffect(() => {
        eventBus.emit(AppEvent.NOT_FOUND_OPENED, undefined);

        return () => {
            eventBus.emit(AppEvent.NOT_FOUND_CLOSED, undefined);
        };
    }, []);

    return (
        <div className="flex flex-col items-center min-h-screen pt-10 text-center">
            <Logo className="logo-md mb-8" />

            <Typography variant="heading-lg" className="mb-4">
                {t('app.error.not-found')}
            </Typography>
            <Typography
                variant="body"
                className="mb-6 text-gray-700 dark:text-gray-300"
            >
                {t('app.error.not-found.description')}
            </Typography>
            <ButtonBase
                className="mx-auto w-52"
                color="primary"
                onClick={handleNavigateHome}
            >
                {t('app.general.home')}
            </ButtonBase>
        </div>
    );
};
