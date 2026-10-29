import axios from 'axios';
import { api } from './api';
import { extractApiErrorMessage } from './authService';

export type StorageFolder = 'avatars' | 'products' | 'stores';

export interface UploadResponsePayload {
  content_type: string;
  filename: string;
  size: number;
  url: string;
}

export interface UploadApiResponse {
  code: number;
  status: string;
  message: string;
  payload: UploadResponsePayload;
}

/**
 * Upload an image file (JPEG, PNG, WebP) to Supabase Storage via backend API.
 * Uses extended 60s timeout to allow large file transfers and storage roundtrip.
 * @param file The image file object to upload
 * @param folder Target folder: 'avatars', 'products', or 'stores' (default: 'avatars')
 * @returns Promise resolving to UploadResponsePayload with the public URL
 */
export async function uploadImage(
  file: File,
  folder: StorageFolder = 'avatars'
): Promise<UploadResponsePayload> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Format file tidak didukung. Harap gunakan format JPEG, PNG, atau WebP.');
  }

  const maxSize = folder === 'products' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
  if (file.size > maxSize) {
    const maxMb = folder === 'products' ? '5 MB' : '2 MB';
    throw new Error(`Ukuran file melebihi batas maksimal ${maxMb}.`);
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post<UploadApiResponse>(
      '/api/v1/storage/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 detik khusus untuk proses upload file
      }
    );

    const payload = response.data?.payload;
    if (!payload || !payload.url) {
      throw new Error('Gagal mendapatkan URL gambar dari respon server.');
    }

    return payload;
  } catch (err) {
    if (axios.isAxiosError(err) && (err.code === 'ECONNABORTED' || err.message?.includes('timeout'))) {
      throw new Error('Waktu unggah habis (koneksi lambat). Silakan periksa jaringan dan coba lagi.');
    }
    const message = extractApiErrorMessage(err, 'Gagal mengunggah gambar ke server.');
    throw new Error(message);
  }
}
