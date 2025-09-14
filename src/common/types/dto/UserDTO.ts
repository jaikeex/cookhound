import { Expose } from 'class-transformer';
import { Status, UserRole } from '@/common/types';

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

    // Semi-private profile fields
    @Expose({ groups: ['self', 'admin'] })
    createdAt: string = '';

    @Expose({ groups: ['self', 'admin'] })
    lastLogin: string | null = null;

    @Expose({ groups: ['self', 'admin'] })
    lastVisitedAt: string | null = null;
}
