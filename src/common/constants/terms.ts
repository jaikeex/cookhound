import { ENV_CONFIG_PRIVATE } from './env';

export const TERMS_VERSION = '2025-10-07';

export const TERMS_HASHES = {
    '2025-10-07': ENV_CONFIG_PRIVATE.TERMS_ACCEPTANCE_HASH_V2025_10_07
} as const;

export type TERMS_CONTENT_TYPE = {
    title: string;
    content: {
        title?: string;
        content: string;
    }[];
};

export const TERMS_TITLE = 'Všeobecné obchodní podmínky pro Cookhound';
export const TERMS_TIMESTAMP = 'Účinnost od 7. října 2025';

export const TERMS_CONTENT = [
    {
        title: '1. Úvodní ustanovení',
        content: [
            {
                title: '1.1. Provozovatel',
                content: `
                Provozovatel: Cookhound, 
                Kontakt: jaikeex@cookhound.com
                (dále jen "provozovatel")`
            },
            {
                title: '1.2. Uživatel',
                content: `
                Uživatel: Jakákoli fyzická nebo právnická osoba, která navštíví webové stránky, registruje se nebo jinak využívá služby poskytované provozovatelem (dále jen "uživatel").
                `
            },
            {
                title: '1.3. Služba',
                content: `
                Služba: Služba spočívá v provozování online platformy pro sdílení a prohlížení receptů a souvisejícího obsahu. Služba je poskytována bezúplatně, pokud není výslovně uvedeno jinak.
                `
            }
        ]
    },
    {
        title: '2. Uživatelský účet',
        content: [
            {
                content:
                    '2.1. Pro plné využívání některých funkcí služby, jako je přidávání vlastních receptů, je nutná registrace uživatelského účtu.'
            },
            {
                content:
                    '2.2. Uživatel je povinen při registraci uvést pravdivé a úplné údaje a udržovat je aktuální.'
            },
            {
                content:
                    '2.3. Uživatel je odpovědný za veškeré aktivity provedené prostřednictvím jeho uživatelského účtu a je povinen chránit své přihlašovací údaje před zneužitím.'
            },
            {
                content:
                    '2.4. Provozovatel si vyhrazuje právo zrušit nebo omezit přístup k uživatelskému účtu v případě porušení těchto podmínek.'
            }
        ]
    },
    {
        title: '3. Práva a povinnosti uživatele a uživatelský obsah',
        content: [
            {
                content:
                    '3.1. Uživatelé mohou na web nahrávat vlastní obsah, zejména recepty, fotografie a komentáře (dále jen "uživatelský obsah").'
            },
            {
                content:
                    '3.2. Nahráním uživatelského obsahu na web uživatel prohlašuje, že je autorem daného obsahu nebo má veškerá potřebná oprávnění k jeho zveřejnění a udělení licence provozovateli.'
            },
            {
                content:
                    '3.3. Uživatel uděluje provozovateli nevýhradní, bezúplatnou, přenositelnou a celosvětovou licenci k použití, zobrazení, reprodukci, úpravě, distribuci a propagaci uživatelského obsahu v rámci poskytování a marketingu služby.'
            },
            {
                content:
                    '3.4. Uživatel se zavazuje, že nebude nahrávat uživatelský obsah, který:'
            },
            {
                content:
                    '3.5. Provozovatel si vyhrazuje právo, nikoli však povinnost, kontrolovat a odstraňovat uživatelský obsah, který je v rozporu s těmito podmínkami nebo platnými právními předpisy.'
            }
        ]
    },
    {
        title: '4. Využívání externích služeb a ochrana osobních údajů',
        content: [
            {
                content: `4.1. Pro zajištění a zlepšení kvality služeb využívá provozovatel externí poskytovatele. Mezi tyto poskytovatele patří:
                * Google (Google Cloud Platform, Google Fonts, Google Analytics, Gmail): Využíváno pro hosting, doručování obsahu (CDN), analýzu návštěvnosti a odesílání e-mailů.
                * OpenAI (Content Moderation, Suggestions): Využíváno pro moderaci obsahu a poskytování návrhů uživatelům.
                `
            },
            {
                title: '4.2. Ochrana osobních údajů (GDPR):',
                content: `
                Provozovatel zpracovává osobní údaje uživatelů v souladu s Nařízením Evropského parlamentu a Rady (EU) 2016/679 o ochraně fyzických osob v souvislosti se zpracováním osobních údajů a o volném pohybu těchto údajů (GDPR). Podrobné informace o zpracování osobních údajů, včetně vašich práv, naleznete v našich Zásadách ochrany osobních údajů.
                `
            },
            {
                title: '4.3. Předávání údajů do třetích zemí:',
                content: `
                Využíváním služeb společností Google a OpenAI může docházet k předávání osobních údajů do Spojených států amerických. Toto předávání je založeno na rozhodnutí Evropské komise o odpovídající úrovni ochrany osobních údajů v rámci programu "Data Privacy Framework" (Rámec ochrany soukromí mezi EU a USA).[4][5] Tím je zajištěna úroveň ochrany srovnatelná s ochranou v Evropské unii.[4]
                `
            }
        ]
    },
    {
        title: '5. Odpovědnost a omezení odpovědnosti',
        content: [
            {
                content:
                    '5.1. Provozovatel nenese odpovědnost za obsah nahrávaný uživateli. Za veškerý uživatelský obsah odpovídá uživatel, který jej na web nahrál.'
            },
            {
                content:
                    '5.2. Služba je poskytována "tak, jak je", a provozovatel neposkytuje žádné záruky ohledně její dostupnosti, spolehlivosti nebo funkčnosti. Provozovatel si vyhrazuje právo službu kdykoliv omezit, změnit nebo ukončit bez předchozího upozornění.'
            },
            {
                content:
                    '5.3. Provozovatel neodpovídá za škodu vzniklou v důsledku používání služby nebo nemožnosti jejího využití.'
            }
        ]
    },
    {
        title: '6. Závěrečná ustanovení',
        content: [
            {
                content:
                    '6.1. Provozovatel si vyhrazuje právo tyto podmínky kdykoliv změnit. O změnách bude uživatele informovat vhodným způsobem (např. e-mailem nebo oznámením na webu). Pokračováním v používání služby po nabytí účinnosti změn uživatel vyjadřuje souhlas s novým zněním podmínek.'
            }
        ]
    }
];
