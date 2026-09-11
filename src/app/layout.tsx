import type { Metadata, Viewport } from 'next';
import { Noto_Kufi_Arabic, Cairo } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AdSenseProvider } from '@/context/AdSenseContext';
import { LessonsProvider } from '@/context/LessonsContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

import AuthGuard from '@/components/auth/AuthGuard';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

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
    default: 'منصة الهداف التعليمي | alhadaaf edu | دروس وشروحات المناهج العربية',
    template: '%s | الهداف التعليمي alhadaaf',
  },
  description: 'الهداف التعليمي (alhadaaf edu) — المنصة التعليمية الرائدة لشرح المناهج الدراسية لجميع المراحل (ابتدائي، متوسط، إعدادي، ثانوي) في مصر والسعودية والإمارات والكويت والأردن. ملخصات PDF، حصص مباشرة تفاعلية، واختبارات قياس وقدرات وتحصيلي.',
  keywords: [
    // الاسم بالإنجليزي بصيغة alhadaaf المطلوبة وكل مشتقاتها
    'alhadaaf',
    'alhadaaf edu',
    'alhadaaf educational',
    'alhadaaf platform',
    'alhadaf',
    'alhadaf edu',
    'al hadaaf',
    'al hadaf',
    // الاسم بالعربي بجميع أشكاله الإملائية والشائعة
    'الهداف',
    'الهدف',
    'الهداف التعليمي',
    'الهداف التعليمية',
    'منصة الهداف',
    'منصة الهداف التعليمي',
    'منصة الهداف التعليمية',
    'منصة الْهَدَّاف التعليمية',
    'قناة الهداف التعليمية',
    'موقع الهداف',
    'موقع الهداف التعليمي',
    'موقع الهداف التعليمية',
    'الاهداف التعليمية',
    // الكلمات التعليمية المستهدفة في البحث
    'شرح المناهج العربية',
    'المناهج السعودية',
    'المناهج المصرية',
    'المناهج الإماراتية',
    'المناهج الكويتية',
    'منهج سلطنة عمان',
    'منهج الأردن',
    'الثانوية العامة',
    'الشهادة الإعدادية',
    'نظام المسارات',
    'اختبارات تحصيلي',
    'اختبارات قدرات',
    'ملخصات دراسية PDF',
    'حصص مباشرة',
    'حصص تفاعلية مباشرة',
    'شرح الرياضيات',
    'شرح العلوم',
    'شرح الفيزياء',
    'شرح الكيمياء',
    'شرح الأحياء',
    'شرح اللغة العربية',
    'شرح اللغة الإنجليزية',
    'دروس اون لاين',
    'منصة تعليم عن بعد'
  ],
  authors: [{ name: 'الهداف التعليمي alhadaaf edu', url: 'https://alhadaf-edu.vercel.app' }],
  creator: 'الهداف التعليمي alhadaaf',
  publisher: 'الهداف التعليمي alhadaaf',
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
    title: 'الهداف التعليمي | alhadaaf edu | شروحات المناهج العربية والحصص المباشرة',
    description: 'منصة الهداف التعليمي (alhadaaf edu) — شروحات تفاعلية، اختبارات ذكية، ملخصات ومذكرات PDF، وحصص افتراضية مباشرة لكل المراحل التعليمية.',
    siteName: 'الهداف التعليمي | alhadaaf',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'شعار الهداف التعليمي alhadaaf edu',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'الهداف التعليمي | alhadaaf edu',
    description: 'شروحات المناهج العربية والحصص المباشرة والاختبارات التفاعلية لجميع المراحل.',
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
    google: 'google31fb6c9dbc97f2fe',
  },
  category: 'education',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'الهداف التعليمي | alhadaaf',
      alternateName: ['alhadaaf', 'alhadaaf edu', 'منصة الهداف التعليمي', 'الهداف التعليمية', 'منصة الهداف', 'alhadaf'],
      url: 'https://alhadaf-edu.vercel.app',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://alhadaf-edu.vercel.app/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'الهداف التعليمي (alhadaaf edu)',
      alternateName: ['alhadaaf', 'alhadaaf edu', 'منصة الهداف', 'الهداف التعليمية', 'منصة الهداف التعليمي', 'alhadaf', 'alhadaf edu'],
      url: 'https://alhadaf-edu.vercel.app',
      logo: 'https://alhadaf-edu.vercel.app/logo.png',
      image: 'https://alhadaf-edu.vercel.app/logo.png',
      description: 'الهداف التعليمي (alhadaaf edu) — منصة تعليمية عربية شاملة لشروحات المناهج الدراسية والحصص المباشرة والاختبارات التفاعلية.',
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
          { '@type': 'Course', name: 'شرح المناهج السعودية', provider: { '@type': 'Organization', name: 'الهداف التعليمي alhadaaf' } },
          { '@type': 'Course', name: 'شرح المناهج المصرية', provider: { '@type': 'Organization', name: 'الهداف التعليمي alhadaaf' } },
          { '@type': 'Course', name: 'حصص مباشرة تفاعلية', provider: { '@type': 'Organization', name: 'الهداف التعليمي alhadaaf' } },
        ]
      }
    }
  ];

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
