/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from './axios';

export const productApi = {
  getCategoryOptions: async () => {
    return axiosInstance.get('/api/categories');
  },
  createProduct: async (data: any) => {
    return axiosInstance.post('/api/products', data);
  },
  uploadFile: async (formData: FormData) => {
    return axiosInstance.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};