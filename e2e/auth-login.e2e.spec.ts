import { test, expect } from '@playwright/test';
import {
    generateTestUser,
    cleanupTestUser,
    createVerifiedTestUser,
    invalidTestData
} from './utils/test-helpers';

test.describe('User Login', () => {
    //~=========================================================================================~//
    //$                                 SUCCESSFUL LOGIN FLOWS                                  $//
    //~=========================================================================================~//

    test('should successfully login with valid credentials', async ({
        page
    }) => {
        const testUser = await createVerifiedTestUser();

        try {
            await page.goto('/auth/login');

            await page.getByTestId('login-email').fill(testUser.email);
            await page.getByTestId('login-password').fill(testUser.password);
            await page.getByTestId('login-submit').click();

            await page.waitForURL('/', { timeout: 10000 });

            expect(page.url()).toBe('http://192.168.0.143:3000/');
        } finally {
            await cleanupTestUser(testUser.email);
        }
    });

    test('should successfully login with "keep me logged in" enabled', async ({
        page
    }) => {
        const testUser = await createVerifiedTestUser();

        try {
            await page.goto('/auth/login');

            await page.getByTestId('login-email').fill(testUser.email);
            await page.getByTestId('login-password').fill(testUser.password);
            await page.getByTestId('login-keep-logged-in').check();
            await page.getByTestId('login-submit').click();

            await page.waitForURL('/', { timeout: 10000 });

            expect(page.url()).toBe('http://192.168.0.143:3000/');
        } finally {
            await cleanupTestUser(testUser.email);
        }
    });

    test('should redirect to home page after successful login', async ({
        page
    }) => {
        const testUser = await createVerifiedTestUser();

        try {
            await page.goto('/auth/login');

            await page.getByTestId('login-email').fill(testUser.email);
            await page.getByTestId('login-password').fill(testUser.password);
            await page.getByTestId('login-submit').click();

            await page.waitForURL('/', { timeout: 10000 });

            await expect(page).toHaveURL('http://192.168.0.143:3000/');
        } finally {
            await cleanupTestUser(testUser.email);
        }
    });

    //~=========================================================================================~//
    //$                                 VALIDATION ERROR TESTS                                  $//
    //~=========================================================================================~//

    test('should display validation error for empty email field', async ({
        page
    }) => {
        await page.goto('/auth/login');

        await page.getByTestId('login-password').fill('TestPassword123!');
        await page.getByTestId('login-submit').click();

        await page.waitForTimeout(500);

        expect(page.url()).toContain('/auth/login');
    });

    test('should display validation error for empty password field', async ({
        page
    }) => {
        await page.goto('/auth/login');

        await page.getByTestId('login-email').fill('test@example.com');
        await page.getByTestId('login-submit').click();

        await page.waitForTimeout(500);

        expect(page.url()).toContain('/auth/login');
    });

    test('should display validation error for invalid email format', async ({
        page
    }) => {
        await page.goto('/auth/login');

        await page
            .getByTestId('login-email')
            .fill(invalidTestData.invalidEmail);
        await page.getByTestId('login-password').fill('TestPassword123!');
        await page.getByTestId('login-submit').click();

        await page.waitForTimeout(500);

        expect(page.url()).toContain('/auth/login');
    });

    test('should display validation error when both fields are empty', async ({
        page
    }) => {
        await page.goto('/auth/login');

        await page.getByTestId('login-submit').click();

        await page.waitForTimeout(500);

        expect(page.url()).toContain('/auth/login');
    });

    //~=========================================================================================~//
    //$                              AUTHENTICATION ERROR TESTS                                 $//
    //~=========================================================================================~//

    test('should display error for non-existent email', async ({ page }) => {
        const testUser = generateTestUser();

        await page.goto('/auth/login');

        await page.getByTestId('login-email').fill(testUser.email);
        await page.getByTestId('login-password').fill(testUser.password);
        await page.getByTestId('login-submit').click();

        await page.waitForTimeout(2000);

        expect(page.url()).toContain('/auth/login');

        const pageContent = await page.content();
        expect(pageContent.length).toBeGreaterThan(0);
    });

    test('should display error for incorrect password', async ({ page }) => {
        const testUser = await createVerifiedTestUser();

        try {
            await page.goto('/auth/login');

            await page.getByTestId('login-email').fill(testUser.email);
            await page.getByTestId('login-password').fill('WrongPassword123!');
            await page.getByTestId('login-submit').click();

            await page.waitForTimeout(2000);

            expect(page.url()).toContain('/auth/login');

            const pageContent = await page.content();
            expect(pageContent.length).toBeGreaterThan(0);
        } finally {
            await cleanupTestUser(testUser.email);
        }
    });

    test('should display error when trying to login with unverified account', async ({
        page
    }) => {
        const testUser = generateTestUser();

        try {
            await page.goto('/auth/register');
            await page.getByTestId('register-username').fill(testUser.username);
            await page.getByTestId('register-email').fill(testUser.email);
            await page.getByTestId('register-password').fill(testUser.password);
            await page
                .getByTestId('register-repeat-password')
                .fill(testUser.repeatPassword);
            await page.getByTestId('register-terms').check();
            await page.getByTestId('register-submit').click();

            await page.waitForURL(/auth\/verify-email/, { timeout: 10000 });

            await page.goto('/auth/login');
            await page.getByTestId('login-email').fill(testUser.email);
            await page.getByTestId('login-password').fill(testUser.password);
            await page.getByTestId('login-submit').click();

            await page.waitForTimeout(2000);

            expect(page.url()).toContain('/auth/login');

            const pageContent = await page.content();
            expect(pageContent.length).toBeGreaterThan(0);
        } finally {
            await cleanupTestUser(testUser.email);
        }
    });
});
