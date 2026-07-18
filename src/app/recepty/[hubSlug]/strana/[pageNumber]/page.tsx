import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
    renderHubPage,
    buildHubMetadata,
    buildHubFallbackMetadata,
    parsePageNumber
} from '@/app/recepty/_lib/hubPage';

export const revalidate = 3600;

type HubPaginationParams = {
    readonly params: Promise<
        Readonly<{
            hubSlug: string;
            pageNumber: string;
        }>
    >;
};

//|=============================================================================================|//

export default async function Page({ params }: HubPaginationParams) {
    const { hubSlug, pageNumber } = await params;

    const page = parsePageNumber(pageNumber);

    if (!page) {
        notFound();
    }

    return await renderHubPage(hubSlug, page);
}

//|=============================================================================================|//

export function generateStaticParams(): Array<{
    hubSlug: string;
    pageNumber: string;
}> {
    // Deep pages are rare and generated on demand (ISR); prebuilding all
    // hub/page combinations would multiply build work for empty pages.
    return [];
}

//|=============================================================================================|//

export async function generateMetadata({
    params
}: HubPaginationParams): Promise<Metadata> {
    const { hubSlug, pageNumber } = await params;
    const page = parsePageNumber(pageNumber);

    if (!page) {
        return buildHubFallbackMetadata();
    }

    return buildHubMetadata(hubSlug, page);
}
