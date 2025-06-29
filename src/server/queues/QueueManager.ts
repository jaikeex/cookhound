import { Queue, Worker, QueueEvents } from 'bullmq';
import type { JobsOptions, Job, Processor, QueueOptions } from 'bullmq';
import IORedis from 'ioredis';
import { Logger } from '@/server/logger';
import { ENV_CONFIG_PRIVATE } from '@/common/constants';
import { ServerError } from '@/server/error';

//~=============================================================================================~//
//$                                            TYPES                                            $//
//~=============================================================================================~//

export interface JobDefinition<TData = any, TResult = any> {
    // This is the primary 'key' by which the jobs are added from the code.
    // ALWAYS use the constant objects for this at all places.
    name: string;
    queueName: string;
    concurrency?: number;
    processor: Processor<TData, TResult>;
    defaultJobOptions?: JobsOptions;
    queueOptions?: Omit<QueueOptions, 'connection' | 'name'>;
}

export type CronJobConfig<TData = any> = Readonly<{
    name: string;
    queueName: string;
    cron: string;
    data?: TData;
    timezone?: string;
    enabled?: boolean;
    jobOptions?: JobsOptions;
}>;

//|=============================================================================================|//

const log = Logger.getInstance('queue-manager');

//~=============================================================================================~//
//$                                            CLASS                                            $//
//~=============================================================================================~//

/**
 * This is the central point of all queue processing. Everything happens here.
 */
export class QueueManager {
    private redis?: IORedis;

    /**
     *§ This is important. Always default this to false.
     * It is used by the queue methods to determine whether a worker should be
     * created while initializing the queue. That should NEVER happen from the app
     * context. In order to enforce this, it is disabled here and available as an
     * argument in the initialize method, so that the appropriate process can initalize
     * the manager with worker creating capabilties.
     */
    private isWorkerProcess = false;

    private readonly queues: Map<string, Queue> = new Map();
    private readonly workers: Map<string, Worker> = new Map();

    private readonly jobDefinitions: Map<string, JobDefinition> = new Map();

    private isInitialized = false;

