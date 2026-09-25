export type ViewPortVariant = 'desktop' | 'mobile';

export type SnackbarVariant = 'success' | 'error' | 'info';

export type SnackbarPosition = 'top' | 'bottom';

export type Theme = 'light' | 'dark';

export type AlertAction = {
    href: string;
    label: string;
};

export type AlertPayload = {
    action?: AlertAction;
    message: string;
    variant: SnackbarVariant;
    position?: SnackbarPosition;
};

export type ProfileNavigationItem = {
    param: ProfileTab;
    label: string;
    content: React.ReactNode | null;
};

export type RecipeFormMode = 'create' | 'edit';

export enum ProfileTab {
    Dashboard = 'dashboard',
    Recipes = 'recipes',
    Cookbooks = 'cookbooks'
}
