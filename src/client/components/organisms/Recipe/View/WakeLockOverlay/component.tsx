'use client';

import React, { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { WakeLockToggle } from '@/client/components/molecules/WakeLockToggle';
import { TOP_NAVBAR_ACTIONS_SLOT_ID } from '@/client/constants';

//?—————————————————————————————————————————————————————————————————————————————————————————?//
//?                                  WHY A PORTAL                                           ?//
///
//# The toggle is shown in the top navigation, but the navigation lives in the root layout
//# and outlives every page. Rendering it there directly would tie the wake lock to the
//# navbar's lifetime; portalling it from the recipe view keeps ownership here, so leaving
//# the recipe unmounts the toggle and releases the lock.
///
//?—————————————————————————————————————————————————————————————————————————————————————————?//

/**
 * The slot element never changes once the navbar is mounted, so there is
 * nothing to subscribe to. React still re-reads the snapshot after hydration,
 * which is when the slot first becomes reachable.
 */
const subscribe = () => () => {};

const getSlot = () => document.getElementById(TOP_NAVBAR_ACTIONS_SLOT_ID);

const getServerSlot = () => null;

/**
 * Places the wake lock toggle into the mobile top navigation, to the left of
 * the profile button. The slot is `md:hidden`, so the toggle is mobile-only.
 */
export const RecipeWakeLockOverlay: React.FC = () => {
    const slot = useSyncExternalStore(subscribe, getSlot, getServerSlot);

    if (!slot) return null;

    return createPortal(<WakeLockToggle />, slot);
};
