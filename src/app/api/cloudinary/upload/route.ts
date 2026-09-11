import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;
    const folder = (formData.get('folder') as string) || 'alhadaf_live_files';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'qbavq5bs';
    const apiKey = process.env.CLOUDINARY_API_KEY || '557177435223116';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'm-UtPrsuMIFT2-ae4VY1u4EvP6I';

    const timestamp = Math.floor(Date.now() / 1000);

    // Generate SHA1 signature for Cloudinary upload: folder=...&timestamp=...<api_secret>
    const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('api_key', apiKey);
    uploadFormData.append('timestamp', String(timestamp));
    uploadFormData.append('folder', folder);
    uploadFormData.append('signature', signature);
    const isImage = file.type?.startsWith('image/') || (file instanceof File && /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name));
    const endpoint = isImage ? 'image/upload' : 'raw/upload';

    let cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}`, {
      method: 'POST',
      body: uploadFormData,
    });

    // If image/upload fails (e.g. non-standard format), raw/upload always accepts any file
    if (!cRes.ok && endpoint === 'image/upload') {
      cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
        method: 'POST',
        body: uploadFormData,
      });
    }

    if (!cRes.ok) {
      const errText = await cRes.text();
      console.error('Cloudinary API upload error:', errText);
      return NextResponse.json({ error: 'Upload to Cloudinary failed', details: errText }, { status: 500 });
    }

    const cData = await cRes.json();
    return NextResponse.json({
      success: true,
      url: cData.secure_url || cData.url,
      publicId: cData.public_id,
      format: cData.format,
      bytes: cData.bytes,
    });
  } catch (error: any) {
    console.error('Upload route exception:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
