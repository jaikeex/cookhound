'use client';

import React, { useCallback, use, useMemo } from 'react';
import { Table } from '@/client/components/molecules/Table';
import { StatCard } from '@/client/components/molecules/Card/Stat';
import { Typography } from '@/client/components/atoms/Typography';
import type { TableColumn } from '@/client/components/molecules/Table';
import { formatDate } from '@/client/utils';
import type { AdminDashboardStatsDTO } from '@/common/types';
import { t } from '@/client/locales';

type AdminDashboardTemplateProps = Readonly<{
    stats: Promise<AdminDashboardStatsDTO>;
}>;

export const AdminDashboardTemplate: React.FC<AdminDashboardTemplateProps> = ({
    stats
}) => {
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
                key: 'createdAt',
                header: t('admin.dashboard.table.createdAt'),
                render: (r) => formatDate(r.createdAt)
            }
        ],
        []
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
        []
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

                        <StatCard
                            label={t('admin.dashboard.stat.openReports')}
                            value={data.counts.openReports}
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
