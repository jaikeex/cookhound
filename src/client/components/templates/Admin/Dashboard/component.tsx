'use client';

import React, { useCallback, use, useMemo } from 'react';
import { Table, StatCard, Typography } from '@/client/components';
import type { TableColumn } from '@/client/components';
import { useLocale } from '@/client/store';
import { formatDate } from '@/client/utils';
import type { AdminDashboardStatsDTO } from '@/common/types';

type AdminDashboardTemplateProps = Readonly<{
    stats: Promise<AdminDashboardStatsDTO>;
}>;

export const AdminDashboardTemplate: React.FC<AdminDashboardTemplateProps> = ({
    stats
}) => {
    const { t } = useLocale();
    const data = use(stats);

    const getRecipeKey = useCallback(
        (r: NonNullable<typeof data>['recentRecipes'][number]) => r.id,
        []
    );

    const getUserKey = useCallback(
        (u: NonNullable<typeof data>['recentUsers'][number]) => u.id,
        []
    );

    const recipeColumns: TableColumn<
        NonNullable<typeof data>['recentRecipes'][number]
    >[] = useMemo(
        () => [
            {
                key: 'title',
                header: t('admin.dashboard.table.title'),
                accessor: 'title'
            },
            {
                key: 'author',
                header: t('admin.dashboard.table.author'),
                accessor: 'authorUsername'
            },
            {
                key: 'language',
                header: t('admin.dashboard.table.language'),
                accessor: 'language'
            },
            {
                key: 'createdAt',
                header: t('admin.dashboard.table.createdAt'),
                render: (r) => formatDate(r.createdAt)
            }
        ],
        [t]
    );

    const userColumns: TableColumn<
        NonNullable<typeof data>['recentUsers'][number]
    >[] = useMemo(
        () => [
            {
                key: 'username',
                header: t('admin.dashboard.table.username'),
                accessor: 'username'
            },
            {
                key: 'email',
                header: t('admin.dashboard.table.email'),
                accessor: 'email'
            },
            {
                key: 'authType',
                header: t('admin.dashboard.table.authType'),
                accessor: 'authType'
            },
            {
                key: 'createdAt',
                header: t('admin.dashboard.table.createdAt'),
                render: (u) => formatDate(u.createdAt)
            }
        ],
        [t]
    );

    return (
        <div className="flex flex-col gap-6">
            <div>
                <Typography variant="heading-lg">
                    {t('admin.dashboard.title')}
                </Typography>
            </div>

            {/* primary stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data ? (
                    <>
                        <StatCard
                            label={t('admin.dashboard.stat.totalUsers')}
                            value={data.counts.totalUsers}
                            subtitle={t(
                                'admin.dashboard.stat.newUsersSubtitle',
                                {
                                    count: String(
                                        data.counts.newUsersLast30Days
                                    )
                                }
                            )}
                        />

                        <StatCard
                            label={t('admin.dashboard.stat.totalRecipes')}
                            value={data.counts.totalRecipes}
                            subtitle={t(
                                'admin.dashboard.stat.newRecipesSubtitle',
                                {
                                    count: String(
                                        data.counts.newRecipesLast30Days
                                    )
                                }
                            )}
                        />

                        <StatCard
                            label={t('admin.dashboard.stat.openFlags')}
                            value={data.counts.openFlags}
                        />
                    </>
                ) : null}
            </div>

            {/* secondary stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data ? (
                    <>
                        <StatCard
                            label={t('admin.dashboard.stat.newUsersLast30Days')}
                            value={data.counts.newUsersLast30Days}
                        />

                        <StatCard
                            label={t(
                                'admin.dashboard.stat.newRecipesLast30Days'
                            )}
                            value={data.counts.newRecipesLast30Days}
                        />

                        <StatCard
                            label={t('admin.dashboard.stat.totalRatings')}
                            value={data.counts.totalRatings}
                        />
                    </>
                ) : null}
            </div>

            {/* recent Recipes */}
            {data ? (
                <Table
                    columns={recipeColumns}
                    data={data.recentRecipes}
                    rowKey={getRecipeKey}
                    title={t('admin.dashboard.recentRecipes')}
                    emptyText={t('admin.dashboard.table.noData')}
                />
            ) : null}

            {/* recent Users */}
            {data ? (
                <Table
                    columns={userColumns}
                    data={data.recentUsers}
                    rowKey={getUserKey}
                    title={t('admin.dashboard.recentUsers')}
                    emptyText={t('admin.dashboard.table.noData')}
                />
            ) : null}
        </div>
    );
};
