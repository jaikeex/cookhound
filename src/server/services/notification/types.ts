import type { NtfyMessage } from '@/server/integrations/ntfy/types';

export type NtfyEvent =
    | 'new_user'
    | 'new_recipe'
    | 'recipe_flagged'
    | 'recipe_reinstated'
    | 'flag_appeal_created'
    | 'content_reported'
    | 'account_deletion_requested';

export type NtfyNotificationJobData = NtfyMessage &
    Readonly<{
        event: NtfyEvent;
    }>;