    //~-----------------------------------------------------------------------------------------~//
    //$                                       INITIALIZE                                        $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Establishes a Redis connection and prepares the QueueManager for use.
     *
     * In the dedicated worker runtime this should be called with 'true' so that
     * workers are spawned. In the application/runtime context it MUST stay
     * 'false' to avoid creating duplicate workers that would just process the same
     * jobs twice.
     *
     * @param isWorkerProcess - When 'true', also instantiate workers for the
     *   registered queues. Defaults to 'false'.
     */
    public async initialize(isWorkerProcess: boolean = false): Promise<void> {
        if (this.isInitialized) {
            log.warn('initialize - QueueManager already initialized');
            return;
        }

        //———————————————————————————————————————————————————————————————————————————————————————————//
        //                                   NEW REDIS CONNECTION                                    //
        //
        // Using dedicated redis connection here is important to avoid dipping into the app's
        // connection pool.
        //
        //———————————————————————————————————————————————————————————————————————————————————————————//

        const redisHost = ENV_CONFIG_PRIVATE.REDIS_HOST;
        const redisPort = Number(ENV_CONFIG_PRIVATE.REDIS_PORT);

        this.redis = new IORedis({
            host: redisHost,
            port: redisPort,
            password: ENV_CONFIG_PRIVATE.REDIS_PASSWORD || undefined,
            maxRetriesPerRequest: null,
            enableReadyCheck: true
        });

        this.redis.on('error', (err) =>
            log.error('initialize - redis connection error', err)
        );

        this.redis.on('connect', () =>
            log.info('initialize - redis connected')
        );

        this.isWorkerProcess = isWorkerProcess;
        this.isInitialized = true;

        /**
         * Load and populate all the job definitions on initialization.
         */
        if (this.jobDefinitions.size === 0) {
            await import('./jobs');
        }

        log.info('initialize - QueueManager initialized');
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                      REGISTER JOB                                       $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Registers a job definition with the manager.
     *
     * The definition describes how the job should be processed and which queue it
     * belongs to. If executed in the worker process the corresponding worker is
     * created immediately.
     *
     * @param def - Full job definition object.
     */
    public registerJob(def: JobDefinition): void {
        //?—————————————————————————————————————————————————————————————————————————————————————?//
        //?                          WHAT IT MEANS TO REGISTER A JOB                            ?//
        ///
        //# Registering a job here simply means:
        //# - creating a queue (or using an already created one if the job is sharing the queue
        //#   with other jobs under the same namespace).
        //# - creating a worker (only in worker process).
        //# - saving the initialized definitions into the manager state.
        //#
        //# Initializing workers should never happen in the app itself.
        //# The reason we call this in the app is to sync the settings with the worker process,
        //# and to provide the state data needed to effectively push events and guard against
        //# pushing shitty events that would never get processed.
        ///
        //?—————————————————————————————————————————————————————————————————————————————————————?//

        if (this.jobDefinitions.has(def.name)) {
            log.warn('registerJob - job already registered', { job: def.name });
            return;
        }

        const queue = this.getOrCreateQueue(
            def.queueName,
            def.queueOptions,
            def.defaultJobOptions
        );

        if (this.isWorkerProcess) {
            /**
             * DO NOT REMOVE THIS CHECK
             * (I know, it is explained like 10 times in this file, but if this contract is ever broken
             * the queue system would be fucked beyond belief and the advantages it brings effectively nullified).
             */
            this.getOrCreateWorker(queue, def);
        }

        this.jobDefinitions.set(def.name, def);

        log.info('registerJob - job registered', {
            job: def.name,
            queue: def.queueName
        });
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                        ADD JOB                                          $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Enqueues a single job for processing.
     *
     * @typeParam TData - Shape of the job payload.
     * @param name - Unique name of the job as registered via `registerJob`.
     * @param data - Arbitrary payload to pass to the job processor.
     * @param options - Optional BullMQ job options overriding the defaults.
     *
     * @returns A promise that resolves with the created BullMQ Job instance.
     */
    public async addJob<TData = any>(
        name: string,
        data: TData,
        options: JobsOptions = {}
    ): Promise<Job<TData>> {
        /**
         * Adding jobs to uninitalized job manager does not make much sense.
         * This could very well happen in the nextjs app context.
         */
        if (!this.isInitialized) {
            await this.initialize(this.isWorkerProcess);
        }

        let def = this.jobDefinitions.get(name);

        if (!def) {
            /**
             * This is another job import option used aside from the one in initialize.
             * Under normal conditions, the code should never reach this point. Hovewer,
             * between guarding against even the most fucked up state and also development mode,
             * this is has some uses, and should be left as is.
             */
            await import('./jobs');
            def = this.jobDefinitions.get(name);

            if (!def) {
                // This should never happen if everything works correctly so throwing here is acceptable.
                log.error('addJob - job is not registered', undefined, {
                    jobName: name
                });
                throw new ServerError('app.error.default', 500);
            }
        }

        const queue =
            this.queues.get(def.queueName) ??
            this.getOrCreateQueue(def.queueName);

        // Merge caller options with default
        const opts: JobsOptions = { ...def.defaultJobOptions, ...options };

        const job = await queue.add(name, data, opts);

        log.trace('addJob - job added', { jobName: name, jobId: job.id });

        return job;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                    SCHEDULE CRON JOB                                    $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Schedules a repeatable (cron-based) job.
     *
     * @typeParam TData - Shape of the job payload.
     * @param config - Cron job configuration describing timing, queue and data.
     *
     * @returns A promise that resolves with the created repeatable Job instance.
     */
    public async scheduleCronJob<TData = any>(
        config: CronJobConfig<TData>
    ): Promise<Job<TData>> {
        const {
            name,
            cron,
            data = {},
            timezone,
            enabled = true,
            queueName,
            jobOptions = {}
        } = config;

        if (!queueName) {
            /**
             * Should never happen. Throwing here is acceptable.
             */
            log.warn('scheduleCronJob - queue name is required for cron jobs');
            throw new ServerError('app.error.default', 500);
        }

        const queue =
            this.queues.get(queueName) ?? this.getOrCreateQueue(queueName);

        const repeat = {
            cron,
            tz: timezone
        } as { cron: string; tz?: string };

        const job = await queue.add(name, data, {
            repeat,
            jobId: `cron:${name}`,
            ...jobOptions
        });

        if (!enabled) {
            /**
             * Do not remove the job from the queue. Only prevent it from being processed.
             * It is not needed now, but whenever any mechanism for enabling/disabling
             * jobs is implemented, i will thank myself for adding this.
             */
            await queue.pause();
        }

        log.info('scheduleCronJob - cron job scheduled', {
            jobName: name,
            cron
        });

        return job;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                    REMOVE CRON JOB                                      $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Removes a repeatable cron job from its queue.
     *
     * @param name - The `name` originally used when the cron job was scheduled.
     * @param queueName - Queue from which the job should be removed.
     */
    public async removeCronJob(name: string, queueName: string): Promise<void> {
        const queue = this.queues.get(queueName);

        if (!queue) {
            log.warn('removeCronJob - queue not found', { queueName });
            return;
        }

        const repeatable = await queue.getJobSchedulers();

        if (repeatable.length === 0) {
            log.warn('removeCronJob - no repeatable jobs found', { queueName });
            return;
        }

        const target = repeatable.find(
            (r) => r.id === `cron:${name}` || r.name === name
        );

        if (!target) {
            log.warn('removeCronJob - job not found', { jobName: name });
            return;
        }

        await queue.removeJobScheduler(target.key);
        log.info('removeCronJob - cron job removed', { jobName: name });
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                        SHUTDOWN                                         $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Gracefully shuts down all workers, queues and the underlying Redis connection.
     */
    public async shutdown(): Promise<void> {
        log.info('shutdown - QueueManager shutting down');

        for (const worker of this.workers.values()) {
            try {
                await worker.close();
            } catch (error: unknown) {
                log.error('shutdown - error closing worker', error);
            }
        }

        for (const queue of this.queues.values()) {
            try {
                await queue.close();
            } catch (error: unknown) {
                log.error('shutdown - error closing queue', error);
            }
        }

        if (this.redis) {
            try {
                await this.redis.quit();
            } catch (error: unknown) {
                log.error('shutdown - error closing redis connection', error);
            }
        }
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                         GETTERS                                         $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Returns the names of all queues currently managed by this instance.
     */
    public getQueueNames(): string[] {
        return Array.from(this.queues.keys());
    }

    /**
     * Returns every job definition that has been registered so far.
     */
    public getJobDefinitions(): JobDefinition[] {
        return Array.from(this.jobDefinitions.values());
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                     PRIVATE METHODS                                     $//
    //~-----------------------------------------------------------------------------------------~//

    private getOrCreateQueue(
        name: string,
        options: Omit<QueueOptions, 'connection' | 'name'> = {},
        defaultJobOptions?: JobsOptions
    ): Queue {
        const existingQueue = this.queues.get(name);

        if (existingQueue) {
            return existingQueue;
        }

        log.info(
            'getOrCreateQueue - no existing queue found, creating a new one',
            { name }
        );

        const queueOptions: QueueOptions = {
            ...options,
            connection: this.redis!,
            defaultJobOptions: {
                removeOnComplete: true,
                removeOnFail: 100,
                ...(options as any).defaultJobOptions, // may come from queueOptions
                ...defaultJobOptions
            }
        };

        const queue = new Queue(name, queueOptions);

        this.queues.set(name, queue);

        log.info('getOrCreateQueue - queue created', { name });
        return queue;
    }

    private getOrCreateWorker(queue: Queue, def: JobDefinition): Worker {
        const existingWorker = this.workers.get(queue.name);

        if (existingWorker) {
            return existingWorker;
        }

        if (!this.redis) {
            log.error('getOrCreateWorker - redis connection fucked');
            throw new ServerError('app.error.default', 500);
        }

        const worker = new Worker(
            queue.name,
            async (job) => {
                //?—————————————————————————————————————————————————————————————————————————————?//
                //?                            MULTIPLE JOB WORKERS                             ?//
                ///
                //# This dynamic lookup of the job processor allows the definition of multiple
                //# jobs for one single queue.
                //#
                //# The problem is that a single Worker can process multiple different job names
                //# that share the same queue. Instead of capturing a specific job definition
                //# in the processor closure (which would cause the worker to always run the
                //# processor of the first registered job for the queue), dynamically look up
                //# the correct processor for each incoming job by its name.
                ///
                //?—————————————————————————————————————————————————————————————————————————————?//

                const jobDef = this.jobDefinitions.get(job.name);

                if (!jobDef) {
                    log.warn('getOrCreateWorker - no processor found for job', {
                        jobName: job.name
                    });
                    throw new ServerError('app.error.default', 500);
                }

                try {
                    return await jobDef.processor(job as any);
                } catch (error: unknown) {
                    log.errorWithStack(
                        'getOrCreateWorker - job processor threw',
                        error,
                        {
                            jobName: jobDef.name
                        }
                    );
                    throw new ServerError('app.error.default', 500);
                }
            },
            {
                connection: this.redis,
                // Use the concurrency defined on the queue worker if available, 1 otherwise.
                concurrency: def.concurrency ?? 1
            }
        );

        const events = new QueueEvents(queue.name, { connection: this.redis! });

        /**
         * Attach logging events to the worker.
         */
        worker.on('completed', (job) => {
            log.trace('bullWorker - job completed', {
                queue: queue.name,
                jobId: job.id
            });
        });
        worker.on('failed', (job, err) => {
            log.error('bullWorker - job failed', err, {
                queue: queue.name,
                jobId: job?.id
            });
        });
        worker.on('error', (err) => {
            log.error('bullWorker - worker errored', err, {
                queue: queue.name
            });
        });
        worker.on('stalled', (jobId) => {
            log.warn('bullWorker - job stalled', { queue: queue.name, jobId });
        });

        events.on(
            'failed',
            ({
                jobId,
                failedReason
            }: {
                jobId: string | number | undefined;
                failedReason: string;
            }) => {
                log.error('bullWorker - queue events failed', undefined, {
                    queue: queue.name,
                    jobId,
                    failedReason
                });
            }
        );

        this.workers.set(queue.name, worker);
        log.info('getOrCreateWorker - worker created', { queue: queue.name });
        return worker;
    }
}

export const queueManager = new QueueManager();
