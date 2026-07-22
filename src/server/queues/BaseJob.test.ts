import { describe, it, expect } from 'vitest';
import type { Job } from 'bullmq';
import { BaseJob } from './BaseJob';
import { RequestContext } from '@/server/utils/reqwest/context';

//|=============================================================================================|//
//$                                           FIXTURE                                           $//
//|=============================================================================================|//

// A concrete job whose handle() captures the ambient context it runs inside, so we can assert
// the worker choke point in getDefinition() wrapped it in a `worker`-tagged scope.
class ProbeJob extends BaseJob {
    static jobName = 'ProbeJob';
    static queueName = 'test';

    public captured: {
        origin: ReturnType<typeof RequestContext.getOrigin>;
        requestId: ReturnType<typeof RequestContext.getRequestId>;
    } | null = null;

    async handle(_job: Job): Promise<void> {
        this.captured = {
            origin: RequestContext.getOrigin(),
            requestId: RequestContext.getRequestId()
        };
    }
}

//|=============================================================================================|//
//$                                            TESTS                                            $//
//|=============================================================================================|//

describe('BaseJob worker context', () => {
    it('runs handle inside a worker-tagged context scope', async () => {
        const job = new ProbeJob();
        const { processor } = job.getDefinition();

        await processor({ id: '42', name: 'ProbeJob' } as Job, 'token');

        expect(job.captured?.origin).toBe('worker');
        expect(job.captured?.requestId).toBe('job:ProbeJob#42');
    });

    it('falls back to a generated correlation id when job.id is missing', async () => {
        const job = new ProbeJob();
        const { processor } = job.getDefinition();

        await processor({ name: 'ProbeJob' } as Job, 'token');

        expect(job.captured?.origin).toBe('worker');
        expect(String(job.captured?.requestId)).toMatch(/^job:ProbeJob#/);
    });

    it('does not leak context after the job completes', async () => {
        const job = new ProbeJob();
        const { processor } = job.getDefinition();

        await processor({ id: '7', name: 'ProbeJob' } as Job, 'token');

        // Outside the scope the ambient store is empty again.
        expect(RequestContext.getOrigin()).toBeNull();
        expect(RequestContext.getRequestId()).toBeNull();
    });
});
