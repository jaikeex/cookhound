'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState
} from 'react';
import ReactDOM from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import classnames from 'classnames';
import { IconButton } from '@/client/components';
import classNames from 'classnames';

//~=============================================================================================~//
//$                                            TYPES                                            $//
//~=============================================================================================~//

type ModalRenderer = (close: () => void) => React.ReactNode;

interface Modal {
    id: string;
    renderer: ModalRenderer;
}

interface ModalContextType {
    openModal: (content: React.ReactNode | ModalRenderer) => string;
    closeModal: (id: string) => void;
    closeAll: () => void;
}

//~=============================================================================================~//
//$                                          PROVIDER                                           $//
//~=============================================================================================~//

const ModalContext = createContext({} as ModalContextType);

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

    const closeModal = useCallback((id: string) => {
        setModals((current) => current.filter((m) => m.id !== id));
    }, []);

    const closeAll = useCallback(() => setModals([]), []);

    const openModal = useCallback(
        (content: React.ReactNode | ModalRenderer) => {
            const id = makeId(6);

            const renderer: ModalRenderer =
                typeof content === 'function'
                    ? (close) => (content as ModalRenderer)(close)
                    : () => content;

            setModals((current) => [...current, { id, renderer }]);

            return id;
        },
        []
    );

    const handleClose = useCallback(
        (id: string) => () => closeModal(id),
        [closeModal]
    );

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
                        {modals.map(({ id, renderer }) => (
                            <ModalWrapper key={id} onClose={handleClose(id)}>
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
    React.PropsWithChildren<NonNullable<unknown>>;

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

const ModalWrapper: React.FC<ModalWrapperProps> = ({ children, onClose }) => {
    return (
        <motion.div
            className="fixed inset-0 z-[1000] flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            {/* Overlay */}
            <motion.div
                variants={backdropVariants}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                variants={modalVariants}
                className={classNames(
                    'relative z-10 overflow-y-auto rounded-md p-8',
                    'max-h-[95dvh] max-w-[95dvw] md:max-h-[80dvh] md:max-w-[80dvw] ',
                    'bg-teal-50 dark:bg-[#222233]'
                )}
            >
                <IconButton
                    onClick={onClose}
                    icon="close"
                    size={24}
                    className={classnames('absolute top-4 right-4')}
                />
                {children}
            </motion.div>
        </motion.div>
    );
};

//~=============================================================================================~//
//$                                           UTILS                                             $//
//~=============================================================================================~//

const makeId = (length: number) => {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
};
