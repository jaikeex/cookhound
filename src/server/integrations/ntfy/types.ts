/**
 * 1 = min, 2 = low, 3 = default, 4 = high, 5 = max.
 */
export type NtfyPriority = 1 | 2 | 3 | 4 | 5;

export type NtfyMessage = Readonly<{
    title: string;
    message: string;
    priority: NtfyPriority;
    tags?: string[];
}>;
