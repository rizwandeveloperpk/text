import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './client';

export async function uploadConversionImage(file: File, ownerId: string): Promise<string> {
  const path = `conversions/${ownerId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}
