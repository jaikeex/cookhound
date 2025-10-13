import { useEffect, useRef } from 'react';

export interface UseInfinityScrollOptions {
    loadMore: () => void;
    hasMore: boolean;
    isLoading?: boolean;
    /**
     * IntersectionObserver root margin. Defaults to `'200px 0px'` – this tells the hook
     * to start the loading a bit earlier than the user scrolls to the total bottom.
     */
    rootMargin?: string;
    /**
     * IntersectionObserver threshold. Defaults to `0.1`.
     */
    threshold?: number;
}

export const useInfinityScroll = <T extends HTMLElement = HTMLDivElement>({
    loadMore,
    hasMore,
    isLoading = false,
    rootMargin = '200px 0px',
    threshold = 0.1
}: UseInfinityScrollOptions) => {
    const sentinelRef = useRef<T | null>(null);
    const loadMoreRef = useRef(loadMore);

    // Singleton wohack
    useEffect(() => {
        loadMoreRef.current = loadMore;
    }, [loadMore]);

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;

                if (!entry) {
                    return;
                }

                if (entry.isIntersecting && !isLoading) {
                    loadMoreRef.current();
                }
            },
            {
                root: null,
                rootMargin,
                threshold
            }
        );

        observer.observe(node);

        return () => {
            observer.disconnect();
        };
    }, [hasMore, isLoading, rootMargin, threshold]);

    return { sentinelRef } as const;
};
