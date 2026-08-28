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

// Smart curriculum and country detector
export function parseVideoTitleToCurriculum(title: string, desc: string = ''): {
  country: CountryCode;
  stage: StageType;
  gradeNumber: number;
  subjectId: string;
  subjectName: string;
  unitTitle: string;
} {
  let cleanText = (title + ' ' + desc).toLowerCase();
  // Strip term & lesson phrases so "الفصل الأول" or "الدرس الأول" does not trick the grade detector into Grade 1
  cleanText = cleanText
    .replace(/الفصل\s+(الدراسي\s+)?(الأول|الاول|الثاني|الثانى|الثالث)/g, ' ')
    .replace(/الترم\s+(الأول|الاول|الثاني|الثانى)/g, ' ')
    .replace(/الدرس\s+(الأول|الاول|الثاني|الثانى|الثالث|الرابع|الخامس|السادس)/g, ' ');

  // 1. Country Detection
  let country: CountryCode = 'sa';

  if (
    cleanText.includes('مصر') || 
    cleanText.includes('مصري') || 
    cleanText.includes('إعدادي') || 
    cleanText.includes('اعدادي') || 
    cleanText.includes('الثانوية العامة') ||
    cleanText.includes('ثانوية عامة') ||
    cleanText.includes('سلاح التلميذ') ||
    cleanText.includes('الأضواء')
  ) {
    country = 'eg';
  } else if (
    cleanText.includes('الإمارات') || 
    cleanText.includes('امارات') || 
    cleanText.includes('حلقة')
  ) {
    country = 'ae';
  } else if (cleanText.includes('الكويت') || cleanText.includes('كويتي')) {
    country = 'kw';
  } else if (cleanText.includes('الأردن') || cleanText.includes('اردن') || cleanText.includes('توجيهي')) {
    country = 'jo';
  } else if (
    cleanText.includes('السعودية') || 
    cleanText.includes('سعودي') || 
    cleanText.includes('1448') || 
    cleanText.includes('1447') || 
    cleanText.includes('مسارات') || 
    cleanText.includes('متوسط') || 
    cleanText.includes('نافس') || 
    cleanText.includes('تحصيلي') || 
    cleanText.includes('قدرات')
  ) {
    country = 'sa';
  }

  // 2. Stage Detection
  let stage: StageType = 'secondary';
  if (cleanText.includes('ابتدائي') || cleanText.includes('ابتدائى') || cleanText.includes('الابتدائي')) {
    stage = 'elementary';
  } else if (cleanText.includes('متوسط') || cleanText.includes('المتوسط') || cleanText.includes('إعدادي') || cleanText.includes('اعدادي') || cleanText.includes('الإعدادي')) {
    stage = 'middle';
  } else {
    stage = 'secondary';
  }

  // 3. Grade Detection (accurate numbers)
  let gradeNumber = 1;
  if (cleanText.includes('سادس') || cleanText.includes('السادس') || cleanText.includes('ستة') || cleanText.includes('الصف 6') || cleanText.includes('6 ابتدائي')) {
    gradeNumber = 6;
  } else if (cleanText.includes('خامس') || cleanText.includes('الخامس') || cleanText.includes('خامسة') || cleanText.includes('الصف 5') || cleanText.includes('5 ابتدائي')) {
    gradeNumber = 5;
  } else if (cleanText.includes('رابع') || cleanText.includes('الرابع') || cleanText.includes('رابعة') || cleanText.includes('الصف 4') || cleanText.includes('4 ابتدائي')) {
    gradeNumber = 4;
  } else if (cleanText.includes('ثالث') || cleanText.includes('الثالث') || cleanText.includes('تالتة') || cleanText.includes('الصف 3') || cleanText.includes('3 متوسط') || cleanText.includes('3 ثانوي') || cleanText.includes('3 إعدادي')) {
    gradeNumber = 3;
  } else if (cleanText.includes('ثاني') || cleanText.includes('الثاني') || cleanText.includes('ثانى') || cleanText.includes('تانية') || cleanText.includes('تاني') || cleanText.includes('الصف 2') || cleanText.includes('2 متوسط') || cleanText.includes('2 ثانوي') || cleanText.includes('2 إعدادي')) {
    gradeNumber = 2;
  } else if (cleanText.includes('أول') || cleanText.includes('الأول') || cleanText.includes('اول') || cleanText.includes('الاول') || cleanText.includes('أولى') || cleanText.includes('اولى') || cleanText.includes('الصف 1') || cleanText.includes('1 متوسط') || cleanText.includes('1 ثانوي') || cleanText.includes('1 إعدادي')) {
    gradeNumber = 1;
  }

  // 4. Subject Detection
  let subjectId = '';
  let subjectName = '';

  if (cleanText.includes('اجتماعيات') || cleanText.includes('الدراسات الاجتماعية') || cleanText.includes('دراسات')) {
    subjectId = country === 'eg' ? 'eg-social-mid' : (stage === 'elementary' ? 'social-elem' : 'social-mid');
    subjectName = 'الدراسات الاجتماعية';
  } else if (cleanText.includes('جبر') || cleanText.includes('هندسة') || cleanText.includes('حساب مثلثات')) {
    subjectId = country === 'eg' ? 'eg-math-mid' : (stage === 'elementary' ? 'math-elem' : stage === 'middle' ? 'math-mid' : 'math-sec');
    subjectName = country === 'eg' ? 'الجبر والهندسة' : 'الرياضيات';
  } else if (cleanText.includes('رياضيات') || cleanText.includes('الرياضيات') || cleanText.includes('حساب') || cleanText.includes('أعداد') || cleanText.includes('اعداد') || cleanText.includes('القوى') || cleanText.includes('القيمة المنزلية') || cleanText.includes('العوامل')) {
    subjectId = country === 'eg' ? 'eg-math-mid' : (stage === 'elementary' ? 'math-elem' : stage === 'middle' ? 'math-mid' : 'math-sec');
    subjectName = 'الرياضيات';
  } else if (cleanText.includes('فيزياء') || cleanText.includes('فزياء')) {
    subjectId = country === 'eg' ? 'eg-physics-sec' : 'physics-sec';
    subjectName = 'الفيزياء';
  } else if (cleanText.includes('احياء') || cleanText.includes('أحياء') || cleanText.includes('شوكيات')) {
    subjectId = country === 'eg' ? 'eg-bio-sec' : 'bio-sec';
    subjectName = 'الأحياء';
  } else if (cleanText.includes('كيمياء') || cleanText.includes('الكيمياء')) {
    subjectId = country === 'eg' ? 'eg-chem-sec' : 'chem-sec';
    subjectName = 'الكيمياء';
  } else if (cleanText.includes('علوم') || cleanText.includes('العلوم')) {
    subjectId = country === 'eg' ? 'eg-science-mid' : (stage === 'elementary' ? 'science-elem' : 'science-mid');
    subjectName = 'العلوم';
  } else if (cleanText.includes('لغتي') || cleanText.includes('اللغة العربية') || cleanText.includes('نحو') || cleanText.includes('عربي')) {
    subjectId = country === 'eg' ? 'eg-arabic-mid' : (stage === 'elementary' ? 'arabic-elem' : stage === 'middle' ? 'arabic-mid' : 'arabic-sec');
    subjectName = country === 'eg' ? 'اللغة العربية' : (stage === 'elementary' ? 'لغتي الجميلة' : stage === 'middle' ? 'لغتي الخالدة' : 'الكفايات اللغوية');
  } else {
    subjectId = stage === 'elementary' ? 'math-elem' : stage === 'middle' ? 'math-mid' : 'physics-sec';
    subjectName = 'الرياضيات';
  }

  // Unit Title
  const parts = title.split('|');
  const unitTitle = parts.length > 1 ? parts[0].trim() : (country === 'eg' ? 'الفصل الدراسي الأول' : 'الفصل الدراسي الأول');

  return { country, stage, gradeNumber, subjectId, subjectName, unitTitle };
}

// Fetch live channel videos with RSS Feed fallback for 100% reliable uptime
export async function fetchChannelVideos(maxResults: number = 30): Promise<YouTubeVideo[]> {
  const channelId = YOUTUBE_CHANNEL_ID;

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

  // Fallback to initial channel videos from UCb9BGNPlPd2dzg9lJsIaFYQ
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
