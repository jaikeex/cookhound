export type ViewPortVariant = 'desktop' | 'mobile';

export type SnackbarVariant = 'success' | 'error' | 'info';

export type AlertPayload = {
    message: string;
    variant: SnackbarVariant;
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
