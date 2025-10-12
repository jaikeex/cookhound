import { PrismaClient, Prisma } from '@prisma/client';
import { Logger } from '@/server/logger';
import { InfrastructureError, isServerError } from '@/server/error/server';
import { InfrastructureErrorCode } from '@/server/error/codes';

const globalForPrisma = global as unknown as { prisma?: any };

const baseClient: PrismaClient = globalForPrisma.prisma || new PrismaClient();

//~=============================================================================================~//
//$                                  LOG & THROW EXTENSION                                      $//
//~=============================================================================================~//

const prismaLogger = Logger.getInstance('prisma');

/**
 * This ensures that every error coming out of prisma internal code, is properly handled,
 * logged and rethrown as more app-friendly error. This should be kept active for all models,
 * as unexpected errors in db queries are a major problem that needs to be always caught and addressed.
 */
const logAndThrowExtension = Prisma.defineExtension({
    name: 'logAndThrow',
    query: {
        $allModels: {
            $allOperations: async ({ model, operation, args, query }) => {
                try {
                    return await query(args);
                } catch (error: unknown) {
                    /**
                     * This is a crucial check. Completely useless in production but is a life-saver in dev mode.
                     * Two things are a problem here:
                     *  (1) During hot reloads, if this module is not part of the reload (it is not imported
                     *      by any of the updated modules or their own imports), it gets never reloaded, which
                     *      for some reason (my guess is some closure bullshit, but i have not studied the
                     *      issue further) that if any of the Error modules get reloaded (which are imported
                     *      everywhere) the info is not carried over, all checks depending on
                     *      instanceof, which gets the class constructor information from memory, fail.
                     *  (2) Somehow this extension gets called recursively for every hot reload,
                     *      catching its own thrown error in the process, and the apparent
                     *      number of caught errors increments all the time.
                     *
                     * The first thing is not really a problem because I know about it and don't use instanceof
                     * checks. To guard against the second one, this check exists.
                     * I am writing this a bit drunk, rewrite or delete when sober.
                     * DO NOT DELTE THIS CHECK!!!
                     */
                    if (isServerError(error)) {
                        throw error;
                    }

                    /**
                     * What follows is a mapping of prisma error codes to my infra error codes.
                     * This is not exhaustive, and more are likely to be added as i learn
                     * more about prisma or ask an AI to generate it for me...
                     */
                    let infraCode: InfrastructureErrorCode =
                        InfrastructureErrorCode.DB_QUERY_FAILED;

                    if (
                        error &&
                        typeof error === 'object' &&
                        'code' in error &&
                        typeof error?.code === 'string'
                    ) {
                        switch (error.code) {
                            case 'P2002': // Unique constraint failed
                            case 'P2003': // FK constraint failed
                                infraCode =
                                    InfrastructureErrorCode.DB_CONSTRAINT_VIOLATION;
                                break;

                            case 'P2014':
                            case 'P2020':
                                infraCode =
                                    InfrastructureErrorCode.DB_QUERY_FAILED;
                                break;

                            default:
                                infraCode =
                                    InfrastructureErrorCode.DB_QUERY_FAILED;
                        }
                    }

                    prismaLogger.errorWithStack(
                        `PRISMA ERROR - in ${model}.${operation}`,
                        error
                    );

                    throw new InfrastructureError(infraCode, error);
                }
            }
        }
    }
});

const prisma = baseClient.$extends(logAndThrowExtension);

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

export default prisma;
