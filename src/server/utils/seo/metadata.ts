import type { Metadata } from 'next';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { getUserLocale } from '@/common/utils';
import { tServer } from '@/server/utils/locales';
import type { I18nMessage } from '@/client/locales';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';

type MetadataConfig = {
    titleKey: I18nMessage;
    descriptionKey: I18nMessage;
    imageUrl?: string;
    images?: string[];
    ogTitleKey?: I18nMessage;
    ogDescriptionKey?: I18nMessage;
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    params?: Record<string, string | number | boolean>;
    canonical?: string;
    noindex?: boolean;
    type?: 'website' | 'article' | 'profile';
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    tags?: string[];
};

/**
 * Validates and truncates meta description to optimal length
 *
 * @param description - The description to validate
 * @param maxLength - Maximum length (default: 160)
 * @returns Validated description
 */
function validateDescription(description: string, maxLength = 160): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength - 3) + '...';
}

/**
 * Generates localized metadata for Next.js pages with SEO optimizations
 *
 * @param cookies - The request cookies
 * @param headers - The request headers
 * @param config - Configuration object for metadata
 * @returns - The localized metadata object
 */
export async function getLocalizedMetadata(
    cookies: ReadonlyRequestCookies,
    headers: Headers,
    config: MetadataConfig
): Promise<Metadata> {
    //|-----------------------------------------------------------------------------------------|//
    //?                                      BASIC METADATA                                     ?//
    //|-----------------------------------------------------------------------------------------|//

    const locale = await getUserLocale(cookies, headers);
    const baseUrl = ENV_CONFIG_PUBLIC.ORIGIN;

    const canonicalUrl = config.canonical || baseUrl;

    const title = tServer(locale, config.titleKey, config.params);
    const description = validateDescription(
        tServer(locale, config.descriptionKey, config.params)
    );

    const ogTitle = config.ogTitleKey
        ? tServer(locale, config.ogTitleKey, config.params)
        : title;
    const ogDescription = config.ogDescriptionKey
        ? validateDescription(
              tServer(locale, config.ogDescriptionKey, config.params),
              200
          )
        : description;

    const metadata: Metadata = {
        metadataBase: new URL(baseUrl),
        title,
        description,
        openGraph: {
            title: ogTitle,
            description: ogDescription,
            siteName: 'Cookhound',
            locale: locale,
            url: canonicalUrl
        },
        twitter: {
            card: config.twitterCard || 'summary_large_image',
            title: ogTitle,
            description: ogDescription
        },
        alternates: config.canonical
            ? {
                  canonical: config.canonical,
                  languages: {
                      en: config.canonical,
                      cs: config.canonical
                  }
              }
            : undefined,
        robots: config.noindex
            ? {
                  index: false,
                  follow: false
              }
            : undefined
    };

    //|-----------------------------------------------------------------------------------------|//
    //?                                        OG EXTRAS                                        ?//
    //|-----------------------------------------------------------------------------------------|//

    if (config.type === 'article') {
        metadata.openGraph = {
            ...metadata.openGraph,
            type: 'article',
            ...(config.publishedTime
                ? { publishedTime: config.publishedTime }
                : {}),
            ...(config.modifiedTime
                ? { modifiedTime: config.modifiedTime }
                : {}),
            ...(config.authors && config.authors.length > 0
                ? { authors: config.authors }
                : {}),
            ...(config.tags && config.tags.length > 0
                ? { tags: config.tags }
                : {})
        } as typeof metadata.openGraph;
    } else if (config.type === 'profile') {
        metadata.openGraph = {
            ...metadata.openGraph,
            type: 'profile'
        };
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                          IMAGES                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    const fallbackImage = `${baseUrl}/img/logo-light.png`;

    if (config.images && config.images.length > 0) {
        metadata.openGraph = {
            ...metadata.openGraph,
            images: config.images.map((img) => ({
                url: img,
                width: 1200,
                height: 630,
                alt: title
            }))
        };
        metadata.twitter = {
            ...metadata.twitter,
            images: config.images
        };
    } else if (config.imageUrl) {
        metadata.openGraph = {
            ...metadata.openGraph,
            images: [
                {
                    url: config.imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title
                }
            ]
        };
        metadata.twitter = {
            ...metadata.twitter,
            images: [config.imageUrl]
        };
    } else {
        metadata.openGraph = {
            ...metadata.openGraph,
            images: [
                {
                    url: fallbackImage,
                    width: 1200,
                    height: 630,
                    alt: 'Cookhound'
                }
            ]
        };
        metadata.twitter = {
            ...metadata.twitter,
            images: [fallbackImage]
        };
    }

    return metadata;
}

/**
 * Generates basic localized metadata
 *
 * @param cookies - The request cookies
 * @param headers - The request headers
 * @param titleKey - Translation key for the title
 * @param descriptionKey - Translation key for the description
 * @param params - Optional parameters for translation
 * @returns Promise<Metadata>
 */
export async function simpleLocalizedMetadata(
    cookies: ReadonlyRequestCookies,
    headers: Headers,
    titleKey: I18nMessage,
    descriptionKey: I18nMessage,
    params?: Record<string, string | number | boolean>
): Promise<Metadata> {
    return getLocalizedMetadata(cookies, headers, {
        titleKey,
        descriptionKey,
        params
    });
}
