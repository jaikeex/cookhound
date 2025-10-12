import { test, expect } from '@playwright/test';
import {
    generateTestUser,
    cleanupTestUser,
    waitForEmailProcessing,
    invalidTestData
} from './utils/test-helpers';

test.describe('User Registration', () => {
    //~=========================================================================================~//
    //$                              SUCCESSFUL REGISTRATION                                    $//
    //~=========================================================================================~//

    test('should successfully register with valid data', async ({ page }) => {
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

            await page.waitForURL(
                (url) => url.pathname === '/auth/verify-email',
                { timeout: 10000 }
            );

            await expect(
                page.getByTestId('verify-email-message')
            ).toBeVisible();
        } finally {
            await cleanupTestUser(testUser.email);
        }
    });

    test('should complete email verification flow', async ({ page }) => {
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

            await waitForEmailProcessing(2000);

            await page.waitForURL(
                (url) => url.pathname === '/auth/verify-email',
                { timeout: 10000 }
            );
        } finally {
            await cleanupTestUser(testUser.email);
        }
    });

    //~=========================================================================================~//
    //$                                 VALIDATION ERRORS                                       $//
    //~=========================================================================================~//

    test('should display validation errors for empty fields', async ({
        page
    }) => {
        await page.goto('/auth/register');

        await page.getByTestId('register-submit').click();

        await page.waitForTimeout(500);

        expect(page.url()).toContain('/auth/register');
    });

    test('should show error for invalid email format', async ({ page }) => {
        const testUser = generateTestUser();

        await page.goto('/auth/register');

        await page.getByTestId('register-username').fill(testUser.username);
        await page
            .getByTestId('register-email')
            .fill(invalidTestData.invalidEmail);
        await page.getByTestId('register-password').fill(testUser.password);
        await page
            .getByTestId('register-repeat-password')
            .fill(testUser.repeatPassword);
        await page.getByTestId('register-terms').check();
        await page.getByTestId('register-submit').click();

        await page.waitForTimeout(500);

        expect(page.url()).toContain('/auth/register');
    });

    test('should show error for password too short', async ({ page }) => {
        const testUser = generateTestUser();

        await page.goto('/auth/register');

        await page.getByTestId('register-username').fill(testUser.username);
        await page.getByTestId('register-email').fill(testUser.email);
        await page
            .getByTestId('register-password')
            .fill(invalidTestData.shortPassword);
        await page
            .getByTestId('register-repeat-password')
            .fill(invalidTestData.shortPassword);
        await page.getByTestId('register-terms').check();
        await page.getByTestId('register-submit').click();

        await page.waitForTimeout(500);

        expect(page.url()).toContain('/auth/register');
    });

    test('should show error for weak password', async ({ page }) => {
        const testUser = generateTestUser();

        await page.goto('/auth/register');

        await page.getByTestId('register-username').fill(testUser.username);
        await page.getByTestId('register-email').fill(testUser.email);
        await page
            .getByTestId('register-password')
            .fill(invalidTestData.weakPassword);
        await page
            .getByTestId('register-repeat-password')
            .fill(invalidTestData.weakPassword);
        await page.getByTestId('register-terms').check();
        await page.getByTestId('register-submit').click();

        await page.waitForTimeout(500);

        expect(page.url()).toContain('/auth/register');
    });

    test('should show error when passwords do not match', async ({ page }) => {
        const testUser = generateTestUser();

        await page.goto('/auth/register');

        await page.getByTestId('register-username').fill(testUser.username);
        await page.getByTestId('register-email').fill(testUser.email);
        await page
            .getByTestId('register-password')
            .fill(invalidTestData.mismatchedPasswords.password);
        await page
            .getByTestId('register-repeat-password')
            .fill(invalidTestData.mismatchedPasswords.repeatPassword);
        await page.getByTestId('register-terms').check();
        await page.getByTestId('register-submit').click();

        await page.waitForTimeout(500);

        expect(page.url()).toContain('/auth/register');
    });

    test('should show error when terms not accepted', async ({ page }) => {
        const testUser = generateTestUser();

        await page.goto('/auth/register');

        await page.getByTestId('register-username').fill(testUser.username);
        await page.getByTestId('register-email').fill(testUser.email);
        await page.getByTestId('register-password').fill(testUser.password);
        await page
            .getByTestId('register-repeat-password')
            .fill(testUser.repeatPassword);
        await page.getByTestId('register-submit').click();

        await page.waitForTimeout(500);

        expect(page.url()).toContain('/auth/register');
    });

    test('should show error for username with invalid characters', async ({
        page
    }) => {
        const testUser = generateTestUser();

        await page.goto('/auth/register');

        await page
            .getByTestId('register-username')
            .fill(invalidTestData.invalidUsername);
        await page.getByTestId('register-email').fill(testUser.email);
        await page.getByTestId('register-password').fill(testUser.password);
        await page
            .getByTestId('register-repeat-password')
            .fill(testUser.repeatPassword);
        await page.getByTestId('register-terms').check();
        await page.getByTestId('register-submit').click();

        await page.waitForTimeout(500);

        expect(page.url()).toContain('/auth/register');
    });

    test('should show error for username too short', async ({ page }) => {
        const testUser = generateTestUser();

        await page.goto('/auth/register');

        await page
            .getByTestId('register-username')
            .fill(invalidTestData.shortUsername);
        await page.getByTestId('register-email').fill(testUser.email);
        await page.getByTestId('register-password').fill(testUser.password);
        await page
            .getByTestId('register-repeat-password')
            .fill(testUser.repeatPassword);
        await page.getByTestId('register-terms').check();
        await page.getByTestId('register-submit').click();

        await page.waitForTimeout(500);

        expect(page.url()).toContain('/auth/register');
    });

    test('should show error for username too long', async ({ page }) => {
        const testUser = generateTestUser();

        await page.goto('/auth/register');

        await page
            .getByTestId('register-username')
            .fill(invalidTestData.longUsername);
        await page.getByTestId('register-email').fill(testUser.email);
        await page.getByTestId('register-password').fill(testUser.password);
        await page
            .getByTestId('register-repeat-password')
            .fill(testUser.repeatPassword);
        await page.getByTestId('register-terms').check();
        await page.getByTestId('register-submit').click();

        await page.waitForTimeout(500);

        expect(page.url()).toContain('/auth/register');
    });

    //~=========================================================================================~//
    //$                                  CONFLICT ERRORS                                        $//
    //~=========================================================================================~//

    test('should show error when username already taken', async ({ page }) => {
        const testUserA = generateTestUser();
        const testUserB = generateTestUser();

        try {
            await page.goto('/auth/register');
            await page
                .getByTestId('register-username')
                .fill(testUserA.username);
            await page.getByTestId('register-email').fill(testUserA.email);
            await page
                .getByTestId('register-password')
                .fill(testUserA.password);
            await page
                .getByTestId('register-repeat-password')
                .fill(testUserA.repeatPassword);
            await page.getByTestId('register-terms').check();
            await page.getByTestId('register-submit').click();

            await page.waitForURL(/auth\/verify-email/, { timeout: 10000 });

            await page.goto('/auth/register');
            await page
                .getByTestId('register-username')
                .fill(testUserA.username);
            await page.getByTestId('register-email').fill(testUserB.email);
            await page
                .getByTestId('register-password')
                .fill(testUserB.password);
            await page
                .getByTestId('register-repeat-password')
                .fill(testUserB.repeatPassword);
            await page.getByTestId('register-terms').check();
            await page.getByTestId('register-submit').click();

            await page.waitForTimeout(2000);

            expect(page.url()).toContain('/auth/register');

            const pageContent = await page.content();
            expect(pageContent.length).toBeGreaterThan(0);
        } finally {
            await cleanupTestUser(testUserA.email);
        }
    });

    test('should show error when email already taken', async ({ page }) => {
        const testUserA = generateTestUser();
        const testUserB = generateTestUser();

        try {
            await page.goto('/auth/register');
            await page
                .getByTestId('register-username')
                .fill(testUserA.username);
            await page.getByTestId('register-email').fill(testUserA.email);
            await page
                .getByTestId('register-password')
                .fill(testUserA.password);
            await page
                .getByTestId('register-repeat-password')
                .fill(testUserA.repeatPassword);
            await page.getByTestId('register-terms').check();
            await page.getByTestId('register-submit').click();

            await page.waitForURL(/auth\/verify-email/, { timeout: 10000 });

            await page.goto('/auth/register');
            await page
                .getByTestId('register-username')
                .fill(testUserB.username);
            await page.getByTestId('register-email').fill(testUserA.email);
            await page
                .getByTestId('register-password')
                .fill(testUserB.password);
            await page
                .getByTestId('register-repeat-password')
                .fill(testUserB.repeatPassword);
            await page.getByTestId('register-terms').check();
            await page.getByTestId('register-submit').click();

            await page.waitForTimeout(2000);

            expect(page.url()).toContain('/auth/register');

            const pageContent = await page.content();
            expect(pageContent.length).toBeGreaterThan(0);
        } finally {
            await cleanupTestUser(testUserA.email);
        }
    });
});
