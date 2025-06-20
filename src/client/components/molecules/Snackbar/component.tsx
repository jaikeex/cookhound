import React from 'react';
import { Icon, IconButton, Typography } from '@/client/components';
import type { IconName, SnackbarVariant } from '@/client/types';
import classnames from 'classnames';

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
    message: string;
    onClose: () => void;
    variant: SnackbarVariant;
}>;

export const Snackbar: React.FC<SnackbarProps> = ({
    message,
    onClose,
    variant
}) => {
    return (
        <div className="fixed left-0 right-0 z-[2000] pointer-events-none bottom-16 md:top-8">
            <div
                className={classnames(
                    'min-h-10 max-w-72 md:max-w-96 py-2.5 px-2 mx-auto rounded-md z-50 flex items-center gap-2',
                    'animate-fade-in pointer-events-auto',
                    config[variant].classnames
                )}
            >
                <Icon
                    name={config[variant].icon}
                    size={24}
                    className="flex-[15%]"
                />
                <Typography
                    variant="body-sm"
                    align="left"
                    className="flex-[77%] font-semibold"
                >
                    {message}
                </Typography>
                <IconButton
                    icon="close"
                    size={16}
                    className="flex-[8%] cursor-pointer"
                    onClick={onClose}
                />
            </div>
        </div>
    );
};
