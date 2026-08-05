import { CATEGORY_IDS } from '@/common/constants/tags';
import type { CategoryId, RecipeTagCategory } from '@/common/types';
import type { HubDbSlug } from './slugs';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                      TAG HUB CONTENT                                        ?//
///
//# Hand-written content for the hub pages at /recepty/<slug>. Tags without an entry
//# fall back to a generated title/intro (see buildHubTitle / buildHubIntro below), which is
//# grammatically safe but generic; hubs only become indexable once they pass the recipe-count
//# threshold, and the important ones should have a real entry here by then.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

export type HubContent = Readonly<{
    title?: string;
    intro?: string;
    shortLabel?: string;
}>;

export const HUB_CONTENT: Partial<Record<HubDbSlug, HubContent>> = {
    'dessert': {
        title: 'Recepty na dezerty',
        intro: 'Chuť na něco sladkého? Projděte si recepty na dezerty — od rychlých pohárů po pečené moučníky. U každého receptu najdete přesný postup, seznam surovin i hodnocení ostatních kuchařů.'
    },
    'soup': {
        title: 'Recepty na polévky',
        intro: 'Poctivá polévka je základ. Vyberte si z receptů na vývary, krémové polévky i sytá jídla z jednoho hrnce — vždy se seznamem surovin a postupem krok za krokem.'
    },
    'main-course': {
        title: 'Hlavní chody — recepty',
        intro: 'Inspirace na oběd i večeři. Recepty na hlavní chody od rychlých jídel po sváteční pečeně, včetně časové náročnosti a počtu porcí.'
    },
    'salad': {
        title: 'Recepty na saláty',
        intro: 'Lehké i syté saláty na každou příležitost — jako příloha, svačina nebo samostatné jídlo. Každý recept obsahuje kompletní seznam surovin a postup.'
    },
    'breakfast': {
        title: 'Recepty na snídani',
        intro: 'Dobrý den začíná dobrou snídaní. Sladké i slané recepty na snídani, od rychlých variant do deseti minut po víkendové speciality.'
    },
    'dinner': {
        title: 'Recepty na večeři',
        intro: 'Co dnes k večeři? Recepty na rychlé večeře po práci i na pomalé víkendové vaření.'
    },
    'snack': {
        title: 'Recepty na svačiny',
        intro: 'Rychlé svačiny do práce, do školy i na cesty. Sladké i slané recepty, které zvládnete připravit dopředu.'
    },
    'cake': {
        title: 'Recepty na dorty',
        intro: 'Recepty na dorty ke každé oslavě — od nepečených po patrové. Postup krok za krokem, aby se dílo povedlo napoprvé.'
    },
    'pie': {
        title: 'Recepty na koláče',
        intro: 'Koláče na plech i do formy: kynuté, křehké i tvarohové. Recepty s přesnými poměry surovin a postupem.'
    },
    'baking': {
        title: 'Recepty na pečení',
        intro: 'Recepty na pečení sladké i slané. Od chleba po cukroví, s tipy na teploty a časy, aby vám v troubě nic neuteklo.'
    },
    'healthy': {
        title: 'Zdravé recepty',
        intro: 'Zdravé recepty plné zeleniny, bílkovin a chuti. Vaření, které dává tělu smysl — bez zbytečných kompromisů.'
    },
    'quick-prep': {
        title: 'Rychlé recepty',
        intro: 'Když je čas to nejcennější: recepty s rychlou přípravou, hotové během chvíle a bez dlouhého stání u plotny.'
    },
    'beginner-friendly': {
        title: 'Recepty pro začátečníky',
        intro: 'Recepty vhodné pro začátečníky — jednoduché postupy, běžné suroviny a jasné kroky, u kterých se nedá nic zkazit.'
    },
    'gluten-free': {
        title: 'Bezlepkové recepty',
        intro: 'Bezlepkové recepty, které chutnají všem. Sladké i slané, s jasně označenými surovinami bez lepku.'
    },
    'vegetarian': {
        title: 'Vegetariánské recepty',
        intro: 'Vegetariánské recepty od rychlých obědů po sváteční menu. Bez masa, ale rozhodně ne bez chuti.'
    },
    'vegan': {
        title: 'Veganské recepty',
        intro: 'Veganské recepty čistě z rostlinných surovin. Snídaně, hlavní chody i dezerty bez živočišných produktů.'
    },
    'czech': {
        title: 'Česká kuchyně — recepty',
        intro: 'Klasiky české kuchyně tak, jak je znáte od babičky — svíčková, knedlíky, buchty i nedělní pečeně. S postupy, které zvládne každý.'
    },
    'italian': {
        title: 'Italská kuchyně — recepty',
        intro: 'Itálie na vašem talíři: těstoviny, rizoto, pizza i dolce. Recepty italské kuchyně z běžně dostupných surovin.'
    },
    'middle-eastern': {
        title: 'Kuchyně Blízkého východu — recepty',
        shortLabel: 'Kuchyně Blízkého východu'
    },
    'spring': { title: 'Jarní recepty' },
    'summer': { title: 'Letní recepty' },
    'autumn': { title: 'Podzimní recepty' },
    'winter': { title: 'Zimní recepty' },
    'holiday': { title: 'Sváteční recepty' },
    'christmas': {
        title: 'Vánoční recepty',
        intro: 'Vánoční recepty od cukroví po štědrovečerní večeři. Vše na jednom místě, ať máte svátky bez stresu.'
    },
    'easter': { title: 'Velikonoční recepty' }
};

