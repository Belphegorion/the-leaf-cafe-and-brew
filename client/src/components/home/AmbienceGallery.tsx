import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryImage {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  aspect: string;
}

const GALLERY_PHOTOS: GalleryImage[] = [
  {
    id: 'g1',
    src: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    title: 'The Arched Botanical Window',
    subtitle: 'Natural Bhopal daylight through emerald greenery',
    aspect: 'aspect-[3/4]',
  },
  {
    id: 'g2',
    src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    title: 'Warm Wood & Indoor Seating',
    subtitle: 'Quiet corners designed for reading, coffee dates & conversations',
    aspect: 'aspect-[4/3]',
  },
  {
    id: 'g3',
    src: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
    title: 'Artisanal Barista Pour-Overs',
    subtitle: 'Slow, deliberate extraction of single-origin Indian coffees',
    aspect: 'aspect-[3/4]',
  },
  {
    id: 'g4',
    src: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=800&q=80',
    title: 'Evening Glow at The Leaf',
    subtitle: 'Warm ambient lighting for intimate dinner gatherings',
    aspect: 'aspect-[4/3]',
  },
];

export const AmbienceGallery: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryImage | null>(null);

  useEffect(() => {
    if (!selectedPhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPhoto(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto]);

  return (
    <section className="py-24 bg-[#F5EFE4] dark:bg-[#101C13]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#5E8662] dark:text-[#A3C2A5]">
            Visual Sanctuary
          </span>
          <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-wider font-bold text-[#142318] dark:text-[#F7FBFA] mt-1">
            THE LEAF AMBIENCE
          </h2>
          <p className="text-sm text-[#142318]/70 dark:text-[#F7FBFA]/70 mt-2">
            A serene retreat tucked away on the 1st Floor of E-7 Arera Colony. Minimalist design, living plants, and artisanal warmth.
          </p>
        </div>

        {/* Masonry / Staggered Grid with Arched Masks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {GALLERY_PHOTOS.map((item, idx) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={() => setSelectedPhoto(item)}
              className={`group relative cursor-pointer overflow-hidden ${item.aspect} ${
                idx % 2 === 0 ? 'arch-mask' : 'rounded-3xl'
              } border border-[#325736]/20 bg-[#284A2D] shadow-lg`}
              data-cursor="View"
            >
              <img
                src={item.src}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#142318]/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="absolute bottom-0 left-0 right-0 p-5 text-white transform translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-xs font-bold uppercase tracking-wider text-[#A3C2A5]">
                  {item.title}
                </p>
                <p className="text-[11px] text-[#C9DCC9] mt-0.5 line-clamp-1">
                  {item.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label="Image Lightbox"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="relative max-w-4xl w-full flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-12 right-0 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors touch-manipulation focus-visible:outline-2 focus-visible:outline-white"
                aria-label="Close Lightbox"
              >
                ✕
              </button>
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.title}
                className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-2xl border border-white/10"
              />
              <div className="mt-4 text-center text-white">
                <h3 className="font-display text-xl uppercase tracking-wider font-bold">
                  {selectedPhoto.title}
                </h3>
                <p className="text-xs text-[#A3C2A5] mt-1">
                  {selectedPhoto.subtitle}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
