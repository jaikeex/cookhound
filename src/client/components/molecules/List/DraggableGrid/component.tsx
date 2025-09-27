'use client';

import React from 'react';
import SortableList from 'react-easy-sort';

export type DraggableGridProps = Readonly<{
    className?: string;
    onReorder: (oldIndex: number, newIndex: number) => void;
}> &
    React.PropsWithChildren<NonNullable<unknown>>;

export const DraggableGrid: React.FC<DraggableGridProps> = ({
    children,
    className,
    onReorder
}) => {
    return (
        <SortableList onSortEnd={onReorder} className={className}>
            {children}
        </SortableList>
    );
};
