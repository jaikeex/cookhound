import OpenAI from 'openai';
import { ENV_CONFIG_PRIVATE } from '@/common/constants';
import { deferClientInTestMode } from '@/server/integrations/deferClientInTestMode';

const openai = deferClientInTestMode(
    'OpenAI',
    () => new OpenAI({ apiKey: ENV_CONFIG_PRIVATE.OPENAI_API_KEY })
);

export default openai;
