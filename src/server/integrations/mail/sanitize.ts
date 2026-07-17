/**
 * SMTP verbs whose command line is safe to log. Anything sent over the SMTP
 * wire that is NOT one of these, including single-use token links in the
 * HTML body must never reach a log sink.
 */
export const LOGGABLE_SMTP_VERBS = new Set([
    'EHLO',
    'HELO',
    'MAIL',
    'RCPT',
    'DATA',
    'AUTH',
    'QUIT',
    'RSET',
    'NOOP',
    'STARTTLS'
]);

export const OMITTED_COMMAND = '[non-verb payload omitted]';

/**
 * Produces a log-safe label for an SMTP command.
 *
 * @param command - The raw command written to the SMTP socket.
 * @returns The command's first line if it starts with a known verb, otherwise
 *   a redaction placeholder.
 */
export function describeSmtpCommand(command: string): string {
    const firstLine = command.split('\r\n')[0] ?? '';
    const verb = (firstLine.split(' ')[0] ?? '').toUpperCase();

    return LOGGABLE_SMTP_VERBS.has(verb) ? firstLine : OMITTED_COMMAND;
}
