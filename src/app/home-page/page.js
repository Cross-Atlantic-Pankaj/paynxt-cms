'use client';
import React from 'react';
import BannerManager from './components/BannerManager';
import SliderManager from './components/SliderManager';
import 'antd/dist/reset.css';

export default function HomePage() {
  return (
    <div className="p-6">
        <h2 className="text-2xl font-semibold flex justify-center items-center">Top Banners</h2>
      <BannerManager />
      <SliderManager />
    </div>
  );
}