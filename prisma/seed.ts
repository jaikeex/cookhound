import { PrismaClient } from '@prisma/client';
import { RECIPE_CATEGORY_TAGS } from '../src/common/constants/tags/tags';
import { EN_TAG_CATEGORIES } from '../src/common/constants/tags/en';
import { CS_TAG_CATEGORIES } from '../src/common/constants/tags/cs';

const prisma = new PrismaClient();

async function main() {
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
    });
