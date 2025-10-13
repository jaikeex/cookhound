import React from 'react';
import Link from 'next/link';

type ParseContentLinksOptions = {
    onModalClick?: () => void;
};

/**
 * Parses content with embedded link markers and returns React nodes
 * Supports three link types:
 * - modal:cookies → button that triggers modal callback
 * - /path → Next.js Link component
 * - https://... → external anchor tag
 *
 * @param content - The content string with {{link:TARGET}}text{{/link}} markers
 * @param options - Options including modal click handler
 * @returns Array of React nodes
 */
export const parseContentLinks = (
    content: string,
    options?: ParseContentLinksOptions
): React.ReactNode[] => {
    const { onModalClick } = options || {};

    // matches {{link:TARGET}}text{{/link}}
    const linkRegex = /\{\{link:(.*?)\}\}(.*?)\{\{\/link\}\}/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let keyCounter = 0;

    while ((match = linkRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push(content.substring(lastIndex, match.index));
        }

        const target = match[1];

        if (!target || typeof target !== 'string') {
            continue;
        }

        const linkText = match[2];
        const key = `link-${keyCounter++}`;

        const linkClassName =
            'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors underline';

        if (target === 'modal:cookies') {
            parts.push(
                <button
                    key={key}
                    onClick={onModalClick}
                    className={linkClassName}
                    type="button"
                >
                    {linkText}
                </button>
            );
        } else if (
            target.startsWith('http://') ||
            target.startsWith('https://')
        ) {
            parts.push(
                <a
                    key={key}
                    href={target}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClassName}
                >
                    {linkText}
                </a>
            );
        } else {
            parts.push(
                <Link key={key} href={target} className={linkClassName}>
                    {linkText}
                </Link>
            );
        }

        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
    }

    return parts.length === 0 ? [content] : parts;
};
