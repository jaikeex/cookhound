import React from 'react';
import { ErrorList } from '@/client/components/molecules/Form/ErrorList';
import { Submit } from '@/client/components/molecules/Form/Submit';
import { TextInput } from '@/client/components/molecules/Form/TextInput';
import { Textarea } from '@/client/components/molecules/Form/Textarea';
import { Typography } from '@/client/components/atoms/Typography';
import { RadioSelect } from '@/client/components/molecules/Form/RadioSelect';
import { CookbookVisibility } from '@/common/types/cookbook';
import type { I18nMessage } from '@/client/locales';
import { classNames } from '@/client/utils';
import { t } from '@/client/locales';

export type CookbookFormErrors = {
    title?: I18nMessage;
    visibility?: I18nMessage;
    server?: I18nMessage;
};

export type CookbookFormProps = Readonly<{
    className?: string;
    errors: CookbookFormErrors;
    hideSubmit?: boolean;
    pending?: boolean;
}>;

export const CookbookForm: React.FC<CookbookFormProps> = ({
    className,
    errors,
    hideSubmit,
    pending
}) => {
    const errorsToDisplay = Object.entries(errors)
        .filter(([field]) => field !== 'server')
        .map(([, error]) => t(error));

    return (
        <div className={classNames('base-form', className)}>
            <TextInput
                id="cookbook-title"
                name="title"
                label={t('app.cookbook.title')}
                disabled={pending}
            />

            <Textarea
                id="cookbook-description"
                name="description"
                label={t('app.cookbook.description')}
                disabled={pending}
            />

            <RadioSelect
                label={t('app.cookbook.visibility')}
                name="visibility"
                disabled={pending}
                className="w-full"
                color="primary"
                column
                options={[
                    {
                        value: CookbookVisibility.PUBLIC,
                        label: t('app.cookbook.visibility.public'),
                        description: t(
                            'app.cookbook.visibility.public-description'
                        ),
                        defaultChecked: true
                    },
                    {
                        value: CookbookVisibility.UNLISTED,
                        label: t('app.cookbook.visibility.unlisted'),
                        description: t(
                            'app.cookbook.visibility.unlisted-description'
                        )
                    },
                    {
                        value: CookbookVisibility.PRIVATE,
                        label: t('app.cookbook.visibility.private'),
                        description: t(
                            'app.cookbook.visibility.private-description'
                        )
                    }
                ]}
            />

            <ErrorList errors={errorsToDisplay} className="self-start" />

            {!hideSubmit ? (
                <Submit
                    className="min-w-40 mt-6! mx-auto"
                    pending={pending}
                    label={t('app.cookbook.create')}
                />
            ) : null}

            {errors?.server ? (
                <Typography variant="error" align="center">
                    {t(errors.server)}
                </Typography>
            ) : null}
        </div>
    );
};
