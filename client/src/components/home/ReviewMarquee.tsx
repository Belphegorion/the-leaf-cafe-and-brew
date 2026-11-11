import React from 'react';
import { MonolineIcon } from '../brand/MonolineIcon';

interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  timeAgo: string;
  comment: string;
  highlight: string;
}

const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'Aarav Sharma',
    location: 'Arera Colony, Bhopal',
    rating: 5,
    timeAgo: '1 week ago',
    comment: 'Hands down the best pure vegetarian cafe in Bhopal. The Peri Peri Paneer Pizza had the crispiest crust and the chocolate shake is divine!',
    highlight: 'Peri Peri Paneer Pizza & Brownie Shake',
  },
  {
    id: 'rev-2',
    author: 'Priya Malviya',
    location: 'Bhopal Central',
    rating: 5,
    timeAgo: '2 weeks ago',
    comment: 'Such a peaceful, aesthetic sanctuary. The arched windows, plant decor, and slow pour-over coffee make it my absolute favourite workspace.',
    highlight: 'Single-Origin Pour Over Coffee',
  },
  {
    id: 'rev-3',
    author: 'Rohan Deshmukh',
    location: 'Shahpura, Bhopal',
    rating: 5,
    timeAgo: '3 weeks ago',
    comment: 'The exotic garlic bread and truffle alfredo pasta were extraordinary. Outstanding vegetarian continental menu without compromising on taste.',
    highlight: 'Exotic Cheesy Garlic Bread',
  },
  {
    id: 'rev-4',
    author: 'Ananya Verma',
    location: 'E-7 Patan, Bhopal',
    rating: 5,
    timeAgo: '1 month ago',
    comment: 'Finding a 100% veg cafe with such high-end cafe aesthetics and 4.9 food quality in Bhopal is a rare blessing. 10/10 recommendation!',
    highlight: '100% Pure Vegetarian Quality',
  },
  {
    id: 'rev-5',
    author: 'Dr. Vivek Saxena',
    location: 'MP Nagar, Bhopal',
    rating: 5,
    timeAgo: '1 month ago',
    comment: 'Visited for our family dinner. The spinach corn bruschetta and iced hazelnut brew were world-class. Parking is hassle-free too.',
    highlight: 'Spinach & Corn Bruschetta',
  },
];

export const ReviewMarquee: React.FC = () => {
  // Duplicate array for seamless infinite marquee loop
  const marqueeList = [...REVIEWS, ...REVIEWS];

  return (
    <section className="py-20 bg-[#F5EFE4] dark:bg-[#142318] overflow-hidden border-t border-[#325736]/10 dark:border-[#F7FBFA]/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10 text-center">
        {/* Rating Trust Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#325736] px-4 py-1.5 text-xs font-semibold text-[#F7FBFA] shadow-sm mb-3">
          <MonolineIcon name="star" size={14} color="#C98A1B" />
          <span>4.9 / 5.0 Star Rating</span>
          <span className="opacity-70">·</span>
          <span className="font-normal opacity-90">646 Verified Google Reviews</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wider font-bold text-[#142318] dark:text-[#F7FBFA]">
          WORDS FROM BHOPAL PATRONS
        </h2>
        <p className="text-xs sm:text-sm text-[#38483C] dark:text-[#A3C2A5] mt-1">
          Hover over any card to pause reading
        </p>
      </div>

      {/* Marquee Track */}
      <div className="relative w-full overflow-hidden">
        {/* Gradient edge masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-[#F5EFE4] dark:from-[#142318] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-[#F5EFE4] dark:from-[#142318] to-transparent" />

        <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none w-max py-4">
          {marqueeList.map((review, i) => (
            <div
              key={`${review.id}-${i}`}
              className="double-bezel-shell w-[340px] sm:w-[380px] shrink-0"
            >
              <div className="double-bezel-core p-6 flex flex-col justify-between h-full bg-white dark:bg-[#1F3A24]">
                <div>
                  {/* Stars & Highlight tag */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#C98A1B]">
                      {[...Array(review.rating)].map((_, s) => (
                        <MonolineIcon key={s} name="star" size={14} color="#C98A1B" />
                      ))}
                    </div>
                    <span className="rounded-full bg-[#325736]/10 px-2 py-0.5 text-[10px] font-semibold text-[#325736] dark:bg-white/10 dark:text-[#A3C2A5]">
                      {review.highlight}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="mt-4 text-xs sm:text-sm text-[#142318]/85 dark:text-[#F7FBFA]/85 leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="mt-6 flex items-center justify-between border-t border-[#325736]/10 dark:border-[#F7FBFA]/10 pt-3 text-xs">
                  <div>
                    <p className="font-bold text-[#142318] dark:text-[#F7FBFA]">
                      {review.author}
                    </p>
                    <p className="text-[11px] text-[#38483C] dark:text-[#A3C2A5]">
                      {review.location}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#38483C] dark:text-[#A3C2A5]">
                    {review.timeAgo}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
