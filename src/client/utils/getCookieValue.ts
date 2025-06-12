export function getCookieValue(name: string): string | undefined {
    return document.cookie
        .match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')
        ?.pop();
}
