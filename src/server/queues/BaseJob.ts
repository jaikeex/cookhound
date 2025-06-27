import type { Job, JobsOptions, Processor, QueueOptions } from 'bullmq';

/**
 * BaseJob is an abstract class that all concrete jobs MUST extend.
 */
export abstract class BaseJob<TData = any, TResult = any> {
    //~—————————————————————————————————————————————————————————————————————————————————————————~//
    //$                                         OPTIONS                                         $//
    ///
    //# These only take effect if the job that defines them is first in order to be registered
    //# inside its queue. This only matters for jobs that sharea the queue with another jobs, as
    //# setting these values there might be useless if another job has priority.
    ///
    //~—————————————————————————————————————————————————————————————————————————————————————————~//

    /**
     * Unique job type identifier.
     */
    public static jobName: string;

    /**
     * Queue identifier that this job should be added/processed on. All jobs of the
     * same queueName will share the underlying QueueScheduler instances.
     */
    public static queueName: string = 'default';

    /**
     * Number of concurrent processors for THIS job. If undefined the bullMQ defaults will be used.
     */
    public static concurrency?: number;

    /**
     * Override the default bullMQ job settings here
     */
    public static defaultJobOptions?: JobsOptions;

    /**
     * Extra queue-level options (e.g. to tweak `defaultJobOptions`, `limiter` etc.).
     * If multiple jobs share the same queue the first one that registers defines the
     * QueueOptions. Subsequent jobs must provide the same options or none at all.
     */
    public static queueOptions?: Omit<QueueOptions, 'connection' | 'name'>;

    //~-----------------------------------------------------------------------------------------~//
    //$                                         HANDLER                                         $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Every job MUST implement a processor that is executed by the worker.
     */
    public abstract handle(job: Job<TData>): Promise<TResult>;

    //~-----------------------------------------------------------------------------------------~//
    //$                                        DEFINITION                                       $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Exposes the metadata that QueueManager needs to register & run the job.
     */
    public getDefinition() {
        const ctor = this.constructor as typeof BaseJob;

        if (!ctor.jobName || !ctor.queueName) {
            throw new Error(
                `Job ${ctor.name} is missing static jobName / queueName declarations`
            );
        }

        const processor: Processor<TData, TResult> = async (job) =>
            this.handle(job);

        return {
            name: ctor.jobName,
            queueName: ctor.queueName,
            concurrency: ctor.concurrency,
            processor,
            defaultJobOptions: ctor.defaultJobOptions,
            queueOptions: ctor.queueOptions
        } as const;
    }
}