//|=============================================================================================|//

export const HUB_UI = {
    emptyState:
        'V této kategorii zatím žádné recepty nejsou. Zkuste to prosím později — nebo buďte první, kdo sem recept přidá.',
    relatedHeading: 'Další kategorie',
    refineFilter: 'Upřesnit ve filtru receptů',
    paginationLabel: 'Stránkování',
    breadcrumbHome: 'Domů'
} as const;

//|=============================================================================================|//

/**
 * Copy for the hub index at /recepty. The category headings are deliberately
 * not CATEGORY_TRANSLATIONS - those are the tag picker's labels ('Druh jídla'),
 * which read as form fields rather than as page sections.
 */
export const HUB_INDEX_UI = {
    title: 'Recepty podle kategorií',
    intro: 'Všechny kategorie receptů na jednom místě. Vyberte si podle druhu jídla, kuchyně, hlavní ingredience, sezóny, náročnosti nebo diety.',
    emptyState:
        'Kategorie se objeví, jakmile v nich bude dost receptů. Zkuste to prosím později, nebo buďte první, kdo sem recept přidá.',
    categoryHeadings: {
        cuisine: 'Recepty podle kuchyně',
        difficulty: 'Recepty podle náročnosti',
        season: 'Recepty podle sezóny',
        definedBy: 'Recepty podle hlavní ingredience',
        type: 'Recepty podle druhu jídla',
        diet: 'Recepty podle diety'
    }
} as const satisfies {
    title: string;
    intro: string;
    emptyState: string;
    categoryHeadings: Record<RecipeTagCategory, string>;
};

/**
 * Accessible label for a hub link on the index, where the recipe count renders
 * as a bare number next to the hub's short label.
 */
export const buildHubIndexLinkLabel = (
    label: string,
    recipeCount: number
): string => {
    // Czech: 1 "recept", 2-4 "recepty", 5+ "receptů".
    const noun =
        recipeCount === 1 ? 'recept' : recipeCount < 5 ? 'recepty' : 'receptů';

    return `${label} — ${recipeCount} ${noun}`;
};

const capitalize = (value: string): string =>
    value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Builds the hub page title (h1 and <title> without the site suffix).
 *
 * @param dbSlug - The db tag slug
 * @param csName - The czech tag name (Tag.name, e.g. 'dezert')
 * @param categoryId - The tag's category, used to pick a grammatical fallback
 */
export const buildHubTitle = (
    dbSlug: HubDbSlug,
    csName: string,
    categoryId: CategoryId
): string => {
    const override = HUB_CONTENT[dbSlug]?.title;
    if (override) {
        return override;
    }

    if (categoryId === CATEGORY_IDS.cuisine) {
        return `${capitalize(csName)} kuchyně — recepty`;
    }

    return `Recepty — ${capitalize(csName)}`;
};

/**
 * Builds the short label for a hub's link on the /recepty index, where the full
 * title ('Recepty na dezerty') would repeat the section heading in every chip.
 *
 * The czech tag name is not usable on its own: it is stored lowercase, and the
 * cuisine names are bare adjectives ('italská') that need their noun to read as
 * a category. Hubs whose name does not fit that rule carry a `shortLabel`.
 *
 * @param dbSlug - The db tag slug
 * @param csName - The czech tag name (Tag.name, e.g. 'dezert')
 * @param categoryId - The tag's category, used to pick a grammatical fallback
 */
export const buildHubShortLabel = (
    dbSlug: HubDbSlug,
    csName: string,
    categoryId: CategoryId
): string => {
    const override = HUB_CONTENT[dbSlug]?.shortLabel;
    if (override) {
        return override;
    }

    if (categoryId === CATEGORY_IDS.cuisine) {
        return `${capitalize(csName)} kuchyně`;
    }

    return capitalize(csName);
};

/**
 * Builds the hub intro paragraph (also used as the meta description).
 */
export const buildHubIntro = (dbSlug: HubDbSlug, csName: string): string =>
    HUB_CONTENT[dbSlug]?.intro ??
    `Vyberte si z receptů v kategorii ${csName}. U každého receptu najdete seznam surovin, postup krok za krokem a hodnocení ostatních kuchařů.`;
