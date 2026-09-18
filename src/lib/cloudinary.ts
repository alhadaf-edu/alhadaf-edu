// Pure JS SHA-1 implementation as universal fallback
function sha1Fallback(msg: string): string {
  function rotl(n: number, s: number) { return (n << s) | (n >>> (32 - s)); }
  const words: number[] = [];
  const msgLen = msg.length;
  for (let i = 0; i < msgLen - 3; i += 4) {
    words.push((msg.charCodeAt(i) << 24) | (msg.charCodeAt(i + 1) << 16) | (msg.charCodeAt(i + 2) << 8) | msg.charCodeAt(i + 3));
  }
  let rem = msgLen % 4;
  let lastWord = 0;
  for (let i = 0; i < rem; i++) {
    lastWord |= msg.charCodeAt(msgLen - rem + i) << (24 - i * 8);
  }
  words.push(lastWord);
  words.push(0x80000000 >>> (rem * 8));
  while ((words.length % 16) !== 14) words.push(0);
  words.push((msgLen >>> 29) & 0x07);
  words.push((msgLen << 3) & 0xffffffff);

  let H0 = 0x67452301, H1 = 0xefcdab89, H2 = 0x98badcfe, H3 = 0x10325476, H4 = 0xc3d2e1f0;
  const W = new Array(80);

  for (let i = 0; i < words.length; i += 16) {
    for (let t = 0; t < 16; t++) W[t] = words[i + t];
    for (let t = 16; t < 80; t++) W[t] = rotl(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);

    let a = H0, b = H1, c = H2, d = H3, e = H4;
    for (let t = 0; t < 80; t++) {
      let f: number, k: number;
      if (t < 20) { f = (b & c) | ((~b) & d); k = 0x5a827999; }
      else if (t < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
      else if (t < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
      else { f = b ^ c ^ d; k = 0xca62c1d6; }
      const temp = (rotl(a, 5) + f + e + k + W[t]) & 0xffffffff;
      e = d; d = c; c = rotl(b, 30); b = a; a = temp;
    }
    H0 = (H0 + a) & 0xffffffff;
    H1 = (H1 + b) & 0xffffffff;
    H2 = (H2 + c) & 0xffffffff;
    H3 = (H3 + d) & 0xffffffff;
    H4 = (H4 + e) & 0xffffffff;
  }

  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return toHex(H0) + toHex(H1) + toHex(H2) + toHex(H3) + toHex(H4);
}

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
    console.warn('SubtleCrypto error, using pure JS fallback:', e);
  }
  return sha1Fallback(str);
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

  let lastErrorMsg = '';

  // 1. First choice: Same-origin Server API route with 10-second timeout to prevent UI hang
  try {
    const sFormData = new FormData();
    sFormData.append('file', file);
    sFormData.append('folder', folder);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const sRes = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      body: sFormData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

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
    lastErrorMsg = sErr?.message || 'Server upload route timeout/failure';
    console.warn('Server upload route note, switching to direct upload:', sErr);
  }

  // 2. Direct browser-to-Cloudinary upload with 15-second timeout
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok && resourceType === 'image') {
      const c2 = new AbortController();
      const t2 = setTimeout(() => c2.abort(), 15000);
      res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
        method: 'POST',
        body: formData,
        signal: c2.signal,
      });
      clearTimeout(t2);
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
