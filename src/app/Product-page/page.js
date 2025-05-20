'use client';
import React from 'react';
import BannerManager from './components/BannerManager';
import SliderManager from './components/SliderManager';
import KeyStatisticsManager from './components/KeyStatisticsManager';
import SectionThreeManager from './components/SectionThreeManager';
import WhyPayNXT360Manager from './components/WhyPayNXT360Manager';
import SectorDynamicsManager from './components/SectorDynamicsManager';

import 'antd/dist/reset.css';

export default function HomePage() {
  return (
    <div className="p-6">
      <BannerManager />
      <SliderManager />
      <KeyStatisticsManager />
      <SectionThreeManager/>
      <WhyPayNXT360Manager/>
      <SectorDynamicsManager />
    </div>
  );
}