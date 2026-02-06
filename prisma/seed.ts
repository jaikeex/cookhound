import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/server/db/generated/prisma/client';
import { RECIPE_CATEGORY_TAGS } from '../src/common/constants/tags/tags';
import { EN_TAG_CATEGORIES } from '../src/common/constants/tags/en';
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

    // Build quick lookup for translations based on index order across category arrays
    const getTranslation = (
        category: string,
        index: number,
        lang: 'en' | 'cs'
    ): string | undefined => {
        if (lang === 'en') {
            return (EN_TAG_CATEGORIES as any)[category]?.[index];
        }
        if (lang === 'cs') {
            return (CS_TAG_CATEGORIES as any)[category]?.[index];
        }
        return undefined;
    };

    for (const [categorySlug, tags] of Object.entries(RECIPE_CATEGORY_TAGS)) {
        const category = await prisma.tagCategory.upsert({
            where: { name: categorySlug },
            update: {},
            create: { name: categorySlug }
        });

        // Upsert each tag under the category
        for (const [index, tagSlug] of tags.entries()) {
            const tag = await (prisma as any).tag.upsert({
                where: { slug: tagSlug },
                update: { categoryId: category.id },
                create: { slug: tagSlug, categoryId: category.id }
            });

            // English translation – from constants (fallback derive from slug)
            const englishName =
                getTranslation(categorySlug, index, 'en') ||
                tagSlug.replace(/-/g, ' ');

            await (prisma as any).tagTranslation.upsert({
                where: { tagId_language: { tagId: tag.id, language: 'en' } },
                update: { name: englishName },
                create: { tagId: tag.id, language: 'en', name: englishName }
            });

            // Czech translation – attempt to use parsed list if present
            const csName = getTranslation(categorySlug, index, 'cs');
            if (csName) {
                await (prisma as any).tagTranslation.upsert({
                    where: {
                        tagId_language: { tagId: tag.id, language: 'cs' }
                    },
                    update: { name: csName },
                    create: { tagId: tag.id, language: 'cs', name: csName }
                });
            }
        }
    }

    console.log('✅ Tags, translations and categories seeded successfully');
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
