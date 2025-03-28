export type FileForUpload = {
    bucket: string;
    bytes: number[];
    content_type: string;
    file_name: string;
};

export type FileUploadResponse = {
    object_url: string;
};
