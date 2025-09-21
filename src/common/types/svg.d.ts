declare module '*.svg' {
    import type * as React from 'react';

    const SVGComponent: React.FC<
        React.SVGProps<SVGSVGElement> & { title?: string }
    >;

    export default SVGComponent;
}
