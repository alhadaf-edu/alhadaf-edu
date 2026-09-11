import type { Metadata } from 'next';
import { Noto_Kufi_Arabic, Cairo } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AdSenseProvider } from '@/context/AdSenseContext';
import { LessonsProvider } from '@/context/LessonsContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import AuthGuard from '@/components/auth/AuthGuard';

const notoKufi = Noto_Kufi_Arabic({
  subsets: ['arabic', 'latin'],
  variable: '--font-noto-kufi',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'منصة الهَدَّاف التعليمية | دروس وشرح المناهج العربية',
    template: '%s | منصة الهَدَّاف التعليمية',
  },
  description: 'الهداف التعليمي — منصة تعليمية عربية شاملة تقدم شرح المناهج الدراسية لجميع الصفوف والمراحل (ابتدائي، متوسط، ثانوي) في مصر والسعودية والإمارات والكويت والأردن وغيرها. مذكرات PDF، اختبارات تفاعلية، وحصص مباشرة.',
  keywords: [
    'الهداف التعليمي',
    'الهداف',
    'هداف تعليمي',
    'منصة الهداف',
    'alhadaf',
    'alhadaf edu',
    'الهداف التعليمية',
    'منصة الهداف التعليمية',
    'شرح المناهج',
    'المناهج السعودية',
    'المناهج المصرية',
    'المناهج الإماراتية',
    'المناهج الكويتية',
    'مناهج الثانوية العامة',
    'مناهج الإعدادية',
    'شرح الرياضيات',
    'شرح الفيزياء',
    'شرح الكيمياء',
    'شرح اللغة العربية',
    'شرح الإنجليزي',
    'نظام المسارات',
    'اختبارات تحصيلي',
    'اختبارات قدرات',
    'ملخصات دراسية PDF',
    'حصص مباشرة تعليمية',
    'تعليم اون لاين',
    'دروس خصوصية اون لاين',
  ],
  authors: [{ name: 'منصة الهَدَّاف التعليمية', url: 'https://alhadaf-edu.vercel.app' }],
  creator: 'منصة الهَدَّاف التعليمية',
  publisher: 'منصة الهَدَّاف التعليمية',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://alhadaf-edu.vercel.app'),
  alternates: {
    canonical: 'https://alhadaf-edu.vercel.app',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_AR',
    url: 'https://alhadaf-edu.vercel.app',
    title: 'الهداف التعليمي | شرح المناهج العربية لجميع المراحل',
    description: 'منصة الهداف التعليمية — شرح دروس ومناهج جميع الصفوف في مصر والسعودية والإمارات والكويت. اختبارات تفاعلية، ملخصات PDF، وحصص مباشرة.',
    siteName: 'منصة الهَدَّاف التعليمية',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'منصة الهداف التعليمي',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'الهداف التعليمي | شرح المناهج العربية',
    description: 'شرح دروس ومناهج جميع الصفوف — اختبارات تفاعلية وحصص مباشرة.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // أضف Google Search Console verification code هنا
    google: 'alhadaf-edu-google-site-verification',
  },
  category: 'education',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'الهداف التعليمي',
    alternateName: ['منصة الهداف', 'الهداف التعليمية', 'alhadaf edu'],
    url: 'https://alhadaf-edu.vercel.app',
    logo: 'https://alhadaf-edu.vercel.app/logo.png',
    image: 'https://alhadaf-edu.vercel.app/logo.png',
    description: 'الهداف التعليمي — منصة تعليمية عربية شاملة تقدم شرح المناهج الدراسية والحصص المباشرة التفاعلية لجميع الصفوف والمراحل في مصر والسعودية والإمارات والكويت والأردن.',
    email: 'alhadaafpro@gmail.com',
    sameAs: [
      'https://www.youtube.com/channel/UCb9BGNPlPd2dzg9lJsIaFYQ',
      'https://t.me/alhadaf_edu',
      'https://t.me/alhadaaf_edu',
      'https://www.threads.com/@alhadaf_edu',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'الدروس والحصص التعليمية',
      itemListElement: [
        { '@type': 'Course', name: 'شرح المناهج السعودية', provider: { '@type': 'Organization', name: 'الهداف التعليمي' } },
        { '@type': 'Course', name: 'شرح المناهج المصرية', provider: { '@type': 'Organization', name: 'الهداف التعليمي' } },
        { '@type': 'Course', name: 'حصص مباشرة تفاعلية', provider: { '@type': 'Organization', name: 'الهداف التعليمي' } },
      ]
    }
  };

  return (
    <html lang="ar" dir="rtl" className={`${notoKufi.variable} ${cairo.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2318347592935177"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-gold-500 selection:text-slate-950 transition-colors duration-200">
        <AuthProvider>
          <ThemeProvider>
            <AdSenseProvider>
              <LessonsProvider>
                <AuthGuard>
                  <Navbar />
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                </AuthGuard>
              </LessonsProvider>
            </AdSenseProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
