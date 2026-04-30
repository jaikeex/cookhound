export const TERMS_VERSION = '2026-05-01';

export type TERMS_CONTENT_TYPE = {
    title: string;
    content: {
        title?: string;
        content: string;
    }[];
};

export const TERMS_TITLE = 'Všeobecné obchodní podmínky pro cookhound.com';
export const TERMS_TIMESTAMP = 'Datum účinnosti: 1. května 2026';

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
                    '3.4.1. obsahuje vulgární výrazy nebo jinak nevhodný jazyk neslučitelný s charakterem těchto stránek;'
            },
            {
                content:
                    '3.4.2. obsahuje jakoukoli formu nenávistných projevů namířených vůči jakékoli skupině osob, zejména na základě rasy, etnického původu, národnosti, náboženského vyznání, pohlaví, sexuální orientace, zdravotního stavu nebo jiného obdobného znaku;'
            },
            {
                content:
                    '3.4.3. obsahuje jakoukoli formu obtěžování, zastrašování nebo cíleného útoku vůči konkrétní osobě;'
            },
            {
                content:
                    '3.4.4. obsahuje popis násilného obsahu nebo jeho propagaci;'
            },
            {
                content:
                    '3.4.5. obsahuje popis, propagaci nebo návod k sebepoškozování;'
            },
            {
                content:
                    '3.4.6. popisuje, propaguje nebo navádí k činnosti, která je ve většině společností považována za nelegální;'
            },
            {
                content:
                    '3.4.7. obsahuje nebezpečné instrukce, jejichž dodržení by mohlo ohrozit zdraví nebo život uživatele či třetích osob (např. pokyny k požití toxických či nepoživatelných látek);'
            },
            {
                content:
                    '3.4.8. obsahuje osobní údaje umožňující identifikaci jakékoli fyzické osoby (jména, e-mailové adresy, telefonní čísla, poštovní adresy apod.), ať již se jedná o autora receptu nebo třetí osobu;'
            },
            {
                content:
                    '3.4.9. představuje spam, reklamu, propagaci komerčních produktů či služeb nebo jinou obdobnou formu obtěžujícího obsahu nesouvisejícího s vlastními recepty.'
            },
            {
                content:
                    '3.5. Uživatel bere na vědomí, že nahraný uživatelský obsah může být před zveřejněním nebo kdykoli po něm automatizovaně vyhodnocován (mimo jiné prostřednictvím služeb umělé inteligence uvedených v čl. 4.1) z hlediska souladu s pravidly stanovenými v čl. 3.4. Obsah, který těmto pravidlům neodpovídá, může být označen, skryt nebo odstraněn i bez předchozího upozornění.'
            },
            {
                content:
                    '3.6. Provozovatel si vyhrazuje právo, nikoli však povinnost, kontrolovat a odstraňovat uživatelský obsah, který je v rozporu s těmito podmínkami nebo platnými právními předpisy.'
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
                Využíváním služeb společností Google a OpenAI může docházet k předávání osobních údajů do Spojených států amerických. Toto předávání je založeno na rozhodnutí Evropské komise o odpovídající úrovni ochrany osobních údajů v rámci programu "Data Privacy Framework" (Rámec ochrany soukromí mezi EU a USA). Tím je zajištěna úroveň ochrany srovnatelná s ochranou v Evropské unii.
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
