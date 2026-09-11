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
    const apiKey = process.env.CLOUDINARY_API_KEY || '861193287964773';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'bUi7HzF7e4XgyFv7dA6wquQ9Nos';

    const timestamp = Math.floor(Date.now() / 1000);

    // Generate SHA1 signature for Cloudinary upload: folder=...&timestamp=...<api_secret>
    const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('api_key', apiKey);
    uploadFormData.append('timestamp', String(timestamp));
    uploadFormData.append('signature', signature);
    uploadFormData.append('folder', folder);

    const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: uploadFormData,
    });

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
