import { YouTubeVideo, StageType, CountryCode } from '@/types';

export const YOUTUBE_CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || 'UCb9BGNPlPd2dzg9lJsIaFYQ';
export const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || 'AIzaSyAq6d5qTdMPx79iPwotTCIcltV85pYLJYU';

export interface ParsedVideoLesson {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  country: CountryCode;
  stage: StageType;
  gradeNumber: number;
  subjectId: string;
  subjectName: string;
  unitTitle: string;
}

// Smart curriculum and country detector for YouTube titles
export function parseVideoTitleToCurriculum(title: string, desc: string = ''): {
  country: CountryCode;
  stage: StageType;
  gradeNumber: number;
  subjectId: string;
  subjectName: string;
  unitTitle: string;
} {
  const fullText = (title + ' ' + desc).toLowerCase();

  // 1. Country Detection
  let country: CountryCode = 'sa';
  if (
    fullText.includes('مصر') || 
    fullText.includes('مصري') || 
    fullText.includes('إعدادي') || 
    fullText.includes('اعدادي') || 
    fullText.includes('الثانوية العامة') ||
    fullText.includes('ثانوية عامة') ||
    fullText.includes('سلاح التلميذ') ||
    fullText.includes('الأضواء')
  ) {
    country = 'eg';
  } else if (fullText.includes('الإمارات') || fullText.includes('امارات') || fullText.includes('حلقة')) {
    country = 'ae';
  } else if (fullText.includes('الكويت') || fullText.includes('كويتي')) {
    country = 'kw';
  } else if (fullText.includes('الأردن') || fullText.includes('اردن') || fullText.includes('توجيهي')) {
    country = 'jo';
  } else {
    country = 'sa';
  }

  // 2. Stage Detection
  let stage: StageType = 'secondary';
  if (fullText.includes('ابتدائي') || fullText.includes('ابتدائى') || fullText.includes('الابتدائي')) {
    stage = 'elementary';
  } else if (fullText.includes('متوسط') || fullText.includes('المتوسط') || fullText.includes('إعدادي') || fullText.includes('اعدادي') || fullText.includes('الإعدادي')) {
    stage = 'middle';
  } else {
    stage = 'secondary';
  }

  // 3. Grade Detection (Checks compound contextual phrases first to avoid false positives like "الفصل الأول" or "الدرس الثاني")
  let gradeNumber = 1;
  if (/(سادس|السادس|\b6\b)\s*(ابتدائي|ابتدائى)?|الصف\s*(السادس|6)/.test(fullText)) {
    gradeNumber = 6;
  } else if (/(خامس|الخامس|\b5\b)\s*(ابتدائي|ابتدائى)?|الصف\s*(الخامس|5)/.test(fullText)) {
    gradeNumber = 5;
  } else if (/(رابع|الرابع|\b4\b)\s*(ابتدائي|ابتدائى)?|الصف\s*(الرابع|4)/.test(fullText)) {
    gradeNumber = 4;
  } else if (/(ثالث|الثالث|\b3\b)\s*(متوسط|ثانوي|ثانوى|ابتدائي|إعدادي)?|الصف\s*(الثالث|3)/.test(fullText)) {
    gradeNumber = 3;
  } else if (/(ثاني|ثانى|الثاني|الثانى|\b2\b)\s*(متوسط|ثانوي|ثانوى|ابتدائي|إعدادي)|الصف\s*(الثاني|الثانى|2)/.test(fullText)) {
    gradeNumber = 2;
  } else if (/(أول|اول|الأول|الاول|أولى|اولى|\b1\b)\s*(متوسط|ثانوي|ثانوى|ابتدائي|إعدادي)|الصف\s*(الأول|الاول|1)/.test(fullText)) {
    gradeNumber = 1;
  } else {
    // Secondary fallback based on standalone stage markers
    if (fullText.includes('سادس') || fullText.includes('السادس')) gradeNumber = 6;
    else if (fullText.includes('خامس') || fullText.includes('الخامس')) gradeNumber = 5;
    else if (fullText.includes('رابع') || fullText.includes('الرابع')) gradeNumber = 4;
    else if (fullText.includes('ثالث') || fullText.includes('الثالث')) gradeNumber = 3;
    else if (fullText.includes('ثاني') || fullText.includes('ثانى') || fullText.includes('الثاني')) gradeNumber = 2;
    else gradeNumber = 1;
  }

  // 4. Subject Detection
  let subjectId = '';
  let subjectName = '';

  if (fullText.includes('اجتماعيات') || fullText.includes('الدراسات الاجتماعية') || fullText.includes('دراسات') || fullText.includes('تاريخ') || fullText.includes('جغرافيا') || fullText.includes('الأموية')) {
    subjectId = country === 'eg' ? 'eg-social-mid' : (stage === 'elementary' ? 'social-elem' : 'social-mid');
    subjectName = 'الدراسات الاجتماعية';
  } else if (fullText.includes('لغتي') || fullText.includes('لغتى') || fullText.includes('اللغة العربية') || fullText.includes('نحو') || fullText.includes('عربي') || fullText.includes('مكتسبات') || fullText.includes('الكفايات') || fullText.includes('الصورة وأسميها') || fullText.includes('وسائل النقل')) {
    subjectId = country === 'eg' ? 'eg-arabic-mid' : (stage === 'elementary' ? 'arabic-elem' : stage === 'middle' ? 'arabic-mid' : 'arabic-sec');
    subjectName = country === 'eg' ? 'اللغة العربية' : (stage === 'elementary' ? 'لغتي الجميلة' : stage === 'middle' ? 'لغتي الخالدة' : 'الكفايات اللغوية');
  } else if (fullText.includes('كيمياء') || fullText.includes('الكيمياء')) {
    subjectId = country === 'eg' ? 'eg-chem-sec' : 'chem-sec';
    subjectName = 'الكيمياء';
  } else if (fullText.includes('فيزياء') || fullText.includes('فزياء') || fullText.includes('الفيزياء')) {
    subjectId = country === 'eg' ? 'eg-physics-sec' : 'physics-sec';
    subjectName = 'الفيزياء';
  } else if (stage === 'secondary' && (fullText.includes('احياء') || fullText.includes('أحياء') || fullText.includes('شوكيات') || fullText.includes('خلية'))) {
    subjectId = country === 'eg' ? 'eg-bio-sec' : 'bio-sec';
    subjectName = 'الأحياء';
  } else if (fullText.includes('علوم') || fullText.includes('العلوم') || fullText.includes('حيوانات') || fullText.includes('نبات') || fullText.includes('مخلوقات') || fullText.includes('لافقارية') || fullText.includes('علمية') || fullText.includes('خلية') || fullText.includes('خلايا') || fullText.includes('العلم وعملياته')) {
    subjectId = country === 'eg' ? 'eg-science-mid' : (stage === 'elementary' ? 'science-elem' : 'science-mid');
    subjectName = 'العلوم';
  } else if (fullText.includes('جبر') || fullText.includes('هندسة') || fullText.includes('حساب مثلثات')) {
    subjectId = country === 'eg' ? 'eg-math-mid' : (stage === 'elementary' ? 'math-elem' : stage === 'middle' ? 'math-mid' : 'math-sec');
    subjectName = country === 'eg' ? 'الجبر والهندسة' : 'الرياضيات';
  } else if (fullText.includes('رياضيات') || fullText.includes('الرياضيات') || fullText.includes('حساب') || fullText.includes('أعداد') || fullText.includes('اعداد') || fullText.includes('القوى') || fullText.includes('القيمة المنزلية') || fullText.includes('العوامل') || fullText.includes('التصنيف') || fullText.includes('المسألة')) {
    subjectId = country === 'eg' ? 'eg-math-mid' : (stage === 'elementary' ? 'math-elem' : stage === 'middle' ? 'math-mid' : 'math-sec');
    subjectName = 'الرياضيات';
  } else {
    subjectId = stage === 'elementary' ? 'math-elem' : stage === 'middle' ? 'math-mid' : 'physics-sec';
    subjectName = 'الرياضيات';
  }

  // Unit Title
  const parts = title.split('|');
  const unitTitle = parts.length > 1 ? parts[0].trim() : (country === 'eg' ? 'الفصل الدراسي الأول' : 'الفصل الدراسي الأول');

  return { country, stage, gradeNumber, subjectId, subjectName, unitTitle };
}

