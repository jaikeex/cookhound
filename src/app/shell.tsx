'use client';

import { useLocalePersistence, useThemePersistence } from '@/client/hooks';
import { useAuth } from '@/client/store';

type ClientShellProps = NonNullable<unknown>;

export const ClientShell: React.FC<ClientShellProps> = () => {
    const { user } = useAuth();

    useThemePersistence(user?.id);
    useLocalePersistence(user?.id);

    return null;
};
