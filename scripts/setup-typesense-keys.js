const https = require('https');
const http = require('http');

// Load environment variables from .env file
require('dotenv').config();

/**
 * Script to create search-only API keys for Typesense after container startup
 * This should be run after Typesense container is healthy
 */

const TYPESENSE_HOST = process.env.TYPESENSE_HOST || 'localhost';
const TYPESENSE_PORT = process.env.TYPESENSE_PORT || '8108';
const TYPESENSE_PROTOCOL = process.env.TYPESENSE_PROTOCOL || 'http';
const TYPESENSE_MASTER_KEY = process.env.TYPESENSE_API_KEY;
const TYPESENSE_SEARCH_KEY = process.env.TYPESENSE_SEARCH_ONLY_KEY;

if (!TYPESENSE_MASTER_KEY) {
    console.error('TYPESENSE_API_KEY environment variable is required');
    process.exit(1);
}

async function createSearchOnlyKey(customValue = null) {
    const keyData = {
        description: 'Search-only key for client',
        actions: ['documents:search'],
        collections: ['*']
    };

    // If a custom value is provided, use it
    if (customValue) {
        keyData.value = customValue;
    }

    const requestData = JSON.stringify(keyData);
    const requestModule = TYPESENSE_PROTOCOL === 'https' ? https : http;

    const options = {
        hostname: TYPESENSE_HOST,
        port: TYPESENSE_PORT,
        path: '/keys',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestData),
            'X-TYPESENSE-API-KEY': TYPESENSE_MASTER_KEY
        }
    };

    return new Promise((resolve, reject) => {
        const req = requestModule.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    const response = JSON.parse(data);
                    console.log('✅ Search-only key created successfully');
                    console.log('Key ID:', response.id);
                    console.log('Key Value:', response.value);

                    if (!customValue) {
                        console.log('\n📝 Add this to your .env file:');
                        console.log(
                            `TYPESENSE_SEARCH_ONLY_KEY=${response.value}`
                        );
                    } else {
                        console.log('\n✅ Using your predetermined key value');
                    }
                    resolve(response);
                } else {
                    console.error('❌ Failed to create search-only key');
                    console.error('Status:', res.statusCode);
                    console.error('Response:', data);
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (err) => {
            console.error('❌ Request failed:', err.message);
            reject(err);
        });

        req.write(requestData);
        req.end();
    });
}

async function checkTypesenseHealth() {
    const requestModule = TYPESENSE_PROTOCOL === 'https' ? https : http;

    const options = {
        hostname: TYPESENSE_HOST,
        port: TYPESENSE_PORT,
        path: '/health',
        method: 'GET'
    };

    return new Promise((resolve, reject) => {
        const req = requestModule.request(options, (res) => {
            if (res.statusCode === 200) {
                console.log('✅ Typesense is healthy');
                resolve(true);
            } else {
                reject(
                    new Error(
                        `Typesense health check failed: ${res.statusCode}`
                    )
                );
            }
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
}

async function waitForTypesense(maxRetries = 30, delayMs = 2000) {
    console.log('🔍 Waiting for Typesense to be ready...');

    for (let i = 0; i < maxRetries; i++) {
        try {
            await checkTypesenseHealth();
            return true;
        } catch (error) {
            console.log(
                `⏳ Attempt ${i + 1}/${maxRetries} failed, retrying in ${delayMs}ms...`
            );
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }

    throw new Error(
        'Typesense did not become healthy within the expected time'
    );
}

async function main() {
    try {
        console.log('🚀 Setting up Typesense search-only keys...');

        // Wait for Typesense to be ready
        await waitForTypesense();

        // Create search-only key (use predetermined value if provided)
        await createSearchOnlyKey(TYPESENSE_SEARCH_KEY);

        console.log('\n✅ Setup complete!');
        console.log(
            '💡 You can now use the search-only key in your frontend application'
        );
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    createSearchOnlyKey,
    checkTypesenseHealth,
    waitForTypesense
};
