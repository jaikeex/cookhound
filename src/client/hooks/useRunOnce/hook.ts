import { useEffect, useRef } from 'react';

export const useRunOnce = (
    callback: () => void,
    deps?: React.DependencyList
) => {
    const hasRun = useRef(false);

    useEffect(() => {
        if (!hasRun.current) {
            callback();
            hasRun.current = true;
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...(deps ?? [])]);
};
