'use client';
import React from 'react';
import BannerManager from './components/BannerManager';
import SliderManager from './components/SliderManager';
import ReportManager from './components/ReportManager/page'; 
import ConsultManager from './components/ConsultManager';
import OurStrengthManager from './components/StrengthManager';
import AdvManager from './components/AdvManager';
import DelManager from './components/DelManager';

import 'antd/dist/reset.css';

export default function HomePage() {
  return (
    <div className="p-6">
      <BannerManager />
      <SliderManager />
      <ConsultManager />
      <AdvManager />
      <DelManager />
      <OurStrengthManager />
      <ReportManager />
    </div>
  );
}
