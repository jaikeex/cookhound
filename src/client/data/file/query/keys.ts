import type { UseMutationOptions } from '@tanstack/react-query';
import type { FileForUpload, FileUploadResponse } from '@/common/types';
import type { RequestError } from '@/client/error';

//~---------------------------------------------------------------------------------------------~//
//$                                            KEYS                                             $//
//~---------------------------------------------------------------------------------------------~//

const FILE_NAMESPACE_QUERY_KEY = 'file';

export const FILE_QUERY_KEYS = Object.freeze({
    namespace: FILE_NAMESPACE_QUERY_KEY
});

//~---------------------------------------------------------------------------------------------~//
//$                                          TYPES                                              $//
//~---------------------------------------------------------------------------------------------~//

export type UploadRecipeImageOptions = Omit<
    UseMutationOptions<FileUploadResponse, RequestError, FileForUpload>,
    'mutationFn'
>;

export type UploadAvatarImageOptions = Omit<
    UseMutationOptions<FileUploadResponse, RequestError, FileForUpload>,
    'mutationFn'
>;