// Fetch live channel videos with server API fallback
export async function fetchChannelVideos(maxResults: number = 30): Promise<YouTubeVideo[]> {
  const channelId = YOUTUBE_CHANNEL_ID;
  const apiKey = YOUTUBE_API_KEY;
  const referer = process.env.NEXT_PUBLIC_SITE_URL || 'https://alhadaf-edu.vercel.app/';

  // 1. Try YouTube Data API v3 directly
  try {
    const chUrl = `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&id=${channelId}&part=contentDetails`;
    const chRes = await fetch(chUrl, { 
      headers: { 'Referer': referer },
      next: { revalidate: 300 }
    });

    if (chRes.ok) {
      const chData = await chRes.json();
      const uploadsPlaylistId = chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (uploadsPlaylistId) {
        const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${uploadsPlaylistId}&part=snippet,contentDetails&maxResults=${Math.min(maxResults, 50)}`;
        const itemsRes = await fetch(itemsUrl, {
          headers: { 'Referer': referer },
          next: { revalidate: 300 }
        });

        if (itemsRes.ok) {
          const itemsData = await itemsRes.json();
          if (itemsData.items && Array.isArray(itemsData.items) && itemsData.items.length > 0) {
            return itemsData.items.map((it: any) => ({
              id: it.contentDetails?.videoId,
              title: it.snippet?.title || '',
              description: it.snippet?.description || '',
              thumbnailUrl: it.snippet?.thumbnails?.high?.url || it.snippet?.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${it.contentDetails?.videoId}/hqdefault.jpg`,
              publishedAt: it.snippet?.publishedAt || new Date().toISOString(),
              duration: '18:00',
              viewCount: '1.5K'
            }));
          }
        }
      }
    }
  } catch (err) {
    console.warn('YouTube API v3 channel video fetch notice:', err);
  }

  // 2. Fallback to RSS Feed
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const response = await fetch(rssUrl, { next: { revalidate: 300 } });
    
    if (response.ok) {
      const xml = await response.text();
      const entries = xml.split('<entry>');
      const videos: YouTubeVideo[] = [];

      for (let i = 1; i < entries.length; i++) {
        const entry = entries[i];
        const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
        const titleMatch = entry.match(/<title>(.*?)<\/title>/);
        const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
        const descMatch = entry.match(/<media:description>([\s\S]*?)<\/media:description>/);

        if (videoIdMatch && titleMatch) {
          const videoId = videoIdMatch[1];
          const title = titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"');
          const published = publishedMatch ? publishedMatch[1] : new Date().toISOString();
          const desc = descMatch ? descMatch[1].replace(/&amp;/g, '&') : '';

          videos.push({
            id: videoId,
            title,
            description: desc,
            thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            publishedAt: published,
            duration: '18:00',
            viewCount: '1.5K'
          });
        }
      }

      if (videos.length > 0) {
        return videos.slice(0, maxResults);
      }
    }
  } catch (error) {
    console.warn('YouTube channel RSS fetch notice:', error);
  }

  // 3. Fallback to initial channel videos from UCb9BGNPlPd2dzg9lJsIaFYQ
  return REAL_CHANNEL_VIDEOS.slice(0, maxResults);
}

