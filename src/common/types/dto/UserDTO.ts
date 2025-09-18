import { Expose } from 'class-transformer';
import {
    AuthType,
    Status,
    type UserPreferences,
    UserRole
} from '@/common/types';
import type { CookieConsentFromDb } from '@/common/types/cookie-consent';

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
    email: string | null = null;

    @Expose({ groups: ['self', 'admin'] })
    cookieConsent: CookieConsentFromDb[] | null = null;

    @Expose({ groups: ['self', 'admin'] })
    preferences: UserPreferences = {};

    //|-------------------------------------------------------------------------------------|//
    //?                                   ADMINISTRATIVE                                    ?//
    //|-------------------------------------------------------------------------------------|//

    @Expose({ groups: ['admin'] })
    role: UserRole = UserRole.User;

    @Expose({ groups: ['admin'] })
    status: Status = Status.Active;

    //|-------------------------------------------------------------------------------------|//
    //?                                    SEMI-PRIVATE                                     ?//
    //|-------------------------------------------------------------------------------------|//

    @Expose({ groups: ['self', 'admin'] })
    authType: AuthType = AuthType.Local;

    // Semi-private profile fields
    @Expose({ groups: ['self', 'admin'] })
    createdAt: string = '';

    @Expose({ groups: ['self', 'admin'] })
    lastLogin: string | null = null;

    @Expose({ groups: ['self', 'admin'] })
    lastVisitedAt: string | null = null;
}
