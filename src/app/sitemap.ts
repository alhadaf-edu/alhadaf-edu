import { MetadataRoute } from 'next';
import { INITIAL_LESSONS, STANDALONE_QUIZZES, STAGES } from '@/lib/curriculumData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alhadaf-edu.vercel.app';

  const staticRoutes = [
    '',
    '/curriculum',
    '/quizzes',
    '/videos',
    '/blog',
    '/about',
    '/contact',
    '/faq',
    '/privacy',
    '/terms',
    '/auth/login',
    '/auth/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const lessonRoutes = INITIAL_LESSONS.map((lesson) => ({
    url: `${baseUrl}/lessons/${lesson.id}`,
    lastModified: new Date(lesson.createdAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const quizRoutes = STANDALONE_QUIZZES.map((quiz) => ({
    url: `${baseUrl}/quizzes/${quiz.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...lessonRoutes, ...quizRoutes];
}
