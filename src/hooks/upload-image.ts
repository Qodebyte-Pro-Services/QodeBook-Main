// you can delete this file if you want, created this for testing

import { useMutation } from '@tanstack/react-query';
import { productApi } from '../lib/api';
import { toast } from 'sonner';

function useUploadImage() {
    return useMutation({
        mutationKey: ['upload-image'],
        mutationFn: async (file: File) => {
            if (!file) {
                throw new Error("No file provided for upload.");
            }
            const formData = new FormData();
            formData.append('file', file);

            const response = await productApi.uploadFile(formData);
            return response.data;
        },
        onError: (error) => {
            toast.error('Failed to upload image. Please try again.');
            console.error('Upload error:', error);
        },
        onSuccess: () => {
            toast.success('Image uploaded successfully!');
        }
    });
};

export default useUploadImage;