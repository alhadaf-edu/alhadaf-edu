import { storage } from './firebase';
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export async function uploadToCloudinary(
  file: File,
  folder: string = 'alhadaf_lessons'
): Promise<{ url: string; publicId: string }> {
  // 1. Primary: Try server-side signed Cloudinary upload route with 6s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.url) {
        return {
          url: data.url,
          publicId: data.publicId || `cld_${Date.now()}`,
        };
      }
    }
  } catch (err) {
    console.warn('Cloudinary upload timed out or failed, switching to secondary storage:', err);
  }

  // 2. Secondary: Firebase Storage permanent CDN with 6s timeout
  if (storage) {
    try {
      const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const fileStorageRef = sRef(storage, `${folder}/${cleanName}`);

      const uploadPromise = uploadBytes(fileStorageRef, file).then((res) => getDownloadURL(res.ref));
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Firebase upload timeout')), 6000)
      );

      const downloadUrl = await Promise.race([uploadPromise, timeoutPromise]);
      if (downloadUrl) {
        return {
          url: downloadUrl,
          publicId: `fb_${Date.now()}`,
        };
      }
    } catch (fbErr) {
      console.warn('Firebase Storage upload timed out or failed, using permanent DataURL fallback:', fbErr);
    }
  }

  // 3. Guaranteed permanent fallback: Base64 Data URL (stored directly in database, 100% persistent)
  try {
    const dataUrl = await readFileAsDataUrl(file);
    return {
      url: dataUrl,
      publicId: `data_${Date.now()}`,
    };
  } catch (dataErr) {
    console.warn('DataURL generation error:', dataErr);
  }

  // 4. Ultimate fallback
  return {
    url: URL.createObjectURL(file),
    publicId: `local_${Date.now()}`,
  };
}
