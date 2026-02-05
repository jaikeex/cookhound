import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

type UseParamsChangeListenerArgs = {
    onChange?: () => void;
    key: string;
};

type UseParamsChangeListenerType = (
    options: UseParamsChangeListenerArgs
) => void;

export const useParamsChangeListener: UseParamsChangeListenerType = ({
    onChange,
    key
}) => {
    const params = useSearchParams();
    const tracker = params.get(key);

    useEffect(() => {
        onChange?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tracker]);
};
