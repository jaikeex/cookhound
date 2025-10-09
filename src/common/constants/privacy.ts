export const PRIVACY_VERSION = '2025-10-07';

export type PRIVACY_CONTENT_TYPE = {
    title: string;
    content: {
        title?: string;
        content: string;
    }[];
};

export const PRIVACY_TITLE = 'Zásady ochrany osobních údajů pro cookhound.com';
export const PRIVACY_TIMESTAMP = 'Datum účinnosti: 7. října 2025';

export const PRIVACY_CONTENT = [
    {
        title: '',
        content: [
            {
                content: `Ochrana vašich osobních údajů je pro nás na prvním místě. Cílem těchto zásad je poskytnout vám transparentní informace o tom, jaké osobní údaje shromažďujeme, proč je shromažďujeme, jak s nimi nakládáme a jaká jsou vaše práva v souladu s Nařízením Evropského parlamentu a Rady (EU) 2016/679 o ochraně fyzických osob v souvislosti se zpracováním osobních údajů a o volném pohybu těchto údajů (dále jen "GDPR").`
            }
        ]
    },
    {
        title: '1. Správce osobních údajů',
        content: [
            {
                content: `Správcem vašich osobních údajů je provozovatel těchto webových stránek:
Cookhound
Kontakt: jaikeex@cookhound.com
(dále jen "správce")`
            }
        ]
    },
    {
        title: '2. Jaké osobní údaje zpracováváme a proč?',
        content: [
            {
                content: `Zpracováváme pouze údaje, které jsou nezbytné pro fungování našich služeb, plnění našich povinností a zlepšování vašeho uživatelského zážitku. Osobní údaje jsou z pohledu GDPR jakékoliv informace, které vedou k identifikaci konkrétní osoby, což může být jméno, e-mail, ale i IP adresa.`
            },
            {
                title: '2.1. Údaje, které nám poskytujete při registraci a používání služeb:',
                content: `Identifikační a kontaktní údaje: e-mailová adresa, uživatelské jméno.
Účel: Vedení uživatelského účtu, komunikace ohledně správy účtu, zasílání notifikací souvisejících se službou.
Právní základ: Plnění smlouvy (poskytování služby dle našich podmínek).
Obsah, který nahráváte: Recepty, fotografie, a další obsah, který se rozhodnete sdílet.
Účel: Zveřejnění vámi poskytnutého obsahu v rámci služby.
Právní základ: Plnění smlouvy.`
            },
            {
                title: '2.2. Údaje shromažďované automaticky:',
                content: `Technické údaje a údaje o používání: IP adresa, typ a verze prohlížeče.
Účel: Zajištění funkčnosti a bezpečnosti webu, analýza návštěvnosti pro zlepšování našich služeb, prevence podvodů.
Právní základ: Oprávněný zájem na zajištění bezpečnosti a optimalizaci našich služeb.`
            }
        ]
    },
    {
        title: '3. Využití externích služeb (zpracovatelé)',
        content: [
            {
                content: `Pro zajištění některých funkcí využíváme specializované služby třetích stran, které vystupují v roli zpracovatelů osobních údajů. S těmito zpracovateli máme uzavřené smlouvy, které zajišťují ochranu vašich údajů v souladu s GDPR.
Google (Google Cloud Platform, Gmail): Využíváme pro hosting našich serverů (CDN, logging) a pro odesílání e-mailů (např. potvrzení registrace, reset hesla). Google zpracovává data v zabezpečených datových centrech.
OpenAI: Využíváme služby pro automatickou moderaci nahrávaného obsahu (proti nevhodným příspěvkům) a pro generování návrhů a doporučení v rámci našich služeb. Společnost OpenAI se řídí platnými předpisy na ochranu soukromí, včetně GDPR.`
            }
        ]
    },
    {
        title: '4. Předávání osobních údajů do třetích zemí (mimo EU)',
        content: [
            {
                content: `Vzhledem k tomu, že společnosti Google a OpenAI sídlí v USA, může při využívání jejich služeb docházet k předávání osobních údajů do Spojených států.
Toto předávání je právně ošetřeno na základě rozhodnutí Evropské komise o odpovídající úrovni ochrany, známé jako EU-U.S. Data Privacy Framework. Tento rámec zajišťuje, že americké společnosti, které se k němu přihlásily, poskytují úroveň ochrany osobních údajů srovnatelnou s tou v EU.`
            }
        ]
    },
    {
        title: '5. Cookies',
        content: [
            {
                content: `Naše webové stránky používají soubory cookies. Cookies jsou malé textové soubory, které se ukládají do vašeho zařízení a pomáhají nám zajistit správnou funkci webu, analyzovat návštěvnost a zlepšovat naše služby.
Nezbytné (funkční) cookies: Jsou nutné pro základní fungování webu (např. přihlášení uživatele). K jejich použití nepotřebujeme váš souhlas.
Cookies spojené s nastavením aplikace : Umožní nám zapamatovat si vaše nastavení (např. tmavý režim). K jejich použití potřebujeme váš aktivní souhlas.
Analytické cookies: Pomáhají nám pochopit, jak návštěvníci používají naše stránky. K jejich použití potřebujeme váš aktivní souhlas.
Marketingové cookies: Pomáhají nám přizpůsobit reklamu a měřit její efektivitu. K jejich použití potřebujeme váš aktivní souhlas.
Podrobné informace o používaných cookies a možnostech jejich nastavení naleznete {{link:modal:cookies}}zde{{/link}}.`
            }
        ]
    },
    {
        title: '6. Doba uchovávání údajů',
        content: [
            {
                content: `Vaše osobní údaje uchováváme pouze po dobu nezbytně nutnou k účelům, pro které byly shromážděny:
Údaje spojené s vaším uživatelským účtem jsou uchovávány po dobu trvání vaší registrace. V případě zrušení účtu jsou údaje smazány nebo anonymizovány v přiměřené lhůtě.
Technické logy a analytická data jsou uchovávána po omezenou dobu potřebnou pro bezpečnostní analýzu a statistické vyhodnocení.`
            }
        ]
    },
    {
        title: '7. Vaše práva v souvislosti s ochranou osobních údajů',
        content: [
            {
                content: `V souladu s GDPR máte následující práva:
Právo na přístup: Můžete požádat o potvrzení, zda a jaké vaše osobní údaje zpracováváme, a o kopii těchto údajů.
Právo na opravu: Pokud jsou vaše údaje nepřesné nebo neúplné, máte právo na jejich opravu.
Právo na vymazání: Můžete požádat o smazání svých osobních údajů, pokud již nejsou potřebné pro dané účely, odvoláte svůj souhlas nebo jsou zpracovávány nezákonně.
Právo na omezení zpracování: Můžete požádat o omezení zpracování vašich údajů v určitých případech.
Právo na přenositelnost údajů: Máte právo získat své osobní údaje ve strukturovaném, běžně používaném a strojově čitelném formátu.
Právo vznést námitku: Můžete vznést námitku proti zpracování údajů na základě našeho oprávněného zájmu.
Pokud chcete uplatnit některé z těchto práv, kontaktujte nás prostřednictvím {{link:/contact}}tohoto formuláře{{/link}}.
Máte také právo podat stížnost u dozorového úřadu, kterým je Úřad pro ochranu osobních údajů (ÚOOÚ), se sídlem Pplk. Sochora 27, 170 00 Praha 7, web: {{link:https://www.uoou.cz}}www.uoou.cz{{/link}}.`
            }
        ]
    },
    {
        title: '8. Zabezpečení osobních údajů',
        content: [
            {
                content: `Přijali jsme vhodná technická a organizační opatření, abychom vaše osobní údaje chránili před ztrátou, zneužitím, neoprávněným přístupem nebo zveřejněním. Patří mezi ně například šifrování, řízení přístupů a další bezpečnostní postupy.`
            }
        ]
    },
    {
        title: '9. Změny těchto zásad',
        content: [
            {
                content: `Tyto zásady ochrany osobních údajů můžeme čas od času aktualizovat. O jakýchkoli podstatných změnách vás budeme informovat na našich webových stránkách nebo e-mailem. Doporučujeme vám pravidelně kontrolovat tuto stránku pro nejnovější informace o našich postupech ochrany osobních údajů.`
            }
        ]
    }
];
