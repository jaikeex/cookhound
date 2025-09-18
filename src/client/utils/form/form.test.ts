import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validateFormData } from './validate';

describe('validateFormData', () => {
    it('should return empty object when validation passes', async () => {
        const schema = z.object({
            name: z.string().trim().min(1),
            age: z.number().positive().int()
        });

        const formData = { name: 'John', age: 25 };
        const result = await validateFormData(formData, schema);

        expect(result).toEqual({});
    });

    it('should return validation errors when validation fails', async () => {
        const schema = z.object({
            name: z.string().trim().min(1),
            age: z.number().positive().int()
        });

        const formData = { name: '', age: -5 };
        const result = await validateFormData(formData, schema);

        expect(Object.keys(result).length).toBeGreaterThan(0);
        expect(result.name).toBeDefined();
        expect(result.age).toBeDefined();
    });

    it('should handle custom error messages', async () => {
        const schema = z.object({
            email: z
                .email('Invalid email format')
                .trim()
                .min(1, 'Email is required')
        });

        const formData = { email: 'invalid' };
        const result = await validateFormData(formData, schema);

        expect(result.email).toBe('Invalid email format');
    });
});
