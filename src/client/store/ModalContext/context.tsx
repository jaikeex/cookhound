'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState
} from 'react';
import ReactDOM from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { classNames } from '@/client/utils';
import { IconButton } from '@/client/components';
import { generateRandomId } from '@/client/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useParamsChangeListener } from '@/client/hooks';

const MODAL_PARAM_KEY = 'modal';

//~=============================================================================================~//
//$                                            TYPES                                            $//
//~=============================================================================================~//

type ModalRenderer = (close: () => void) => React.ReactNode;

type ModalOptions = Readonly<{
    hideCloseButton?: boolean;
    disableBackdropClick?: boolean;
}>;

interface Modal {
    id: string;
    renderer: ModalRenderer;
    options?: ModalOptions;
}

interface ModalContextType {
    openModal: (
        content: React.ReactNode | ModalRenderer,
        options?: ModalOptions
    ) => string;
    closeModal: (id: string) => void;
    closeAll: () => void;
}

//~=============================================================================================~//
//$                                          PROVIDER                                           $//
//~=============================================================================================~//

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

type ModalProviderProps = React.PropsWithChildren<NonNullable<unknown>>;

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
    const [modals, setModals] = useState<Modal[]>([]);

    const router = useRouter();
    const searchParams = useSearchParams();

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    //$                                        ROUTER                                           $//
    ///
    //# What follows is a somewhat simplified implementation of the same routing logic that
    //# the sidebar uses. Opening a modal pushes new query params into the url, in order for
    //# the browser back navigation to simply close the modal without changing the page.
    //# This (unlike sidebar's version) is enabled for both mobile and desktop screens.
    ///
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

    /**
     * This ref is used as a lock to ensure router.back() is only called ONCE per
     * modal-closing cycle. Without it, closeModal → router.back() triggers a
     * params change which could call closeAll(), resulting in a second
     * router.back() invocation and therefore navigating back multiple pages.
     */
    const isNavigatingBackRef = useRef(false);

    const closeModal = useCallback(
        (id: string) => {
            setModals((current) => {
                const newModals = current.filter((m) => m.id !== id);

                // If this was the last open modal, navigate back to clear the query param state
                if (
                    newModals.length === 0 &&
                    searchParams.get(MODAL_PARAM_KEY) &&
                    !isNavigatingBackRef.current
                ) {
                    isNavigatingBackRef.current = true;
                    router.back();
                }

                return newModals;
            });
        },
        [router, searchParams]
    );

    const closeAll = useCallback(() => {
        setModals([]);

        if (searchParams.get(MODAL_PARAM_KEY) && !isNavigatingBackRef.current) {
            isNavigatingBackRef.current = true;
            router.back();
        }
    }, [router, searchParams]);

    const openModal = useCallback(
        (content: React.ReactNode | ModalRenderer, options?: ModalOptions) => {
            const id = generateRandomId(6);

            const renderer: ModalRenderer =
                typeof content === 'function'
                    ? (close) => (content as ModalRenderer)(close)
                    : () => content;

            setModals((current) => [...current, { id, renderer, options }]);

            if (!searchParams.get(MODAL_PARAM_KEY)) {
                const params = new URLSearchParams(searchParams);
                params.set(MODAL_PARAM_KEY, id);
                router.push(`?${params.toString()}`, { scroll: false });
            }

            return id;
        },
        [router, searchParams]
    );

    const handleClose = useCallback(
        (id: string) => () => closeModal(id),
        [closeModal]
    );

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    //$                              URL PARAM CHANGE LISTENER                                 $//
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

    const handleParamsChange = useCallback(() => {
        const hasParam = searchParams.get(MODAL_PARAM_KEY);

        // Case 1: URL contains the param but no modal is open → remove the param.
        if (hasParam && modals.length === 0) {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete(MODAL_PARAM_KEY);
            router.replace(currentUrl.pathname + (currentUrl.search || ''));
        }

        // Case 2: URL no longer contains the param while a modal is open → close all modals.
        if (!hasParam && modals.length > 0) {
            closeAll();
        }

        // Reset the navigation lock once the URL param state reflects reality
        if (!hasParam) {
            isNavigatingBackRef.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modals, searchParams]);

    useParamsChangeListener({
        key: MODAL_PARAM_KEY,
        onChange: handleParamsChange
    });

    const value = useMemo(
        () => ({ openModal, closeModal, closeAll }),
        [openModal, closeModal, closeAll]
    );

    return (
        <ModalContext.Provider value={value}>
            {children}
            {typeof window !== 'undefined' &&
                ReactDOM.createPortal(
                    <AnimatePresence initial={false}>
                        {modals.map(({ id, renderer, options }) => (
                            <ModalWrapper
                                key={id}
                                onClose={handleClose(id)}
                                {...options}
                            >
                                {renderer(handleClose(id))}
                            </ModalWrapper>
                        ))}
                    </AnimatePresence>,
                    document.body
                )}
        </ModalContext.Provider>
    );
};

//~=============================================================================================~//
//$                                       MODAL WRAPPER                                         $//
//~=============================================================================================~//

type ModalWrapperProps = Readonly<{
    onClose: () => void;
}> &
    React.PropsWithChildren<NonNullable<unknown>> &
    ModalOptions;

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
};

const ModalWrapper: React.FC<ModalWrapperProps> = ({
    children,
    onClose,
    hideCloseButton,
    disableBackdropClick
}) => {
    return (
        <motion.div
            className="fixed inset-0 z-1000 flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            {/* Overlay */}
            <motion.div
                variants={backdropVariants}
                className="absolute inset-0 bg-black/50 backdrop-blur-xs"
                onClick={disableBackdropClick ? undefined : onClose}
            />

            {/* Modal */}
            <motion.div
                variants={modalVariants}
                className={classNames(
                    'relative z-10 overflow-y-auto rounded-md py-8 px-2 md:px-6',
                    'max-h-[95dvh] max-w-[95dvw] md:max-h-[80dvh] md:max-w-[80dvw] ',
                    'bg-teal-50 dark:bg-slate-900'
                )}
            >
                {hideCloseButton ? null : (
                    <IconButton
                        onClick={onClose}
                        icon="close"
                        size={24}
                        className={classNames('absolute top-4 right-4')}
                    />
                )}
                {children}
            </motion.div>
        </motion.div>
    );
};
