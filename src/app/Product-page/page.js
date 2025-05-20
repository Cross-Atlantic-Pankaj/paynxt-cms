'use client';
import React from 'react';
import BannerManager from './components/BannerManager';
import SliderManager from './components/SliderManager';

import 'antd/dist/reset.css';

export default function HomePage() {
  return (
    <div className="p-6">
      <BannerManager />
      <SliderManager />
    </div>
  );
}