export type AdminUserListItemDTO = Readonly<{
    id: number;
    username: string;
    email: string;
    authType: string;
    role: string;
    status: string;
    emailVerified: boolean;
    avatarUrl: string | null;
    createdAt: string;
    lastLogin: string | null;
    lastVisitedAt: string | null;
    recipeCount: number;
}>;

export type AdminUserListDTO = Readonly<{
    users: AdminUserListItemDTO[];
    totalItems: number;
    page: number;
    pageSize: number;
}>;

export type AdminUserDetailDTO = Readonly<{
    id: number;
    username: string;
    email: string;
    authType: string;
    role: string;
    status: string;
    emailVerified: boolean;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
    lastLogin: string | null;
    lastVisitedAt: string | null;
    lastPasswordReset: string | null;
    deletedAt: string | null;
    deletionScheduledFor: string | null;
    recipeCount: number;
    ratingCount: number;
    flagCount: number;
}>;