export const REAL_CHANNEL_VIDEOS: YouTubeVideo[] = [
  {
    id: 'hHAHtNUyHPM',
    title: 'الدولة الأموية وأبرز خلفائها | الدراسات الاجتماعية ثاني متوسط | الفصل الأول 1448هـ',
    description: 'شرح مبسط لدرس الدولة الأموية وأبرز خلفائها (41–132هـ) في مادة الدراسات الاجتماعية للصف الثاني المتوسط.',
    thumbnailUrl: 'https://i.ytimg.com/vi/hHAHtNUyHPM/hqdefault.jpg',
    publishedAt: '2026-08-26T22:17:01Z',
    duration: '18:40',
  },
  {
    id: 'LewEczZm3d0',
    title: 'شكل الأرض | الدراسات الاجتماعية أول متوسط | الفصل الأول 1448هـ | الدرس الثاني',
    description: 'شرح مبسط وممتع لدرس شكل الأرض في مادة الدراسات الاجتماعية للصف الأول المتوسط.',
    thumbnailUrl: 'https://i.ytimg.com/vi/LewEczZm3d0/hqdefault.jpg',
    publishedAt: '2026-08-26T22:08:57Z',
    duration: '14:20',
  },
  {
    id: '1NMuD5zFscc',
    title: 'الهوية الوطنية | الدراسات الاجتماعية رابع ابتدائي | الفصل الأول 1448هـ | الدرس الثاني',
    description: 'شرح مميز لدرس الهوية الوطنية في مادة الدراسات الاجتماعية للصف الرابع الابتدائي.',
    thumbnailUrl: 'https://i.ytimg.com/vi/1NMuD5zFscc/hqdefault.jpg',
    publishedAt: '2026-08-26T22:04:01Z',
    duration: '12:15',
  },
  {
    id: 'GqkYZwyn858',
    title: 'المصطلحات التاريخية | الدراسات الاجتماعية سادس ابتدائي | الفصل الأول 1448هـ | الدرس الثاني',
    description: 'شرح متكامل لدرس المصطلحات التاريخية في مادة الدراسات الاجتماعية للصف السادس الابتدائي.',
    thumbnailUrl: 'https://i.ytimg.com/vi/GqkYZwyn858/hqdefault.jpg',
    publishedAt: '2026-08-26T21:58:50Z',
    duration: '11:50',
  },
  {
    id: 'ouPS7iHOioo',
    title: 'مفهوم التاريخ | الدراسات الاجتماعية سادس ابتدائي | الفصل الأول 1448هـ | الدرس الأول',
    description: 'شرح درس مفهوم التاريخ في مادة الدراسات الاجتماعية للصف السادس الابتدائي، الفصل الدراسي الأول.',
    thumbnailUrl: 'https://i.ytimg.com/vi/ouPS7iHOioo/hqdefault.jpg',
    publishedAt: '2026-08-26T21:53:52Z',
    duration: '13:10',
  },
  {
    id: 'muSwE2f2IyE',
    title: 'مقارنة الأعداد النسبية وترتيبها | رياضيات الصف الثاني المتوسط | الفصل الأول 1448هـ | الدرس الثاني',
    description: 'مقارنة الأعداد النسبية وترتيبها بطريقة سهلة وتدريبات تطبيقية لطلاب الثاني المتوسط.',
    thumbnailUrl: 'https://i.ytimg.com/vi/muSwE2f2IyE/hqdefault.jpg',
    publishedAt: '2026-08-26T21:43:02Z',
    duration: '22:15',
  },
  {
    id: '3_F4JdAFR9o',
    title: 'التصنيف وفق أكثر من خاصية | رياضيات الصف الأول الابتدائي | الفصل الأول 1448هـ | الدرس الثاني',
    description: 'شرح مبسط للأطفال لدرس التصنيف وفق أكثر من خاصية في مادة الرياضيات للصف الأول الابتدائي.',
    thumbnailUrl: 'https://i.ytimg.com/vi/3_F4JdAFR9o/hqdefault.jpg',
    publishedAt: '2026-08-26T21:16:19Z',
    duration: '09:45',
  },
  {
    id: 'Zbm42P9eyAY',
    title: 'القوى والأسس | رياضيات الصف الأول المتوسط | الفصل الأول 1448هـ | الدرس الثاني',
    description: 'الدرس الثاني في رياضيات أول متوسط: التعرف على علامات القوى والأسس وحساب القيم الرياضية.',
    thumbnailUrl: 'https://i.ytimg.com/vi/Zbm42P9eyAY/hqdefault.jpg',
    publishedAt: '2026-08-26T21:01:15Z',
    duration: '20:30',
  },
  {
    id: 'JAY8nTvfM3Y',
    title: 'القيمة المنزلية ضمن الملايين | رياضيات رابع ابتدائي | الفصل الأول 1448هـ | الدرس الثاني',
    description: 'شرح القيمة المنزلية ضمن الملايين في مادة الرياضيات للصف الرابع الابتدائي.',
    thumbnailUrl: 'https://i.ytimg.com/vi/JAY8nTvfM3Y/hqdefault.jpg',
    publishedAt: '2026-08-26T20:17:53Z',
    duration: '16:40',
  },
  {
    id: '3FcbGYFT9GY',
    title: 'العوامل الأولية | رياضيات سادس ابتدائي | الفصل الأول 1448هـ | الدرس الثاني',
    description: 'شرح درس العوامل الأولية وطرق التحليل الرياضي للصف السادس الابتدائي.',
    thumbnailUrl: 'https://i.ytimg.com/vi/3FcbGYFT9GY/hqdefault.jpg',
    publishedAt: '2026-08-26T19:44:17Z',
    duration: '18:10',
  },
  {
    id: 'ynmTekWC13I',
    title: 'شرح الدراسات الاجتماعية | الصف الرابع الابتدائي | الفصل الأول 1448هـ | الدرس الأول',
    description: 'الدرس الأول في مادة الدراسات الاجتماعية للصف الرابع الابتدائي.',
    thumbnailUrl: 'https://i.ytimg.com/vi/ynmTekWC13I/hqdefault.jpg',
    publishedAt: '2026-08-25T11:12:55Z',
    duration: '14:50',
  },
  {
    id: 'lKUy2pZ1vls',
    title: 'شرح المجموعة الشمسية | الدراسات الاجتماعية الصف الأول المتوسط | الفصل الأول 1448هـ | الدرس الأول',
    description: 'شرح كواكب المجموعة الشمسية وحركاتها في مادة الدراسات الاجتماعية للأول المتوسط.',
    thumbnailUrl: 'https://i.ytimg.com/vi/lKUy2pZ1vls/hqdefault.jpg',
    publishedAt: '2026-08-25T11:08:28Z',
    duration: '19:20',
  },
  {
    id: 'kugCtC47aZo',
    title: 'شرح حركة الكواكب والجاذبية | فيزياء الصف الثاني الثانوي مسارات | الفصل الأول 1448هـ | الدرس الأول',
    description: 'شرح قوانين كبلر وحركة الكواكب والجاذبية الكونية في فيزياء الصف الثاني الثانوي مسارات.',
    thumbnailUrl: 'https://i.ytimg.com/vi/kugCtC47aZo/hqdefault.jpg',
    publishedAt: '2026-08-25T10:59:47Z',
    duration: '26:15',
  },
  {
    id: 'nSko5mgJXTc',
    title: 'شرح الأعداد النسبية | رياضيات الصف الثاني المتوسط | الفصل الأول 1448هـ | الدرس الأول',
    description: 'الدرس الأول في مادة الرياضيات للصف الثاني المتوسط: مفهوم الأعداد النسبية وكتابتها بالصورة العشرية.',
    thumbnailUrl: 'https://i.ytimg.com/vi/nSko5mgJXTc/hqdefault.jpg',
    publishedAt: '2026-08-25T09:48:37Z',
    duration: '21:00',
  },
  {
    id: 'Oinlpk_k1BU',
    title: 'شرح خصائص شوكيات الجلد | أحياء الصف الثاني الثانوي مسارات | الفصل الأول 1448هـ | الدرس الأول',
    description: 'شرح بيولوجي مفصل لخصائص شوكيات الجلد وتنوعها لطلاب الصف الثاني الثانوي مسارات.',
    thumbnailUrl: 'https://i.ytimg.com/vi/Oinlpk_k1BU/hqdefault.jpg',
    publishedAt: '2026-08-25T09:34:13Z',
    duration: '23:45',
  }
];

