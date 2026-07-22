import { CookbookVisibility, RecipeForDisplayDTO } from '@/common/types';
import { Expose } from 'class-transformer';

export class CookbookDTO {
    @Expose()
    id: number = 0;

    @Expose()
    displayId: string = '';

    @Expose()
    ownerId: number = 0;

    @Expose()
    title: string = '';

    @Expose()
    description: string | null = null;

    @Expose()
    visibility: CookbookVisibility = CookbookVisibility.PRIVATE;

    @Expose()
    coverImageUrl: string | null = null;

    @Expose()
    recipeCount: number = 0;

    @Expose()
    recipes: RecipeForDisplayDTO[] = [];

    @Expose({ groups: ['self', 'admin'] })
    createdAt?: string;

    @Expose({ groups: ['self', 'admin'] })
    updatedAt?: string;
}
