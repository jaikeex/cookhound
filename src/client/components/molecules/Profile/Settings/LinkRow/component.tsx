import { Typography } from '@/client/components/atoms';
import Link from 'next/link';
import * as React from 'react';

type LinkRowProps = Readonly<{
    className?: string;
    heading: string;
    href: string;
    linkText: string;
}>;

export const LinkRow: React.FC<LinkRowProps> = ({
    className,
    heading,
    href,
    linkText
}) => {
    return (
        <div className={className}>
            <Typography variant="heading-xs" className="font-semibold">
                {heading}
            </Typography>

            <Typography variant="body-sm" className="self-start mt-2">
                <Link href={href} aria-label={linkText}>
                    {linkText}
                </Link>
            </Typography>
        </div>
    );
};
