import { ENV_CONFIG_PRIVATE } from '@/common/constants';
import { Logger } from '@/server/logger';
import type { NtfyMessage } from './types';

//|=============================================================================================|//

const LOG_CONTEXT = 'ntfy-client';
const log = Logger.getInstance(LOG_CONTEXT);

const DEFAULT_NTFY_URL = 'https://ntfy.sh';
const PUBLISH_TIMEOUT_IN_MILLISECONDS = 5000;

/**
 * ntfy.sh publisher for push notifications.
 *
 * Notifications are pure telemetry. No method here should ever throw an error
 * because a push could not be enqueued.
 */
class NtfyClient {
    get isConfigured(): boolean {
        return Boolean(ENV_CONFIG_PRIVATE.NTFY_TOPIC);
    }

    /**
     * Publishes a single message to the configured ntfy topic.
     *
     * @param msg - The notification to send.
     * @returns true only when ntfy accepted the message.
     */
    async publish(msg: NtfyMessage): Promise<boolean> {
        const topic = ENV_CONFIG_PRIVATE.NTFY_TOPIC;

        if (!topic) {
            return false;
        }

        const baseUrl = ENV_CONFIG_PRIVATE.NTFY_URL || DEFAULT_NTFY_URL;

        try {
            const response = await fetch(`${baseUrl}/${topic}`, {
                method: 'POST',
                body: msg.message,
                headers: {
                    Title: msg.title,
                    Priority: String(msg.priority),
                    ...(msg.tags?.length ? { Tags: msg.tags.join(',') } : {})
                },
                signal: AbortSignal.timeout(PUBLISH_TIMEOUT_IN_MILLISECONDS)
            });

            if (!response.ok) {
                log.warn('publish - ntfy rejected message', {
                    status: response.status,
                    title: msg.title
                });
            }

            return response.ok;
        } catch (error: unknown) {
            log.warn('publish - ntfy request failed', {
                error,
                title: msg.title
            });

            return false;
        }
    }
}

const ntfyClient = new NtfyClient();
export default ntfyClient;
