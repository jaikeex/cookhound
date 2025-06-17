import { ENV_CONFIG_PRIVATE } from '@/common/constants';
import { googleApiService } from './googleApiService';

class GoogleService {
    async uploadRecipeImage(fileName: string, data: number[] | BodyInit) {
        const bucket = ENV_CONFIG_PRIVATE.GOOGLE_STORAGE_BUCKET_RECIPE_IMAGES;

        // Convert array of numbers to Buffer if needed
        const binaryData = Array.isArray(data) ? Buffer.from(data) : data;

        const response = await googleApiService
            .getStorageService()
            .upload(fileName, binaryData, bucket, 'image/webp');

        return response;
    }
}

export const googleService = new GoogleService();
