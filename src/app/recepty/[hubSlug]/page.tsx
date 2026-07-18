import type { Metadata } from 'next';
import { HUB_SLUGS } from '@/common/constants';
import { renderHubPage, buildHubMetadata } from '@/app/recepty/_lib/hubPage';

export const revalidate = 3600;

type HubPageParams = {
    readonly params: Promise<
        Readonly<{
            hubSlug: string;
        }>
    >;
};

//|=============================================================================================|//

export default async function Page({ params }: HubPageParams) {
    const { hubSlug } = await params;

    return await renderHubPage(hubSlug, 1);
}

//|=============================================================================================|//

export function generateStaticParams(): Array<{ hubSlug: string }> {
    return Object.values(HUB_SLUGS).map((hubSlug) => ({ hubSlug }));
}

//|=============================================================================================|//

export async function generateMetadata({
    params
}: HubPageParams): Promise<Metadata> {
    const { hubSlug } = await params;
    return buildHubMetadata(hubSlug, 1);
}
