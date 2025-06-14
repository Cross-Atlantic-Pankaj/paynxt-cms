'use client';
import React from 'react';
import BannerManager from './components/BannerManager';
import SliderManager from './components/SliderManager';
import BlogManager from './components/BlogManager';
import ArticleManager from './components/ArticleManager';
import ConsultManager from './components/ConsultManager';
import FeatReportManager from './components/FeatReportManager';

import 'antd/dist/reset.css';

export default function HomePage() {
  return (
    <div className="p-6">
      <BannerManager />
      <SliderManager />
      <BlogManager />
      <ArticleManager />
      <ConsultManager />
      <FeatReportManager />
    </div>
  );
}
