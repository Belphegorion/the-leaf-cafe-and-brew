import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MonolineIcon } from '../brand/MonolineIcon';
import { useCartStore } from '../../stores/useCartStore';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    title: 'What mood defines your visit today?',
    options: [
      { id: 'zen', text: 'Peaceful reading & quiet contemplation', icon: 'cup' },
      { id: 'energize', text: 'Deep work focus & creative energy', icon: 'sparkles' },
      { id: 'celebrate', text: 'Celebration with friends & shared laughter', icon: 'table' },
    ],
  },
  {
    id: 2,
    title: 'What flavour profile calls to your palate?',
    options: [
      { id: 'bold_coffee', text: 'Bold single-origin specialty roast', icon: 'cup' },
      { id: 'comfort_savoury', text: 'Warm artisanal sourdough pizza or creamy pasta', icon: 'spoon' },
      { id: 'chilled_sweet', text: 'Decadent chilled shake or botanical cooler', icon: 'plant' },
    ],
  },
  {
    id: 3,
    title: 'Any dietary preferences today?',
    options: [
      { id: 'jain', text: 'Strict Jain preparation (No onion, garlic, root veg)', icon: 'sparkles' },
      { id: 'vegan', text: '100% Plant-based / Vegan oat milk', icon: 'plant' },
      { id: 'standard', text: 'Pure vegetarian classic indulgence', icon: 'bell' },
    ],
  },
];

const RECOMMENDATIONS = {
  zen: {
    name: 'Pour-Over V60 Special Reserve & Avocado Toast',
    description: 'Delicate floral single-origin Chikmagalur notes paired with fresh microgreens.',
    price: 460,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
  },
  energize: {
    name: 'Nitro Cold Brew & Artisanal Margherita Sourdough',
    description: 'Crisp creamy nitro foam with high caffeine clarity and 48-hour fermented crust.',
    price: 520,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  },
  celebrate: {
    name: 'Truffle Mushroom Pizza & Belgian Chocolate Shake',
    description: 'Wild forest button mushrooms, fior di latte, and dense single-estate cocoa.',
    price: 680,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
  },
};

export const TasteQuizModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [recommended, setRecommended] = useState<typeof RECOMMENDATIONS['zen'] | null>(null);

  const { addItem } = useCartStore();

  const handleSelect = (optionId: string) => {
    const nextAnswers = { ...answers, [currentStep]: optionId };
    setAnswers(nextAnswers);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Determine match
      const mood = nextAnswers[0] || 'zen';
      const match = RECOMMENDATIONS[mood as keyof typeof RECOMMENDATIONS] || RECOMMENDATIONS.zen;
      setRecommended(match);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setRecommended(null);
  };

  const handleAddToCart = () => {
    if (!recommended) return;
    addItem({
      id: `quiz_match_${Date.now()}`,
      name: recommended.name,
      slug: `quiz-match-${Date.now()}`,
      category: 'coffee',
      description: recommended.description,
      price: recommended.price,
      isPriceTbc: false,
      image: recommended.image,
      tags: ['bestseller'],
      isAvailable: true,
      prepTimeMinutes: 15,
      sortOrder: 99,
      customizations: [],
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-lg w-full bg-white dark:bg-[#1F3A24] p-6 md:p-8 rounded-3xl border border-[#325736]/30 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-[#142318]/70 dark:text-[#F7FBFA]/70 hover:bg-black/5"
              aria-label="Close quiz"
            >
              ✕
            </button>

            {!recommended ? (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#5E8662] dark:text-[#A3C2A5]">
                    Question 0{currentStep + 1} of 0{QUIZ_QUESTIONS.length}
                  </span>
                  <h3 className="font-display uppercase text-xl font-bold text-[#142318] dark:text-[#F7FBFA] mt-1">
                    {QUIZ_QUESTIONS[currentStep].title}
                  </h3>
                </div>

                <div className="space-y-3">
                  {QUIZ_QUESTIONS[currentStep].options.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelect(opt.id)}
                      className="w-full p-4 rounded-2xl border border-[#325736]/20 hover:border-[#325736] hover:bg-[#EEF5EE] dark:hover:bg-[#142318] text-left flex items-center gap-3 transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#EEF5EE] dark:bg-[#142318] flex items-center justify-center text-[#325736] dark:text-[#A3C2A5] shrink-0">
                        <MonolineIcon name={opt.icon as any} size={20} />
                      </div>
                      <span className="text-xs font-bold text-[#142318] dark:text-[#F7FBFA]">
                        {opt.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#EEF5EE] dark:bg-[#142318] text-[#325736] dark:text-[#A3C2A5] mx-auto flex items-center justify-center">
                  <MonolineIcon name="sparkles" size={32} />
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#5E8662] dark:text-[#A3C2A5]">
                    Your Perfect Palate Match
                  </span>
                  <h3 className="font-display uppercase text-2xl font-bold text-[#142318] dark:text-[#F7FBFA] mt-1">
                    {recommended.name}
                  </h3>
                </div>

                <img
                  src={recommended.image}
                  alt={recommended.name}
                  className="w-full h-40 rounded-2xl object-cover"
                />

                <p className="text-xs text-[#5E8662] dark:text-[#A3C2A5] max-w-sm mx-auto">
                  {recommended.description}
                </p>

                <div className="font-display text-2xl font-bold text-[#325736] dark:text-[#A3C2A5]">
                  ₹{recommended.price}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 py-3 rounded-full border border-[#325736] text-xs font-semibold uppercase tracking-wider text-[#325736] dark:text-[#A3C2A5]"
                  >
                    Retake Quiz
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 py-3 rounded-full bg-[#325736] text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#284A2D] shadow"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
