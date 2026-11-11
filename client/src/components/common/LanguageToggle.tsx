import React, { useState, useEffect } from 'react';

export const LanguageToggle: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'hi'>(() => {
    return (localStorage.getItem('theleaf_lang') as 'en' | 'hi') || 'en';
  });

  const toggleLanguage = () => {
    const next = lang === 'en' ? 'hi' : 'en';
    setLang(next);
    localStorage.setItem('theleaf_lang', next);
    document.documentElement.lang = next;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#E0D2B8] bg-white dark:bg-[#1F3A24] px-2.5 text-xs font-bold uppercase tracking-wider text-[#325736] shadow-sm transition-all hover:border-[#325736] hover:bg-[#F5EFE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#325736] active:scale-95 dark:border-[#284A2D] dark:text-[#EDE3D1] dark:hover:bg-[#284A2D]"
      aria-label={`Switch language. Current language: ${lang === 'en' ? 'English' : 'Hindi'}`}
      title={lang === 'en' ? 'Switch to Hindi (हिन्दी)' : 'Switch to English'}
    >
      <span className="font-mono text-[11px]">{lang === 'en' ? 'EN' : 'हि'}</span>
    </button>
  );
};
