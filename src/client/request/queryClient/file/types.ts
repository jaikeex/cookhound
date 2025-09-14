import type { FileForUpload, FileUploadResponse } from '@/common/types';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { RequestError } from '@/client/error';

//~---------------------------------------------------------------------------------------------~//
//$                                         TYPES                                              $//
//~---------------------------------------------------------------------------------------------~//

export type UploadRecipeImageOptions = Omit<
    UseMutationOptions<FileUploadResponse, RequestError, FileForUpload>,
    'mutationFn'
>;

export type UploadAvatarImageOptions = Omit<
    UseMutationOptions<FileUploadResponse, RequestError, FileForUpload>,
    'mutationFn'
>;
