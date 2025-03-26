import type { ObjectSchema } from 'yup';
import { ValidationError } from 'yup';

export const validateFormData = async (
    formData: any,
    schema: ObjectSchema<AnyObject>
): Promise<Record<string, string>> => {
    try {
        await schema.validate(formData, { abortEarly: false, strict: true });
        return {}; // No validation errors
    } catch (error) {
        const validationErrors: Record<string, string> = {};
        if (error instanceof ValidationError) {
            error.inner.forEach((err) => {
                if (err.path && err.path in formData) {
                    validationErrors[err.path] = err.message;
                }
            });
        } else {
            throw error;
        }
        return validationErrors;
    }
};
