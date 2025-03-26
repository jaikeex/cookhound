import { describe, it, expect, vi } from 'vitest';
import * as yup from 'yup';
import { validateFormData } from './validate';

describe('Form data validation', () => {
    it('validates form data correctly with no errors', async () => {
        const schema = yup.object().shape({
            name: yup.string().required(),
            age: yup.number().required().positive().integer()
        });
        const formData = {
            name: 'John Doe',
            age: 30
        };

        const result = await validateFormData(formData, schema);
        expect(result).toEqual({});
    });

    it('returns errors for invalid data', async () => {
        const schema = yup.object().shape({
            name: yup.string().required(),
            age: yup.number().required().positive().integer()
        });
        const formData = {
            name: '', // Invalid as it's required
            age: -10 // Invalid as it must be positive
        };

        const result = await validateFormData(formData, schema);
        expect(result).toHaveProperty('name');
        expect(result.name).toContain('required');
        expect(result).toHaveProperty('age');
        expect(result.age).toContain('positive');
    });

    it('handles cases where validation throws non-validation errors', async () => {
        const schema = {
            validate: vi.fn().mockRejectedValue(new Error('Unexpected error'))
        };
        const formData = {
            name: 'John Doe',
            age: 30
        };

        await expect(validateFormData(formData, schema as any)).rejects.toThrow(
            'Unexpected error'
        );
    });

    it('ignores validation errors for fields not in formData', async () => {
        const schema = yup.object().shape({
            email: yup.string().email().required()
        });
        const formData = {}; // No 'email' key present in formData

        const result = await validateFormData(formData, schema);
        expect(result).toEqual({});
    });
});
