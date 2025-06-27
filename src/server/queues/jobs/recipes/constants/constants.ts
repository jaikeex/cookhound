export const QUEUE_NAME = 'recipes';

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
