import type { Status, UserDTO, UserRole } from '@/common/types';
import type { User as UserFromDB } from '@prisma/client';

export function createUserDTO(user: UserFromDB): UserDTO {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role as UserRole,
        status: user.status as Status,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin?.toISOString() || null
    };
}
