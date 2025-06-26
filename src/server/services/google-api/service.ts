import { ENV_CONFIG_PRIVATE } from '@/common/constants';
import { googleApiClient } from '@/server/integrations/google';
import type { LogEntry } from '@/server/integrations/google';

//§—————————————————————————————————————————————————————————————————————————————————————————————§//
//§                                           WARNING                                           §//
///
//# THIS SERVICE CANNOT IMPORT LOGGER
//# As it is currently written and structured, the logger imports this service in order
//# to write logs to gcl. Importing logger here will fuck the app over with circular imports.
//# It is very sad.
///
//§—————————————————————————————————————————————————————————————————————————————————————————————§//

class GoogleApiService {
    async uploadRecipeImage(fileName: string, data: number[] | BodyInit) {
        const bucket = ENV_CONFIG_PRIVATE.GOOGLE_STORAGE_BUCKET_RECIPE_IMAGES;

        // Convert array of numbers to Buffer if needed
        const binaryData = Array.isArray(data) ? Buffer.from(data) : data;

        const response = await googleApiClient
            .getStorageService()
            .upload(fileName, binaryData, bucket, 'image/webp');

        return response;
    }

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
