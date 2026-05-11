import { Expose } from 'class-transformer';
import {
    AuthType,
    Status,
    type UserPreferences,
    UserRole
} from '@/common/types';
import type { CookieConsentDTO } from '@/common/types/cookie-consent';
import type { TermsAcceptanceDTO } from '@/common/types/terms-acceptance';

export class UserDTO {
    @Expose()
    id: number = 0;

    @Expose()
    username: string = '';

    @Expose()
    avatarUrl: string | null = null;

    //|-------------------------------------------------------------------------------------|//
    //?                                      SENSITIVE                                      ?//
    //|-------------------------------------------------------------------------------------|//

    @Expose({ groups: ['self', 'admin'] })
    email?: string | null;

    @Expose({ groups: ['self', 'admin'] })
    cookieConsent?: CookieConsentDTO[] | null;

    @Expose({ groups: ['self', 'admin'] })
    termsAcceptance?: TermsAcceptanceDTO[] | null;

    @Expose({ groups: ['self', 'admin'] })
    preferences?: UserPreferences;

    //|-------------------------------------------------------------------------------------|//
    //?                                   ADMINISTRATIVE                                    ?//
    //|-------------------------------------------------------------------------------------|//

    @Expose({ groups: ['admin'] })
    role?: UserRole;

    @Expose({ groups: ['admin'] })
    status?: Status;

    //|-------------------------------------------------------------------------------------|//
    //?                                    SEMI-PRIVATE                                     ?//
    //|-------------------------------------------------------------------------------------|//

    @Expose({ groups: ['self', 'admin'] })
    authType?: AuthType;

    @Expose({ groups: ['self', 'admin'] })
    createdAt?: string;

    @Expose({ groups: ['self', 'admin'] })
    lastLogin?: string | null;

    @Expose({ groups: ['self', 'admin'] })
    lastVisitedAt?: string | null;

    @Expose({ groups: ['self', 'admin'] })
    deletedAt?: string | null;

    @Expose({ groups: ['self', 'admin'] })
    deletionScheduledFor?: string | null;
}
