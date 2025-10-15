import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePathnameChangeListener, useEventListener } from '@/client/hooks';

type UseUnsavedChangesWarningOptions = {
    hasUnsavedChanges: boolean;
    message?: string;
    onNavigationAttempt?: () => void;
    enableLinkInterception?: boolean;
};

export const useUnsavedChangesWarning = ({
    hasUnsavedChanges,
    message,
    onNavigationAttempt,
    enableLinkInterception = true
}: UseUnsavedChangesWarningOptions) => {
    const router = useRouter();

    const isNavigatingRef = useRef(false);
    const hasUnsavedChangesRef = useRef(hasUnsavedChanges);

    useEffect(() => {
        //§—————————————————————————————————————————————————————————————————————————————————————§//
        //§                                       WARNING                                       §//
        ///
        //# Setting negative value here is NOT allowed, as it would enable the calling
        //# component to possibly manipulate the state through shitty implementation.
        //# If, for example, the hasUnsavedChanges argument would be based on formData placeholder
        //# object or some inputs would be excluded from the check, the user could be fucked.
        //#
        //# This does not prevent every unwanted passes and is still heavily dependent on
        //# the hook being used right, but is the safest/simplest method i was able to find.
        ///
        //§—————————————————————————————————————————————————————————————————————————————————————§//

        if (hasUnsavedChanges) hasUnsavedChangesRef.current = hasUnsavedChanges;
    }, [hasUnsavedChanges]);

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    //$                                   EXTERNAL NAVIGATION                                   $//
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

    //?—————————————————————————————————————————————————————————————————————————————————————————?//
    //?                                   EXTERNAL NAVIGATION                                   ?//
    ///
    //# This handles 'external' navigation events through the 'beforeunload' event listener.
    //#
    //§ This *DOES NOT* prevent back and forward browser navigation if the destination is also
    //§ on cookhound. This is true on mobile and desktop, at least in chrome.
    //? On that note, catching internal back/forward navigation sounds easy on docs and paper,
    //? but i was not able to make it work and could not be bothered to try harder.
    //? If I come here wanting to try in the future, this seems like a good start:
    //? https://github.com/vercel/next.js/discussions/49532
    //? https://github.com/vercel/next.js/discussions/75454
    ///
    //?—————————————————————————————————————————————————————————————————————————————————————————?//

    const handleBeforeUnload = useCallback(
        (e: BeforeUnloadEvent) => {
            if (hasUnsavedChangesRef.current && !isNavigatingRef.current) {
                e.preventDefault();
                e.returnValue = message;
                onNavigationAttempt?.();
                return message;
            }
        },
        [message, onNavigationAttempt]
    );

    useEventListener('beforeunload', handleBeforeUnload);

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    //$                                          LINKS                                          $//
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

    const handleLinkClick = (e: MouseEvent) => {
        ///---------------------------------------------------------------------------------///
        ///                                     CHECKS                                      ///
        ///---------------------------------------------------------------------------------///

        if (!enableLinkInterception) return;
        if (!hasUnsavedChangesRef.current || isNavigatingRef.current) return;

        const target = e.target as HTMLElement;
        const link = target.closest('a');

        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        ///---------------------------------------------------------------------------------///
        ///                                  WHAT TO TRACK                                  ///
        ///---------------------------------------------------------------------------------///

        /**
         * This should be everything that is worth tracking...
         *
         * Probably overkill and overengineered, given it's not customizable from the outside
         * and the requirements are hardly ever going to change, but i like this "APPROACH"
         * so it is left here to be admired.
         */

        const isHash = href.startsWith('#');
        const isComms = href.startsWith('mailto:') || href.startsWith('tel:');

        const isBlank = href.startsWith('_blank');

        const isExternal =
            href.startsWith('http') && !href.startsWith(window.location.origin);

        const isInternal =
            href.startsWith('/') || href.startsWith(window.location.origin);

        /**
         * Move the criteria as much as needed
         */

        const conditionsToIgnore = [isHash, isComms, isBlank, isExternal];
        const conditionsToMatch = [isInternal];

        /**
         * Returning undefined should simply continue propagating the event as normal,
         * no other logic necessary.
         */
        if (conditionsToIgnore.some((condition) => condition)) {
            return;
        }

        //USER WOULD LOOSE EVERYTHING!!! BURN IT DOWN!
        if (conditionsToMatch.some((condition) => condition)) {
            // Actually just ask if it is ok to loose everything
            const shouldNavigate = window.confirm(message);

            if (!shouldNavigate) {
                // If not, BURN IT DOWN!
                e.preventDefault();
                e.stopPropagation();
                onNavigationAttempt?.();
                return;
            }

            // Else just fuck it...
            isNavigatingRef.current = true;
        }
    };

    useEventListener('click', handleLinkClick, undefined, true);

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    //$                               LISTEN TO PATHNAME CHANGES                                $//
    ///
    //# Reset the navigation ref to false when the navigation is finished.
    ///
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

    const handleInternalNavigation = useCallback(() => {
        isNavigatingRef.current = false;
    }, []);

    usePathnameChangeListener({
        onChange: handleInternalNavigation
    });

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    //$                                           API                                           $//
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

    /**
     * Sets all relevant state needed to allow navigation.
     *
     *
     * This is the intended way of enabling the following safe router methods.
     * Updating unsavedChanges manually to false from outside would have basically the
     * same effect, but this signals to the hook that the calling form has done
     * all operations with the data it needed to do and is ready to loose them by allowing the
     * user
     */
    const allowNavigation = useCallback(() => {
        //?—————————————————————————————————————————————————————————————————————————————————————?//
        //?                                   IMPORTANT INFO                                    ?//
        ///
        //# This is the intended way of enabling the following safe router methods.
        //#
        //# Updating unsavedChanges manually to false from outside is prevented because it
        //# would basically have the same effect, but calling this function signals to the hook
        //# that the calling form has done all operations with the data it needed to do and is
        //# ready to loose them by allowing the user to navigate elsewhere.
        ///
        //?—————————————————————————————————————————————————————————————————————————————————————?//

        isNavigatingRef.current = true;
        hasUnsavedChangesRef.current = false;
    }, []);

    /**
     * Better push method that checks for unsaved changes before calling the router.
     * If any changes are found, prompts the user first.
     */
    const safePush = useCallback(
        (href: string) => {
            if (hasUnsavedChangesRef.current) {
                const shouldNavigate = window.confirm(message);
                if (!shouldNavigate) {
                    onNavigationAttempt?.();
                    return;
                }
            }
            isNavigatingRef.current = true;
            router.push(href);
        },
        [router, message, onNavigationAttempt]
    );

    /**
     * Better back method that checks for unsaved changes before calling the router.
     * If any changes are found, prompts the user first.
     */
    const safeBack = useCallback(() => {
        if (hasUnsavedChangesRef.current) {
            const shouldNavigate = window.confirm(message);
            if (!shouldNavigate) {
                onNavigationAttempt?.();
                return;
            }
        }
        isNavigatingRef.current = true;
        router.back();
    }, [router, message, onNavigationAttempt]);

    /**
     * Better replace method that checks for unsaved changes before calling the router.
     * If any changes are found, prompts the user first.
     */
    const safeReplace = useCallback(
        (href: string) => {
            if (hasUnsavedChangesRef.current) {
                const shouldNavigate = window.confirm(message);
                if (!shouldNavigate) {
                    onNavigationAttempt?.();
                    return;
                }
            }
            isNavigatingRef.current = true;
            router.replace(href);
        },
        [router, message, onNavigationAttempt]
    );

    /**
     * Better refresh method that checks for unsaved changes before calling the router.
     * If any changes are found, prompts the user first.
     */
    const safeRefresh = useCallback(() => {
        if (hasUnsavedChangesRef.current) {
            const shouldNavigate = window.confirm(message);
            if (!shouldNavigate) {
                onNavigationAttempt?.();
                return;
            }
        }
        isNavigatingRef.current = true;
        router.refresh();
    }, [router, message, onNavigationAttempt]);

    return {
        allowNavigation,
        safePush,
        safeBack,
        safeReplace,
        safeRefresh
    };
};
