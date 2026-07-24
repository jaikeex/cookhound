'use client';

import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { Logo } from '@/client/components/atoms/Logo';
import { Typography } from '@/client/components/atoms/Typography';
import { eventBus, AppEvent } from '@/client/events';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { t } from '@/client/locales';

type NotFoundTemplateProps = Readonly<NonNullable<unknown>>;

export const NotFoundTemplate: React.FC<NotFoundTemplateProps> = () => {
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
        <div className="flex flex-col items-center pt-10 text-center">
            <Logo className="logo-md mb-8" />

            <Typography as="h1" variant="heading-lg" className="mb-4">
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
