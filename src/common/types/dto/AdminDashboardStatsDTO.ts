export type AdminDashboardStatsDTO = Readonly<{
    counts: {
        totalUsers: number;
        totalRecipes: number;
        openFlags: number;
        newUsersLast30Days: number;
        newRecipesLast30Days: number;
        totalRatings: number;
    };
    recentRecipes: {
        id: number;
        displayId: string;
        title: string;
        authorUsername: string;
        language: string;
        createdAt: string;
    }[];
    recentUsers: {
        id: number;
        username: string;
        email: string;
        authType: string;
        createdAt: string;
    }[];
}>;
