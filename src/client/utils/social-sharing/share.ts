import type { SocialPlatform } from '@/client/constants';
import { SOCIAL_PLATFORMS } from '@/client/constants';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';

/**
 * Opens a social sharing window/link
 *
 * @param platform - The social platform to share to
 * @param url - The URL to share
 * @param title - The title/text to share
 * @param description - Optional description for platforms that support it
 */
export function shareToSocial(
    platform: SocialPlatform,
    url: string,
    title: string,
    description?: string
): void {
    const config = SOCIAL_PLATFORMS[platform];

    if (!config) {
        return;
    }

    const shareUrl = config.generateUrl(url, title, description);

    if (platform === 'copy') {
        copyToClipboard(url);
        return;
    }

    window.open(
        shareUrl,
        'share-dialog',
        `width=${window.screen.width},height=${window.screen.height},location=0,scrollbars=1,resizable=1`
    );
}

/**
 * Copies text to clipboard
 *
 * @param text - The text to copy
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        const data = [
            new ClipboardItem({
                'text/plain': new Blob([text], { type: 'text/plain' })
            })
        ];

        await navigator.clipboard.write(data);
        return true;
    } catch (error: unknown) {
        return false;
    }
}

export function isWebShareSupported(): boolean {
    return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Shares using the native Web Share API on mobile devices
 *
 * @param title - The title to share
 * @param text - The text to share
 * @param url - The URL to share
 * @returns Promise that resolves to true if successful
 */
export async function shareNative(
    title: string,
    text: string,
    url: string
): Promise<boolean> {
    if (!isWebShareSupported()) {
        return false;
    }

    try {
        await navigator.share({
            title,
            text,
            url
        });

        return true;
    } catch (error: unknown) {
        return false;
    }
}

/**
 * Gets the full URL for sharing
 *
 * @param path - The path to share (can be relative or absolute)
 * @returns Full URL
 */
export function getShareUrl(path: string): string {
    if (typeof window === 'undefined') {
        return path;
    }

    // If already absolute URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    const url = new URL(path, ENV_CONFIG_PUBLIC.ORIGIN);
    return url.toString();
}
