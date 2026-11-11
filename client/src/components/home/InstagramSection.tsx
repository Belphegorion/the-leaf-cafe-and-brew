import React from 'react';
import { MonolineIcon } from '../brand/MonolineIcon';
import { BUSINESS_FACTS } from '../../../../shared/constants';

const INSTA_POSTS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    caption: 'Pouring morning tranquility in Arera Colony. Our single-estate Colombian roasts are ready.',
    likes: 184,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    caption: 'Lush greenery, natural sunlight and the scent of freshly baked artisanal sourdough crusts.',
    likes: 242,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    caption: 'Handcrafted Truffle Margherita with basil harvested fresh this morning.',
    likes: 310,
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    caption: 'Evening amber glow at our arched courtyard tables. Pure vegetarian sanctuary.',
    likes: 275,
  },
];

export const InstagramSection: React.FC = () => {
  return (
    <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#38483C] dark:text-[#A3C2A5]">
            Community &amp; Culture
          </span>
          <h2 className="font-display text-2xl md:text-4xl uppercase tracking-wider font-bold text-[#142318] dark:text-[#F7FBFA] mt-1">
            Follow {BUSINESS_FACTS.instagramHandle}
          </h2>
          <p className="text-xs md:text-sm text-[#38483C] dark:text-[#A3C2A5] mt-1">
            Tag us in your coffee stories to be featured on our community wall.
          </p>
        </div>

        <a
          href={BUSINESS_FACTS.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[#325736] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#325736] dark:text-[#A3C2A5] hover:bg-[#325736] hover:text-white transition-all shadow-sm"
        >
          <MonolineIcon name="sparkles" size={16} />
          <span>Follow on Instagram</span>
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {INSTA_POSTS.map(post => (
          <a
            key={post.id}
            href={BUSINESS_FACTS.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square rounded-2xl overflow-hidden border border-[#325736]/15 shadow-sm block"
          >
            <img
              src={post.image}
              alt="The Leaf cafe Instagram story"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between text-white">
              <span className="text-xs font-bold font-mono">♥ {post.likes}</span>
              <p className="text-[10px] line-clamp-3 leading-snug">{post.caption}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
