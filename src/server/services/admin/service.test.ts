import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserRole } from '@/common/types';
import { NotFoundError } from '@/server/error';

//|=============================================================================================|//
//$                                           MOCKS                                             $//
//|=============================================================================================|//

//? vitest mocks need to be hoisted to the top, it throws otherwise

vi.mock('@/server/db/model', () => ({
    default: {
        user: {
            getOneById: vi.fn(),
            updateOneById: vi.fn()
        },
        adminActionLog: {
            createOne: vi.fn()
        }
    },
    ADMIN_USER_DETAIL_SELECT: {}
}));

vi.mock('@/server/utils/session', () => ({
    sessions: {
        invalidateAllUserSessions: vi.fn()
    }
}));

vi.mock('@/server/utils/reqwest', () => ({
    assertAdmin: vi.fn(() => 99),
    assertAdminAndNotSelf: vi.fn(() => 99)
}));

vi.mock('@/server/utils/reqwest/context', () => ({
    RequestContext: {
        getUserLocale: vi.fn(() => 'en')
    }
}));

vi.mock('@/server/services/mail/service', () => ({
    mailService: {
        sendRoleChangedNotice: vi.fn(),
        sendAccountBannedNotice: vi.fn(),
        sendAccountDeletionConfirmation: vi.fn()
    }
}));

//|=============================================================================================|//
//$                                          IMPORTS                                            $//
//|=============================================================================================|//

const ADMIN_USER_ID = 99;
const TARGET_USER_ID = 7;

import { adminService } from './service';
import db from '@/server/db/model';
import { sessions } from '@/server/utils/session';
import { assertAdminAndNotSelf } from '@/server/utils/reqwest';

const mockDbUser = vi.mocked(db.user);
const mockSessions = vi.mocked(sessions);
const mockAssertAdminAndNotSelf = vi.mocked(assertAdminAndNotSelf);

//|=============================================================================================|//
//$                                           TESTS                                             $//
//|=============================================================================================|//

describe('AdminService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAssertAdminAndNotSelf.mockReturnValue(ADMIN_USER_ID);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('changeUserRole', () => {
        it('should invalidate the target sessions after a role change', async () => {
            // A currently-admin target being demoted to a regular user.
            mockDbUser.getOneById.mockResolvedValue({
                id: TARGET_USER_ID,
                role: UserRole.Admin
            } as never);
            mockDbUser.updateOneById.mockResolvedValue({} as never);

            await adminService.changeUserRole(TARGET_USER_ID, UserRole.User);

            expect(mockDbUser.updateOneById).toHaveBeenCalledWith(
                TARGET_USER_ID,
                { role: UserRole.User }
            );
            // The session carries the role captured at login, so demotion
            // must revoke it or the demoted admin keeps admin access.
            expect(mockSessions.invalidateAllUserSessions).toHaveBeenCalledWith(
                TARGET_USER_ID
            );
        });

        it('should not touch sessions when the target user does not exist', async () => {
            mockDbUser.getOneById.mockResolvedValue(null as never);

            await expect(
                adminService.changeUserRole(TARGET_USER_ID, UserRole.User)
            ).rejects.toThrow(NotFoundError);

            expect(mockDbUser.updateOneById).not.toHaveBeenCalled();
            expect(
                mockSessions.invalidateAllUserSessions
            ).not.toHaveBeenCalled();
        });
    });
});
