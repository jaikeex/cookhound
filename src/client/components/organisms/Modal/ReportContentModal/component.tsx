'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { ErrorList } from '@/client/components/molecules/Form/ErrorList';
import { Submit } from '@/client/components/molecules/Form/Submit';
import { Select } from '@/client/components/molecules/Form/Select';
import { Textarea } from '@/client/components/molecules/Form/Textarea';
import { FormCheckbox } from '@/client/components/molecules/Form/FormCheckbox';
import { Typography } from '@/client/components/atoms/Typography';
import { useSnackbar } from '@/client/store';
import { chqc } from '@/client/data';
import type { ModalProps } from '@/client/components/organisms/Modal/types';
import {
    ReportReason,
    type ReportTargetType,
    ApplicationErrorCode
} from '@/common/constants';
import { REPORT_REASON_LABEL_KEY, REPORT_REASON_ORDER } from '@/client/utils';
import { t } from '@/client/locales';

//~---------------------------------------------------------------------------------------------~//
//$                                          CONSTANTS                                          $//
//~---------------------------------------------------------------------------------------------~//

/** When "Other" is picked the reporter must explain */
const OTHER_DETAILS_MIN_LEN = 10;
const DETAILS_MAX_LEN = 2000;

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export type ReportContentModalProps = Readonly<{
    targetType: ReportTargetType;
    targetId: number;
    targetLabel: string;
}> &
    ModalProps;

export const ReportContentModal: React.FC<ReportContentModalProps> = ({
    targetType,
    targetId,
    targetLabel,
    close
}) => {
    const { alert } = useSnackbar();

    const [reason, setReason] = useState<ReportReason | ''>('');
    const [details, setDetails] = useState('');
    const [goodFaith, setGoodFaith] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);

    const reasonOptions = useMemo(
        () =>
            REPORT_REASON_ORDER.map((value) => ({
                value,
                label: t(REPORT_REASON_LABEL_KEY[value])
            })),
        []
    );

    const { mutate: submitReport, isPending } = chqc.report.useSubmitReport({
        meta: { errorMessage: false },
        onSuccess: () => {
            alert({
                message: t('report.modal.success'),
                variant: 'success'
            });

            close();
        },
        onError: (error) => {
            if (error.code === ApplicationErrorCode.REPORT_ALREADY_PENDING) {
                setServerError(t('report.error.already-reported'));
            } else if (
                error.code === ApplicationErrorCode.REPORT_TARGET_NOT_FOUND
            ) {
                setServerError(t('report.error.target-not-found'));
            } else if (
                error.code === ApplicationErrorCode.REPORT_SELF_NOT_ALLOWED
            ) {
                setServerError(t('report.error.self-report'));
            } else {
                setServerError(t('report.modal.error.default'));
            }
        }
    });

    const handleReasonChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            setReason(event.target.value as ReportReason);
        },
        []
    );

    const handleDetailsChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setDetails(event.target.value);
        },
        []
    );

    const handleGoodFaithChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setGoodFaith(event.target.checked);
        },
        []
    );

    const handleSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setValidationError(null);
            setServerError(null);

            if (!reason) {
                setValidationError(t('report.modal.error.reason-required'));
                return;
            }

            const trimmedDetails = details.trim();

            if (
                reason === ReportReason.OTHER &&
                trimmedDetails.length < OTHER_DETAILS_MIN_LEN
            ) {
                setValidationError(t('report.modal.error.details-required'));
                return;
            }

            if (!goodFaith) {
                setValidationError(t('report.modal.error.good-faith-required'));
                return;
            }

            submitReport({
                targetType,
                targetId,
                reason,
                details: trimmedDetails || undefined
            });
        },
        [reason, details, goodFaith, submitReport, targetType, targetId]
    );

    const errorsToDisplay = [validationError, serverError].filter(
        (entry): entry is string => Boolean(entry)
    );

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full max-w-[80dvw] md:max-w-xl px-2 md:px-4"
        >
            <Typography as="h2" variant="heading-sm" className="mb-2">
                {t('report.modal.title')}
            </Typography>

            <Typography
                variant="body-sm"
                className="mb-4 text-gray-700 dark:text-gray-300"
            >
                {t('report.modal.body', { target: targetLabel })}
            </Typography>

            <Select
                id="report-reason"
                name="reason"
                label={t('report.modal.reason-label')}
                placeholder={t('report.modal.reason-placeholder')}
                options={reasonOptions}
                disabled={isPending}
                onChange={handleReasonChange}
            />

            <div className="mt-4">
                <Textarea
                    id="report-details"
                    name="details"
                    label={t('report.modal.details-label')}
                    placeholder={t('report.modal.details-placeholder')}
                    rows={5}
                    maxLength={DETAILS_MAX_LEN}
                    disabled={isPending}
                    onChange={handleDetailsChange}
                />

                <Typography
                    variant="body-sm"
                    className="mt-1 text-right text-gray-500 dark:text-gray-400"
                >
                    {details.length} / {DETAILS_MAX_LEN}
                </Typography>
            </div>

            <FormCheckbox
                id="report-good-faith"
                name="goodFaith"
                className="mt-2"
                label={t('report.modal.good-faith')}
                disabled={isPending}
                onChange={handleGoodFaithChange}
            />

            <ErrorList className="self-start mt-3" errors={errorsToDisplay} />

            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
                <ButtonBase
                    color="subtle"
                    outlined
                    onClick={close}
                    className="w-full"
                    disabled={isPending}
                >
                    {t('app.general.cancel')}
                </ButtonBase>

                <Submit
                    label={t('report.modal.submit')}
                    pending={isPending}
                    className="w-full"
                />
            </div>
        </form>
    );
};
