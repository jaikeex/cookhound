export type ViewPortVariant = 'desktop' | 'mobile';

export type SnackbarVariant = 'success' | 'error' | 'info';

export type AlertPayload = {
    message: string;
    variant: SnackbarVariant;
};

export type ProfileNavigationItem = {
    param: string;
    label: string;
};
