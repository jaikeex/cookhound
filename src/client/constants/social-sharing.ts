import type { IconName } from '@/client/types';

export type SocialPlatform = 'facebook' | 'twitter' | 'copy';

export type SocialShareConfig = Readonly<{
    name: string;
    icon: IconName;
    className: string;
    generateUrl: (url: string, title: string, description?: string) => string;
}>;

export const SOCIAL_PLATFORMS: Record<SocialPlatform, SocialShareConfig> = {
    facebook: {
        name: 'Facebook',
        icon: 'facebook',
        className: 'text-[#1877F2]',
        generateUrl: (url: string) => {
            const encodedUrl = encodeURIComponent(url);
            return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        }
    },
    twitter: {
        name: 'X (Twitter)',
        icon: 'twitter',
        className: 'text-[#000000] dark:text-gray-200',
        generateUrl: (url: string, title: string) => {
            const encodedUrl = encodeURIComponent(url);
            const encodedText = encodeURIComponent(title);
            return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        }
    },
    copy: {
        name: 'Copy Link',
        icon: 'link',
        className: 'text-gray-700 dark:text-gray-300',
        generateUrl: (url: string) => url
    }
};

export const DEFAULT_SHARE_PLATFORMS: SocialPlatform[] = [
    'facebook',
    'twitter',
    'copy'
];
