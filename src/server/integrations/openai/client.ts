import OpenAI from 'openai';
import { ENV_CONFIG_PRIVATE } from '@/common/constants';

const openai = new OpenAI({
    apiKey: ENV_CONFIG_PRIVATE.OPENAI_API_KEY
});

export default openai;
