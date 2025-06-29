import { z } from 'zod';

export const validateFormData = async <T>(
    formData: any,
    schema: z.ZodType<T>
): Promise<Record<string, string>> => {
    try {
        await schema.parseAsync(formData);
        return {}; // No validation errors
    } catch (error: unknown) {
        const validationErrors: Record<string, string> = {};

        if (error instanceof z.ZodError) {
            error.errors.forEach((err) => {
                const path = err.path.join('.');
                if (path && path in formData) {
                    validationErrors[path] = err.message;
                }
            });
        } else {
            throw error;
        }
        return validationErrors;
    }
};
