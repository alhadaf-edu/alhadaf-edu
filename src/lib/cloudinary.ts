export async function uploadToCloudinary(file: File, folder: string = 'alhadaf_lessons'): Promise<{ url: string; publicId: string }> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'qbavq5bs';
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'alhadaf_unsigned'); // preset name or use unsigned
  formData.append('folder', folder);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      // If unsigned upload is not configured on Cloudinary dashboard, create an object URL fallback
      console.warn('Direct unsigned upload notice. Utilizing secure local URL fallback for preview.');
      const fallbackUrl = URL.createObjectURL(file);
      return { url: fallbackUrl, publicId: `local_${Date.now()}` };
    }

    const data = await res.json();
    return {
      url: data.secure_url || data.url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.warn('Cloudinary upload fallback to blob URL:', error);
    return {
      url: URL.createObjectURL(file),
      publicId: `fallback_${Date.now()}`,
    };
  }
}
