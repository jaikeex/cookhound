import { ENV_CONFIG_PRIVATE } from '@/common/constants';
import { googleApiClient } from '@/server/integrations/google';
import type { LogEntry } from '@/server/integrations/google';
import { Logger, LogServiceMethod } from '@/server/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = Logger.getInstance('google-api-service');

class GoogleApiService {
    @LogServiceMethod({ names: ['fileName'] })
    async uploadRecipeImage(
        fileName: string,
        data: number[] | Uint8Array | BodyInit
    ) {
        const bucket = ENV_CONFIG_PRIVATE.GOOGLE_STORAGE_BUCKET_RECIPE_IMAGES;

        let body: BodyInit;

        if (Array.isArray(data)) {
            body = new Uint8Array(data) as unknown as BodyInit;
        } else if (data instanceof Uint8Array) {
            body = data as unknown as BodyInit;
        } else {
            body = data;
        }

        const response = await googleApiClient
            .getStorageService()
            .upload(fileName, body, bucket, 'image/webp');

        return response;
    }

    @LogServiceMethod({ names: ['fileName'] })
    async uploadAvatarImage(
        fileName: string,
        data: number[] | Uint8Array | BodyInit
    ) {
        const bucket = ENV_CONFIG_PRIVATE.GOOGLE_STORAGE_BUCKET_AVATAR_IMAGES;

        let body: BodyInit;

        if (Array.isArray(data)) {
            body = new Uint8Array(data) as unknown as BodyInit;
        } else if (data instanceof Uint8Array) {
            body = data as unknown as BodyInit;
        } else {
            body = data;
        }

        const response = await googleApiClient
            .getStorageService()
            .upload(fileName, body, bucket, 'image/webp');

        return response;
    }

    @LogServiceMethod({ names: ['logs'] })
    async writeLogsToGoogleCloud(logs: LogEntry[]) {
        //?—————————————————————————————————————————————————————————————————————————————————————?//
        //?                                      LOG NAME                                       ?//
        ///
        //# Ideally, the logName would be automated to match the entry somehow, so that all
        //# logs do not end up in one pile. I was not able to come up with a good solution
        //# when writing the logging, and could not be bothered to try further, so it is
        //# left here hardcoded.
        //#
        //# Overall the level of abstraction between this and the google transport implementation
        //# is up for debate. This might not even be the best place to set these.
        //?
        //? This should be thought about and iterated on when i eventually revisit the logging
        //? in the future (shortly...).
        ///
        //?—————————————————————————————————————————————————————————————————————————————————————?//

        const projectId = ENV_CONFIG_PRIVATE.GOOGLE_API_PROJECT_ID;
        const logName = `projects/${projectId}/logs/application`;
        const resource = { type: 'global' };

        const logEntries = logs.map((log) => ({
            ...log,
            logName,
            resource
        }));

        const response = await googleApiClient
            .getLoggingService()
            .writeLogs(logEntries);

        return response;
    }
}

export const googleApiService = new GoogleApiService();
