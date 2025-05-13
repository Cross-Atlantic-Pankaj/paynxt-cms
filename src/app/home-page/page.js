'use client';
import React from 'react';
import BannerManager from './components/BannerManager';
import SliderManager from './components/SliderManager';
import StatsManager from './components/StatsManager';
import PlatformSectionManager from './components/PlatformSectionManager';
import OurStrengthManager from './components/OurStrengthManager';
import ProductsManager from './components/ProductsManager';
import TechnologyPlatformManager from './components/TechnologyPlatformManager';
import ResearchInsightManager from './components/ResearchInsightManager';

import 'antd/dist/reset.css';

export default function HomePage() {
  return (
    <div className="p-6">
      <BannerManager />
      <SliderManager />
      <StatsManager />
      <PlatformSectionManager/>
      <OurStrengthManager />
      <ProductsManager/>
      <TechnologyPlatformManager/>
      <ResearchInsightManager/>
    </div>
  );
}