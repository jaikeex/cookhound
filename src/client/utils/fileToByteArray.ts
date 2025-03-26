export const fileToByteArray = async (file: File): Promise<number[]> => {
    if (!file) return [];

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const arrayBuffer = reader.result;

            if (!arrayBuffer || typeof arrayBuffer === 'string') {
                reject('Error reading the file');
                return [];
            }

            const uint8Array = new Uint8Array(arrayBuffer);
            const byteArray = Array.from(uint8Array);
            resolve(byteArray);
        };

        reader.onerror = () => {
            reject(reader.error);
        };

        reader.readAsArrayBuffer(file);
    });
};
