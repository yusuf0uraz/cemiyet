import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config/api';

type UploadType = 'avatar' | 'event' | 'club';

/**
 * Bir dosyayı Cloudflare R2'ye yükler.
 * @param uri - expo-image-picker'dan gelen yerel dosya URI'si
 * @param type - yükleme tipi ('avatar' | 'event' | 'club')
 * @returns R2 üzerindeki public URL
 */
export async function uploadImage(uri: string, type: UploadType): Promise<string> {
  const endpoint = ENDPOINTS.upload[type];

  const fileName = uri.split('/').pop() ?? 'image.jpg';
  const mimeType = fileName.endsWith('.png') ? 'image/png'
    : fileName.endsWith('.webp') ? 'image/webp'
    : 'image/jpeg';

  const formData = new FormData();
  formData.append('file', {
    uri,
    name: fileName,
    type: mimeType,
  } as any);

  const { data } = await apiClient.post<{ url: string }>(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });

  return data.url;
}
