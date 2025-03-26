declare global {
    type AnyObject<T = any> = Record<string, T>;
    type AnyFunction = (...args: any[]) => any;
}

export {};
