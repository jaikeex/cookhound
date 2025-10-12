import { ENV_CONFIG_PRIVATE, isE2ETestMode } from '@/common/constants/env';

import smtpClient from './smtpClient';
import gmailClient from './gmailClient';
import noopClient from './noopClient';

const envToClient = {
    gmail: gmailClient,
    smtp: smtpClient
};

// Use NoopMailClient during E2E testing to prevent real emails from being sent
const selectedClient = isE2ETestMode()
    ? noopClient
    : envToClient[ENV_CONFIG_PRIVATE.MAIL_DRIVER as keyof typeof envToClient];

export { selectedClient as mailClient };
export default selectedClient;
