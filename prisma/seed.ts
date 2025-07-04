import { PrismaClient } from '@prisma/client';
import { RECIPE_CATEGORY_TAGS } from '../src/common/constants/tags';

const prisma = new PrismaClient();

async function main() {
    for (const [categorySlug, tags] of Object.entries(RECIPE_CATEGORY_TAGS)) {
        const category = await prisma.tagCategory.upsert({
            where: { name: categorySlug },
            update: {},
            create: { name: categorySlug }
        });

        // Upsert each tag under the category
        for (const tagSlug of tags) {
            await prisma.tag.upsert({
                where: { name: tagSlug },
                update: { categoryId: category.id },
                create: { name: tagSlug, categoryId: category.id }
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
    });
