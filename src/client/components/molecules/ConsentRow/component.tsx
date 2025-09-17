'use client';

import React from 'react';
import { Typography, Chip, Switch } from '@/client/components';
import { useLocale } from '@/client/store';
import { useScreenSize } from '@/client/hooks';

type ConsentRowProps =
    | Readonly<{
          allwaysOn: true;
          description: string;
          status: string;
          title: string;
      }>
    | Readonly<{
          allwaysOn: false;
          checked: boolean;
          description: string;
          onChange: React.ChangeEventHandler<HTMLInputElement>;
          status: string;
          title: string;
      }>;

export const ConsentRow: React.FC<ConsentRowProps> = (props) => {
    const { allwaysOn, description, title, status } = props;
    const { t } = useLocale();
    const { isMobile } = useScreenSize();

    const rightSideContent = allwaysOn ? (
        <Chip color="secondary" size="lg" className="max-h-6">
            <Typography
                variant={isMobile ? 'body-sm' : 'label'}
                className="whitespace-nowrap"
            >
                {t('app.cookies.modal.allways-on')}
            </Typography>
        </Chip>
    ) : (
        <Switch checked={props.checked} onChange={props.onChange} />
    );

    return (
        <div className="flex gap-8 justify-between items-center">
            <div>
                <Typography variant="label">{title}</Typography>
                <Typography
                    variant="body-xs"
                    className="text-gray-800 dark:text-gray-400"
                >
                    {description}
                </Typography>
                <Typography
                    variant="body-xs"
                    className="mt-1 text-gray-700  dark:text-gray-500"
                >
                    {status}
                </Typography>
            </div>
            {rightSideContent}
        </div>
    );
};
