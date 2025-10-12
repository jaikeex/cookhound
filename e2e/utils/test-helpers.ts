const TEST_API_BASE = 'http://192.168.0.143:3000/api/test';

export function generateTestUser() {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 10000);
    const username = `testuser_${timestamp}_${randomId}`;
    const email = `test_${timestamp}_${randomId}@example.com`;
    const password = 'TestPassword123!';

    return {
        username,
        email,
        password,
        repeatPassword: password,
        termsAccepted: true
    };
}

export async function cleanupTestUser(email: string): Promise<void> {
    try {
        const response = await fetch(`${TEST_API_BASE}/cleanup-user`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://192.168.0.143:3000',
                'Referer': 'http://192.168.0.143:3000/'
            },
            body: JSON.stringify({ email })
        });

        // 204 No Content is the success response
        // 404 is also acceptable (user already deleted or doesn't exist)
        if (response.status !== 204 && response.status !== 404) {
            console.warn(
                `Cleanup warning: ${response.status} ${response.statusText}`
            );
        }
    } catch (error) {
        console.warn('Failed to cleanup test user:', error);
        // Don't throw here
    }
}

export async function waitForEmailProcessing(ms: number = 1000): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createVerifiedTestUser() {
    const testUser = generateTestUser();

    try {
        const registerResponse = await fetch(
            `${TEST_API_BASE.replace('/api/test', '/api/users')}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Origin: 'http://192.168.0.143:3000',
                    Referer: 'http://192.168.0.143:3000/'
                },
                body: JSON.stringify({
                    username: testUser.username,
                    email: testUser.email,
                    password: testUser.password,
                    termsAccepted: testUser.termsAccepted
                })
            }
        );

        if (!registerResponse.ok) {
            throw new Error(
                `Failed to register user: ${registerResponse.status}`
            );
        }

        const tokenResponse = await fetch(`${TEST_API_BASE}/verify-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Origin: 'http://192.168.0.143:3000',
                Referer: 'http://192.168.0.143:3000/'
            },
            body: JSON.stringify({ email: testUser.email })
        });

        if (!tokenResponse.ok) {
            throw new Error(
                `Failed to get verification token: ${tokenResponse.status}`
            );
        }

        const { token } = await tokenResponse.json();

        const verifyResponse = await fetch(
            `${TEST_API_BASE.replace('/api/test', '/api/users')}/verify-email?token=${token}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Origin: 'http://192.168.0.143:3000',
                    Referer: 'http://192.168.0.143:3000/'
                }
            }
        );

        if (!verifyResponse.ok) {
            throw new Error(`Failed to verify email: ${verifyResponse.status}`);
        }

        return testUser;
    } catch (error) {
        await cleanupTestUser(testUser.email);
        throw error;
    }
}

export const invalidTestData = {
    emptyEmail: '',
    invalidEmail: 'not-an-email',
    shortPassword: '123',
    weakPassword: 'password', // no uppercase or number
    longUsername: 'a'.repeat(50),
    shortUsername: 'ab',
    invalidUsername: 'test@user', // contains invalid characters
    mismatchedPasswords: {
        password: 'TestPassword123!',
        repeatPassword: 'DifferentPassword123!'
    }
};
