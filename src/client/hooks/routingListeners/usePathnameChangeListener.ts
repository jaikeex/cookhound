import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

type UsePathnameChangeListenerArgs = {
    onChange?: () => void;
};

type UsePathnameChangeListenerType = (
    options: UsePathnameChangeListenerArgs
) => void;

export const usePathnameChangeListener: UsePathnameChangeListenerType = ({
    onChange
}) => {
    const pathname = usePathname();

    useEffect(() => {
        onChange && onChange();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);
};
