import {
    CookbookVisibility,
    RecipeForDisplayDTO,
    type Locale
} from '@/common/types';
import { DEFAULT_LOCALE } from '@/common/constants';
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
    language: Locale = DEFAULT_LOCALE;

    @Expose()
    visibility: CookbookVisibility = CookbookVisibility.PRIVATE;

    @Expose()
    coverImageUrl: string | null = null;

    @Expose()
    recipeCount: number = 0;

    @Expose()
    recipes: RecipeForDisplayDTO[] = [];

    @Expose({ groups: ['self', 'admin'] })
    createdAt: Date = new Date();

    @Expose({ groups: ['self', 'admin'] })
    updatedAt: Date = new Date();
}
