import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import StatsSection from '@/components/home/StatsSection';
import CurriculumExplorer from '@/components/home/CurriculumExplorer';
import FeaturedLessonsCarousel from '@/components/home/FeaturedLessonsCarousel';
import LatestYouTubeVideos from '@/components/home/LatestYouTubeVideos';
import FeaturesSection from '@/components/home/FeaturesSection';
import AdSenseSlot from '@/components/common/AdSenseSlot';
import { INITIAL_LESSONS } from '@/lib/curriculumData';
import { fetchChannelVideos } from '@/lib/youtube';

export const revalidate = 300; // 5 min ISR

export default async function HomePage() {
  const channelVideos = await fetchChannelVideos(6);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Banner Ad */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <AdSenseSlot slotType="headerBanner" />
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* Stats Counter Section */}
      <StatsSection />

      {/* Curriculum Explorer Tabs */}
      <CurriculumExplorer />

      {/* In-feed Ad Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSenseSlot slotType="inArticle" />
      </div>

      {/* Featured Lessons Carousel */}
      <FeaturedLessonsCarousel initialLessons={INITIAL_LESSONS} />

      {/* Live YouTube Videos Section */}
      <LatestYouTubeVideos videos={channelVideos} />

      {/* Platform Features / Value Proposition */}
      <FeaturesSection />
    </div>
  );
}
