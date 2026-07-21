'use client';

import { useThemePersistence } from '@/client/hooks';
import { useAuth } from '@/client/store';

type ClientShellProps = NonNullable<unknown>;

export const ClientShell: React.FC<ClientShellProps> = () => {
    const { user } = useAuth();

    useThemePersistence(user?.id);

    return null;
};
