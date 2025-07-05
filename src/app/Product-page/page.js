'use client';
import React from 'react';
import BannerManager from './components/BannerManager';
import SliderManager from './components/SliderManager';
import KeyStatisticsManager from './components/KeyStatisticsManager';
import SectionThreeManager from './components/SectionThreeManager';
import WhyPayNXT360Manager from './components/WhyPayNXT360Manager';
import SectorDynamicsManager from './components/SectorDynamicsManager';

import 'antd/dist/reset.css';

export default function ProductPage() {
  return (
    <div className="p-6">
      <div id="banner"><BannerManager /></div>
      <div id="slider"><SliderManager /></div>
      <div id="key-stats"><KeyStatisticsManager /></div>
      <div id="section-three"><SectionThreeManager /></div>
      <div id="why-paynxt"><WhyPayNXT360Manager /></div>
      <div id="sector-dynamics"><SectorDynamicsManager /></div>
    </div>
  );
}