export async function fetchPlaylists(): Promise<{ id: string; title: string; description: string; count: number; thumbnail: string }[]> {
  const channelId = YOUTUBE_CHANNEL_ID;
  const apiKey = YOUTUBE_API_KEY;
  const referer = process.env.NEXT_PUBLIC_SITE_URL || 'https://alhadaf-edu.vercel.app/';

  try {
    const plUrl = `https://www.googleapis.com/youtube/v3/playlists?key=${apiKey}&channelId=${channelId}&part=snippet,contentDetails&maxResults=50`;
    const plRes = await fetch(plUrl, {
      headers: { 'Referer': referer },
      next: { revalidate: 300 }
    });

    if (plRes.ok) {
      const plData = await plRes.json();
      if (plData.items && Array.isArray(plData.items) && plData.items.length > 0) {
        return plData.items.map((p: any) => ({
          id: p.id,
          title: p.snippet?.title || '',
          description: p.snippet?.description || '',
          count: p.contentDetails?.itemCount || 0,
          thumbnail: p.snippet?.thumbnails?.high?.url || p.snippet?.thumbnails?.medium?.url || p.snippet?.thumbnails?.default?.url || ''
        }));
      }
    }
  } catch (error) {
    console.warn('YouTube fetchPlaylists notice:', error);
  }

  // Static fallback playlists
  return [
    { id: 'PL1', title: 'مقررات المرحلة الثانوية (مسارات وثانوية عامة)', description: 'فيزياء، أحياء، رياضيات', count: 6, thumbnail: 'https://i.ytimg.com/vi/kugCtC47aZo/hqdefault.jpg' },
    { id: 'PL2', title: 'مقررات المرحلة المتوسطة والإعدادية', description: 'رياضيات، جبر وهندسة، دراسات اجتماعية', count: 5, thumbnail: 'https://i.ytimg.com/vi/hHAHtNUyHPM/hqdefault.jpg' },
    { id: 'PL3', title: 'مقررات المرحلة الابتدائية', description: 'رياضيات، دراسات اجتماعية، علوم', count: 4, thumbnail: 'https://i.ytimg.com/vi/1NMuD5zFscc/hqdefault.jpg' },
  ];
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
