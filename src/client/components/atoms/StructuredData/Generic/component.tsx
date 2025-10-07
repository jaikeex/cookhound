import { serializeSchema } from '@/server/utils/seo';
import React from 'react';

type StructuredDataProps = Readonly<{
    schema: Record<string, unknown>;
    id?: string;
}>;

export const StructuredData: React.FC<StructuredDataProps> = ({
    schema,
    id
}) => {
    const jsonLd = serializeSchema(schema);

    return (
        <script
            type="application/ld+json"
            id={id}
            // This is apparently a valid use of dangerouslySetInnerHTML
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
    );
};
