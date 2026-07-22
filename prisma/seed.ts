import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/server/db/generated/prisma/client';
import { RECIPE_CATEGORY_TAGS } from '../src/common/constants/tags/tags';
import { CS_TAG_CATEGORIES } from '../src/common/constants/tags/cs';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // Create system user for anonymized content
    await prisma.$executeRaw`
        INSERT INTO users (id, username, email, auth_type, role, status, email_verified, created_at, updated_at)
        VALUES (-1, 'anonymous', 'anonymous@cookhound.com', 'local', 'user', 'active', true, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
    `;

    // Reset the sequence to ensure new users start from 10, not -1
    await prisma.$executeRaw`
        SELECT setval(pg_get_serial_sequence('users', 'id'), GREATEST(10, (SELECT MAX(id) FROM users WHERE id > 0)), true);
    `;

    console.log('✅ System user created (id: -1)');

    // Czech display names are index-aligned with RECIPE_CATEGORY_TAGS per category
    const csNameFor = (category: string, index: number): string | undefined =>
        (CS_TAG_CATEGORIES as Record<string, readonly string[]>)[category]?.[
            index
        ];

    for (const [categorySlug, tags] of Object.entries(RECIPE_CATEGORY_TAGS)) {
        const category = await prisma.tagCategory.upsert({
            where: { name: categorySlug },
            update: {},
            create: { name: categorySlug }
        });

        // Upsert each tag under the category with its Czech display name.
        // Name goes into both halves so renames in constants propagate on reseed.
        for (const [index, tagSlug] of tags.entries()) {
            const name =
                csNameFor(categorySlug, index) ?? tagSlug.replace(/-/g, ' ');

            await prisma.tag.upsert({
                where: { slug: tagSlug },
                update: { categoryId: category.id, name },
                create: { slug: tagSlug, categoryId: category.id, name }
            });
        }
    }

    console.log('✅ Tags and categories seeded successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
