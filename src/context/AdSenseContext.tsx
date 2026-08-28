'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdSettings } from '@/types';

interface AdSenseContextType {
  settings: AdSettings;
  updateSettings: (newSettings: Partial<AdSettings>) => void;
}

const DEFAULT_SETTINGS: AdSettings = {
  headerBanner: true,
  sidebarSticky: true,
  inArticle: true,
  preRollBanner: true,
  footerBanner: true,
  adClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-0000000000000000',
};

const AdSenseContext = createContext<AdSenseContextType | undefined>(undefined);

export function AdSenseProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AdSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem('alhadaf_ad_settings');
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch {
        // use default
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<AdSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('alhadaf_ad_settings', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AdSenseContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AdSenseContext.Provider>
  );
}

export function useAdSense() {
  const context = useContext(AdSenseContext);
  if (!context) {
    throw new Error('useAdSense must be used within an AdSenseProvider');
  }
  return context;
}
