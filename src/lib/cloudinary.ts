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
  const apiKey = '557177435223116';
  const apiSecret = 'm-UtPrsuMIFT2-ae4VY1u4EvP6I';
  const timestamp = Math.floor(Date.now() / 1000);

  const isImage = file.type?.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name || '');
  const resourceType = isImage ? 'image' : 'raw';

  // 1. First choice: Same-origin Server API route (immune to CORS, client crypto issues, and ISP blocks)
  let lastErrorMsg = '';
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
    } else {
      const errText = await sRes.text();
      lastErrorMsg = `Server error (${sRes.status}): ${errText}`;
      console.warn(lastErrorMsg);
    }
  } catch (sErr: any) {
    lastErrorMsg = sErr?.message || 'Server upload route failed';
    console.warn('Server upload route error, trying direct upload:', sErr);
  }

  // 2. Direct browser-to-Cloudinary upload fallback
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
    } else {
      const errBody = await res.text();
      lastErrorMsg = `Direct upload error (${res.status}): ${errBody}`;
      console.warn(lastErrorMsg);
    }
  } catch (cErr: any) {
    lastErrorMsg = cErr?.message || 'Direct Cloudinary upload failed';
    console.warn('Direct Cloudinary upload error:', cErr);
  }

  throw new Error(`تعذر رفع وتثبيت الملف في السحابة: ${lastErrorMsg || 'يرجى التحقق من اتصال الإنترنت'}`);
}
