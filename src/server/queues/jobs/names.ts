import { QUEUE_NAME as EMAILS_QUEUE_NAME } from './emails/constants';
import { QUEUE_NAME as SEARCH_QUEUE_NAME } from './search/constants';
import {
    EVALUATION_QUEUE_NAME,
    QUEUE_NAME as RECIPES_QUEUE_NAME
} from './recipes/constants';
import { QUEUE_NAME as ACCOUNTS_QUEUE_NAME } from './accounts/constants';

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
    SEND_EMAIL_CHANGE_CONFIRMATION: 'send-email-change-confirmation',
    SEND_EMAIL_CHANGE_NOTICE: 'send-email-change-notice',
    SEND_EMAIL_CHANGED_AUDIT: 'send-email-changed-audit',
    SEND_ACCOUNT_DELETION_CONFIRMATION: 'send-account-deletion-confirmation',
    SEND_ACCOUNT_DELETION_REMINDER: 'send-account-deletion-reminder',
    SEND_ACCOUNT_DELETION_CANCELLED: 'send-account-deletion-cancelled',
    SEND_ACCOUNT_DELETED: 'send-account-deleted',
    SEND_CONTACT_FORM: 'send-contact-form',

    //|-------------------------------------------------------------------------------------|//
    //?                                      SEARCH                                         ?//
    //|-------------------------------------------------------------------------------------|//

    REINDEX_RECIPES: 'reindex-recipes',

    //|-------------------------------------------------------------------------------------|//
    //?                                      RECIPES                                        ?//
    //|-------------------------------------------------------------------------------------|//

    REGISTER_RECIPE_VISIT: 'register-recipe-visit',
    EVALUATE_RECIPE: 'evaluate-recipe',

    //|-------------------------------------------------------------------------------------|//
    //?                                      ACCOUNTS                                       ?//
    //|-------------------------------------------------------------------------------------|//

    PROCESS_ACCOUNT_DELETIONS: 'process-account-deletions'
});

export const QUEUE_NAMES = Object.freeze({
    EMAILS: EMAILS_QUEUE_NAME,
    SEARCH: SEARCH_QUEUE_NAME,
    RECIPES: RECIPES_QUEUE_NAME,
    RECIPE_EVALUATION: EVALUATION_QUEUE_NAME,
    ACCOUNTS: ACCOUNTS_QUEUE_NAME
});
