import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;
    const folder = (formData.get('folder') as string) || 'alhadaf_lesson_files';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const cloudName  = process.env.CLOUDINARY_CLOUD_NAME  || 'qbavq5bs';
    const apiKey     = process.env.CLOUDINARY_API_KEY     || '557177435223116';
    const apiSecret  = process.env.CLOUDINARY_API_SECRET  || 'm-UtPrsuMIFT2-ae4VY1u4EvP6I';

    const timestamp   = Math.floor(Date.now() / 1000);
    const strToSign   = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature   = crypto.createHash('sha1').update(strToSign).digest('hex');

    const isImage = (file.type?.startsWith('image/')) ||
      (file instanceof File && /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name));
    const endpoint = isImage ? 'image/upload' : 'raw/upload';

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('api_key', apiKey);
    uploadFormData.append('timestamp', String(timestamp));
    uploadFormData.append('folder', folder);
    uploadFormData.append('signature', signature);

    // Try chosen resource type first
    let cRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}`,
      { method: 'POST', body: uploadFormData }
    );

    // Fallback to raw/upload if image/upload fails
    if (!cRes.ok && endpoint === 'image/upload') {
      cRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        { method: 'POST', body: uploadFormData }
      );
    }

    if (!cRes.ok) {
      const errText = await cRes.text();
      console.error('[Cloudinary Upload] Failed:', errText);
      return NextResponse.json(
        { error: 'Upload to Cloudinary failed', details: errText },
        { status: 500 }
      );
    }

    const cData = await cRes.json();
    const publicUrl = cData.secure_url || cData.url;

    if (!publicUrl) {
      console.error('[Cloudinary Upload] No URL in response:', cData);
      return NextResponse.json({ error: 'Cloudinary did not return a URL' }, { status: 500 });
    }

    console.log(`[Cloudinary Upload] ✅ ${folder}/${cData.public_id} → ${publicUrl}`);

    return NextResponse.json({
      success: true,
      url: publicUrl,           // ← permanent HTTPS CDN URL, accessible to ALL users
      publicId: cData.public_id,
      format: cData.format,
      bytes: cData.bytes,
    });

  } catch (error: any) {
    console.error('[Cloudinary Upload] Exception:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
