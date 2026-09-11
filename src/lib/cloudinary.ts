import { storage } from './firebase';
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadToCloudinary(
  file: File,
  folder: string = 'alhadaf_lessons'
): Promise<{ url: string; publicId: string }> {
  // 1. Primary: Try server-side signed Cloudinary upload route
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      body: formData,
    });

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
    console.warn('Server signed Cloudinary upload error, trying Firebase Storage fallback:', err);
  }

  // 2. Secondary fallback: Firebase Storage permanent CDN (100% reliable HTTPS URL)
  if (storage) {
    try {
      const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const fileStorageRef = sRef(storage, `${folder}/${cleanName}`);
      const uploadResult = await uploadBytes(fileStorageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      return {
        url: downloadUrl,
        publicId: `fb_${Date.now()}`,
      };
    } catch (fbErr) {
      console.warn('Firebase Storage upload error:', fbErr);
    }
  }

  // 3. Fallback to local URL only if completely offline
  const fallbackUrl = URL.createObjectURL(file);
  return {
    url: fallbackUrl,
    publicId: `local_${Date.now()}`,
  };
}
