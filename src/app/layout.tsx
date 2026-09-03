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
    default: 'منصة الهَدَّاف التعليمية | المناهج العربية الشاملة',
    template: '%s | منصة الهَدَّاف التعليمية',
  },
  description: 'المنصة التعليمية الرسمية لشروحات المناهج العربية (مصر، السعودية، الإمارات، الكويت، الأردن، وغيرها)، مذكرات وملخصات PDF جاهزة، واختبارات تفاعلية ذكية لكافة الصفوف والمراحل.',
  keywords: [
    'الهَدَّاف',
    'قناة الهداف',
    'المناهج التعليمية',
    'المناهج السعودية',
    'المناهج المصرية',
    'الثانوية العامة',
    'الشهادة الإعدادية',
    'نظام المسارات',
    'اختبارات تحصيلي',
    'اختبارات قدرات',
    'ملخصات دراسية PDF',
  ],
  authors: [{ name: 'منصة الهَدَّاف التعليمية' }],
  creator: 'منصة الهَدَّاف التعليمية',
  publisher: 'منصة الهَدَّاف التعليمية',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://alhadaf-edu.vercel.app'),
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_AR',
    url: 'https://alhadaf-edu.vercel.app',
    title: 'منصة الهَدَّاف التعليمية | المناهج العربية الشاملة',
    description: 'شروحات واختبارات تفاعلية لجميع الصفوف والمراحل التعليمية في الوطن العربي.',
    siteName: 'منصة الهَدَّاف التعليمية',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'شعار منصة الْهَدَّاف التعليمية',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'منصة الْهَدَّاف التعليمية | المناهج السعودية',
    description: 'شروحات واختبارات تفاعلية لجميع الصفوف والمراحل التعليمية في المملكة العربية السعودية.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'منصة الْهَدَّاف التعليمية',
    url: 'https://alhadaf-edu.vercel.app',
    logo: 'https://alhadaf-edu.vercel.app/logo.png',
    description: 'منصة تعليمية متكاملة لخدمة طلاب ومعلمي المناهج السعودية للمراحل الابتدائية والمتوسطة والثانوية.',
    sameAs: [
      'https://www.youtube.com/channel/UCb9BGNPlPd2dzg9lJsIaFYQ',
    ],
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
