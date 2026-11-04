import apiClient from '../client';
import { UploadResponse } from '../types';

export type StorageFolder = 'avatars' | 'products' | 'stores';

export const storageApi = {
  /**
   * Upload a single image file to cloud storage
   * POST /api/v1/storage/upload
   */
  async uploadImage(
    file: File,
    folder: StorageFolder = 'products'
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await apiClient.post<UploadResponse>('/api/v1/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  /**
   * Upload multiple image files to cloud storage
   * POST /api/v1/storage/upload-multiple
   */
  async uploadMultipleImages(
    files: File[],
    folder: StorageFolder = 'products'
  ): Promise<UploadResponse[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('folder', folder);

    const res = await apiClient.post<UploadResponse[]>(
      '/api/v1/storage/upload-multiple',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  },
};

export default storageApi;
