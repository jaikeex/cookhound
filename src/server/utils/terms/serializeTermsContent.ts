import {
    TERMS_TITLE,
    TERMS_TIMESTAMP,
    TERMS_CONTENT
} from '@/common/constants';

/**
 * Serializes the terms content into a consistent, deterministic string
 * that can be used for hash generation.
 *
 * @returns A deterministic string representation of the terms content
 */
export function serializeTermsContent(): string {
    const parts: string[] = [];

    parts.push(TERMS_TITLE.trim());
    parts.push(TERMS_TIMESTAMP.trim());

    for (const section of TERMS_CONTENT) {
        parts.push(section.title.trim());

        for (const contentItem of section.content) {
            if (contentItem.title) {
                parts.push(contentItem.title.trim());
            }
            parts.push(contentItem.content.trim());
        }
    }

    return parts.join('\n').replace(/\s+/g, ' ').trim();
}
