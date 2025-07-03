'use client';

import React from 'react';
import { Reorder } from 'framer-motion';

type DraggableListProps = Readonly<{
    className?: string;
    onReorder: (values: number[]) => void;
    values: number[];
}> &
    React.PropsWithChildren<NonNullable<unknown>>;

export const DraggableList: React.FC<DraggableListProps> = ({
    children,
    className,
    onReorder,
    values
}) => {
    return (
        <Reorder.Group
            className={`space-y-2 ${className}`}
            axis={'y'}
            onReorder={onReorder}
            values={values}
        >
            {children}
        </Reorder.Group>
    );
};
