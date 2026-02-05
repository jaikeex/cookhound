import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

type UsePathnameChangeListenerArgs = {
    ignoreParams?: boolean;
    onChange?: () => void;
};

type UsePathnameChangeListenerType = (
    options: UsePathnameChangeListenerArgs
) => void;

export const usePathnameChangeListener: UsePathnameChangeListenerType = ({
    onChange,
    ignoreParams = false
}) => {
    const pathname = usePathname();

    const pathNameToCheck = ignoreParams ? pathname.split('?')[0] : pathname;

    useEffect(() => {
        onChange?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathNameToCheck]);
};
