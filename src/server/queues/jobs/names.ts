import { QUEUE_NAME as EMAILS_QUEUE_NAME } from './emails/constants';
import { QUEUE_NAME as SEARCH_QUEUE_NAME } from './search/constants';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                       IMPORTANT INFO                                        ?//
///
//# Name all jobs here inside this file. Only use this object when adding jobs and working
//# with jobs in general.
//# Name all queues also inside this file and use that object when declaring job classes.
//#
//# I thought about doing this more strict and creating some sort of namespace mapping
//# to ensure that the jobs and their queues are properly organized at all times, but the code
//# quickly turned to shit so i lost patience and reverted back to comment based approach.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

export const JOB_NAMES = Object.freeze({
    //|-------------------------------------------------------------------------------------|//
    //?                                       EMAILS                                        ?//
    //|-------------------------------------------------------------------------------------|//

    SEND_VERIFICATION_EMAIL: 'send-verification-email',
    SEND_PASSWORD_RESET_EMAIL: 'send-password-reset-email',

    //|-------------------------------------------------------------------------------------|//
    //?                                      SEARCH                                         ?//
    //|-------------------------------------------------------------------------------------|//

    REINDEX_RECIPES: 'reindex-recipes'
});

export const QUEUE_NAMES = Object.freeze({
    EMAILS: EMAILS_QUEUE_NAME,
    SEARCH: SEARCH_QUEUE_NAME
});
