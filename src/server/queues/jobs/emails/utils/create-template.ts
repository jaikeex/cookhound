/**
 * Generic strongly-typed e-mail template definition.
 *
 * @template Args – arguments forwarded to the template body renderer
 */
export interface MailTemplate<Args extends unknown[] = []> {
    subject: string;
    body: (...args: Args) => string;
}

/**
 * Renders a template's subject and body.
 *
 * @param template – Template object containing the subject and body renderer.
 * @param args – Arguments forwarded to the body generator.
 */
export function createTemplate<Args extends unknown[]>(
    template: MailTemplate<Args>,
    ...args: Args
): { subject: string; html: string } {
    return { subject: template.subject, html: template.body(...args) };
}
