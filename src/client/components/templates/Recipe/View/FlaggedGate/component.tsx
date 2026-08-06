'use client';

import React from 'react';
import { useAuth } from '@/client/store';
import { Loader } from '@/client/components/atoms/Loader';
import { FlaggedTemplate } from '@/client/components/templates/Error/Flagged';

export type RecipeFlaggedGateProps = React.PropsWithChildren<
    Readonly<{
        authorId: number;
    }>
>;

export const RecipeFlaggedGate: React.FC<RecipeFlaggedGateProps> = ({
    authorId,
    children
}) => {
    const { authResolved, user } = useAuth();

    // The route is ISR'd, so the prerendered document always resolves this gate with
    // no user. Deciding before auth lands would serve the author of the recipe the
    // public takedown screen for the duration of the session request, then swap it
    // for their own appeal view, hold the decision until actually known.
    if (!authResolved) {
        return (
            <div className="flex justify-center pt-10">
                <Loader />
            </div>
        );
    }

    const isAuthor = !!user?.id && user.id === authorId;

    return isAuthor ? (
        <React.Fragment>{children}</React.Fragment>
    ) : (
        <FlaggedTemplate />
    );
};
