import { useEffect, useRef } from 'react';

export const useRunOnce = (callback: () => void) => {
    const hasRun = useRef(false);

    useEffect(() => {
        if (!hasRun.current) {
            callback();
            hasRun.current = true;
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};
