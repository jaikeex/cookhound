import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

type UseUrlChangeListenerArgs = {
    onChange?: () => void;
};

type UseUrlChangeListenerType = (options: UseUrlChangeListenerArgs) => void;

export const useUrlChangeListener: UseUrlChangeListenerType = ({
    onChange
}) => {
    const pathname = usePathname();
    const params = useSearchParams();
    const paramsTracker = params.toString();

    useEffect(() => {
        onChange && onChange();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, paramsTracker]);
};
