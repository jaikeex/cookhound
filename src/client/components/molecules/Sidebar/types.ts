export interface SidebarAnimations {
    position: string;
    show: string;
    hide: string;
}

export type SidebarPosition = 'left' | 'right' | 'top' | 'bottom';

export interface SidebarConfig {
    backdropAnimations?: SidebarAnimations;
    closeOnPathnameChange?: boolean;
    enableOutsideClick?: boolean;
    paramKey?: string;
    position?: SidebarPosition;
    sidebarAnimations?: SidebarAnimations;
    useMobileParams?: boolean;
}
