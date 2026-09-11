async function getSha1Signature(str: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const enc = new TextEncoder();
      const hash = await window.crypto.subtle.digest('SHA-1', enc.encode(str));
      return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch (e) {
    console.warn('SubtleCrypto error:', e);
  }
  return '';
}

export async function uploadToCloudinary(
  file: File,
  folder: string = 'alhadaf_lessons'
): Promise<{ url: string; publicId: string }> {
  const cloudName = 'qbavq5bs';
  const apiKey = '861193287964773';
  const apiSecret = 'bUi7HzF7e4XgyFv7dA6wquQ9Nos';
  const timestamp = Math.floor(Date.now() / 1000);

  const isImage = file.type?.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name || '');
  const resourceType = isImage ? 'image' : 'raw';

  // 1. Direct browser-to-Cloudinary upload (Ultra fast ~1s, permanent HTTPS CDN for all students)
  try {
    const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = await getSha1Signature(strToSign);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('folder', folder);
    if (signature) {
      formData.append('signature', signature);
    }

    let res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: 'POST',
      body: formData,
    });

    // If image/upload rejected the file (e.g. non-standard format), raw/upload always accepts it!
    if (!res.ok && resourceType === 'image') {
      res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
        method: 'POST',
        body: formData,
      });
    }

    if (res.ok) {
      const data = await res.json();
      if (data?.secure_url || data?.url) {
        return {
          url: data.secure_url || data.url,
          publicId: data.public_id || `cld_${Date.now()}`,
        };
      }
    }
  } catch (cErr) {
    console.warn('Direct Cloudinary upload error, trying server fallback:', cErr);
  }

  // 2. Server-side signed upload route fallback
  try {
    const sFormData = new FormData();
    sFormData.append('file', file);
    sFormData.append('folder', folder);

    const sRes = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      body: sFormData,
    });
    if (sRes.ok) {
      const sData = await sRes.json();
      if (sData?.url) {
        return {
          url: sData.url,
          publicId: sData.publicId || `cld_${Date.now()}`,
        };
      }
    }
  } catch (sErr) {
    console.warn('Server upload fallback error:', sErr);
  }

  throw new Error('تعذر رفع وتثبيت الملف في السحابة. يرجى التحقق من اتصال الإنترنت.');
}
