import type { UseMutationOptions } from '@tanstack/react-query';
import type { ContentReportDTO, ReportPayload } from '@/common/types';
import type { RequestError } from '@/client/error';

//~---------------------------------------------------------------------------------------------~//
//$                                            KEYS                                             $//
//~---------------------------------------------------------------------------------------------~//

const REPORT_NAMESPACE_QUERY_KEY = 'report';

export const REPORT_QUERY_KEYS = Object.freeze({
    namespace: REPORT_NAMESPACE_QUERY_KEY
});

//~---------------------------------------------------------------------------------------------~//
//$                                          TYPES                                              $//
//~---------------------------------------------------------------------------------------------~//

export type SubmitReportOptions = Omit<
    UseMutationOptions<ContentReportDTO, RequestError, ReportPayload>,
    'mutationFn'
>;
