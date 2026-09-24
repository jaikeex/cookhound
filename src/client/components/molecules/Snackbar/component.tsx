import React from 'react';
import Link from 'next/link';
import { Icon } from '@/client/components/atoms/Icons';
import { IconButton } from '@/client/components/atoms/Button/Icon';
import { Typography } from '@/client/components/atoms/Typography';
import type { AlertAction, IconName, SnackbarVariant } from '@/client/types';
import { classNames } from '@/client/utils';

const config: Record<SnackbarVariant, VariantConfig> = {
    success: {
        classnames:
            'bg-success-500 dark:bg-success-700 text-black fill-black dark:text-white dark:fill-white',
        icon: 'checkmark'
    },
    error: {
        classnames: 'bg-danger-600 dark:bg-danger-500 text-white fill-white',
        icon: 'error'
    },
    info: {
        classnames:
            'bg-gray-700 dark:bg-gray-200 text-white fill-white dark:text-black dark:fill-black',
        icon: 'info'
    }
};

type VariantConfig = {
    classnames: string;
    icon: IconName;
};

type SnackbarProps = Readonly<{
    action?: AlertAction;
    message: string;
    onClose: () => void;
    variant: SnackbarVariant;
}>;

export const Snackbar: React.FC<SnackbarProps> = ({
    action,
    message,
    onClose,
    variant
}) => {
    return (
        <div className="pointer-events-none">
            <div
                className={classNames(
                    'min-h-10 max-w-72 md:max-w-96 py-2.5 px-2 mx-auto rounded-md z-50 flex items-center gap-2',
                    'animate-fade-in pointer-events-auto',
                    config[variant].classnames
                )}
            >
                <Icon
                    name={config[variant].icon}
                    size={24}
                    className="flex-[15%]"
                    inheritColor
                />
                <Typography
                    variant="body-sm"
                    align="left"
                    className="flex-[77%] font-semibold"
                >
                    {message}
                </Typography>
                {action ? (
                    <Link
                        href={action.href}
                        onClick={onClose}
                        className="shrink-0 px-1 text-sm font-bold text-inherit underline underline-offset-2 hover:opacity-80"
                    >
                        {action.label}
                    </Link>
                ) : null}
                <IconButton
                    icon="close"
                    size={16}
                    className="flex-[8%] cursor-pointer hover:bg-current/15!"
                    inheritIconColor
                    onClick={onClose}
                />
            </div>
        </div>
    );
};
