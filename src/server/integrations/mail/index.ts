import { ENV_CONFIG_PRIVATE } from '@/common/constants/env';

import smtpClient from './smtpClient';
import gmailClient from './gmailClient';

const envToClient = {
    gmail: gmailClient,
    smtp: smtpClient
};

const selectedClient =
    envToClient[ENV_CONFIG_PRIVATE.MAIL_DRIVER as keyof typeof envToClient];

export { selectedClient as mailClient };
export default selectedClient;
