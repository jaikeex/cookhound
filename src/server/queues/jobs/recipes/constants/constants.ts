export const QUEUE_NAME = 'recipes';
export const EVALUATION_QUEUE_NAME = 'recipe-evaluation';

export const QUEUE_OPTIONS = {
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        },
        removeOnComplete: 10,
        removeOnFail: 50
    }
};

export const EVALUATION_QUEUE_OPTIONS = {
    defaultJobOptions: {
        ...QUEUE_OPTIONS.defaultJobOptions,
        attempts: 1
    }
};
