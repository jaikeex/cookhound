import { useAppMutation } from '@/client/data/queryFactories';
import { useRepositories } from '@/client/data';
import type { SubmitReportOptions } from './keys';

export const reportQueryClient = {
    /**
     * Files a content report.
     */
    useSubmitReport: (options?: Partial<SubmitReportOptions>) => {
        const { reportRepository } = useRepositories();

        return useAppMutation(reportRepository.submit, options);
    }
};
