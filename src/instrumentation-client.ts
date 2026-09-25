import { reportClientError } from '@/client/error/report';

// Errors caught by React error boundaries are reported by ErrorBoundaryTemplate instead.

window.addEventListener('error', (event) => {
    // Cross-origin scripts surface as "Script error." with no error object; nothing to report.
    if (!event.error) {
        return;
    }

    reportClientError(event.error, 'window-error');
});

window.addEventListener('unhandledrejection', (event) => {
    reportClientError(event.reason, 'unhandled-rejection');
});
