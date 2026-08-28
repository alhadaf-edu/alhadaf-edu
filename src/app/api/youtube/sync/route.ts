import { NextResponse } from 'next/server';
import { fetchChannelVideos } from '@/lib/youtube';

export async function GET() {
  try {
    const videos = await fetchChannelVideos(20);
    return NextResponse.json({ success: true, count: videos.length, videos });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
