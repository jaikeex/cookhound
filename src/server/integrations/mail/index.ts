import { ENV_CONFIG_PRIVATE } from '@/common/constants/env';

import smtpClient from './client';
import gmailClient from './gmailClient';

const selectedClient =
    ENV_CONFIG_PRIVATE.MAIL_DRIVER === 'gmail' ? gmailClient : smtpClient;

export { selectedClient as mailClient };
export default selectedClient;
