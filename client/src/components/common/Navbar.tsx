import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { TheLeafLogo } from '../brand/TheLeafLogo';
import { MonolineIcon } from '../brand/MonolineIcon';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useCartStore } from '../../stores/useCartStore';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const location = useLocation();
  const cartItemCount = useCartStore(state => state.getItemCount());
  const openCart = useCartStore(state => state.openDrawer);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Check if scrolled past hero top margin
      setIsScrolled(currentScrollY > 40);

      // Hide on scroll down, show on scroll up (with a threshold)
      if (currentScrollY > 120) {
        if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 8) {
          // Scrolling down
          setIsVisible(false);
        } else if (lastScrollY - currentScrollY > 8) {
          // Scrolling up
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const navLinks = [
    { label: 'Menu', href: '/menu' },
    { label: 'Reserve Table', href: '/book' },
    { label: 'Order Ahead', href: '/pre-order' },
    { label: 'Dine-In QR', href: '/t/4' },
    { label: 'Account', href: '/account' },
    { label: 'Our Story', href: '/about' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-3 md:pt-4">
          <nav
            className={`flex items-center justify-between rounded-full transition-all duration-300 ${
              isScrolled
                ? 'bg-[#F5EFE4]/95 dark:bg-[#101C13]/95 backdrop-blur-xl border border-[#E0D2B8] dark:border-[#284A2D] shadow-md py-2 px-4 md:px-6'
                : 'bg-transparent py-2.5 px-2 md:px-4'
            }`}
            aria-label="Main Navigation"
          >
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#325736] rounded-lg min-h-[44px]"
              aria-label="The Leaf – Cafe and Brew Home"
            >
              <TheLeafLogo variant="horizontal" size={32} />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-7">
              {navLinks.map(link => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`relative text-xs uppercase tracking-[0.16em] font-medium transition-colors hover:text-[#325736] dark:hover:text-[#A3C2A5] py-2 min-h-[44px] flex items-center ${
                      isActive
                        ? 'text-[#325736] dark:text-[#A3C2A5] font-semibold'
                        : 'text-[#1F2A22]/80 dark:text-[#EDE3D1]/80'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavTab"
                        className="absolute bottom-1 left-0 right-0 h-[2px] bg-[#325736] dark:bg-[#A3C2A5] rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Action Buttons: Theme Toggle, Language Toggle, Cart Button, Table CTA, Mobile Hamburger */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <LanguageToggle />

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openCart}
                className="relative inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#E0D2B8] bg-white dark:bg-[#1F3A24] px-4 text-[#325736] shadow-sm backdrop-blur-md transition-all hover:border-[#325736] hover:bg-[#F5EFE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#325736] active:scale-95 dark:border-[#284A2D] dark:text-[#EDE3D1] dark:hover:bg-[#284A2D]"
                aria-label={`Cart, ${cartItemCount} items`}
                data-cursor="Cart"
              >
                <MonolineIcon name="bag" size={18} strokeWidth={2} />
                <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">Cart</span>
                {cartItemCount > 0 && (
                  <motion.span
                    key={cartItemCount}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-[#325736] text-[10px] font-bold text-white dark:bg-[#325736]"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </button>

              {/* Reserve CTA Button (Desktop) */}
              <Link
                to="/book"
                className="hidden lg:inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#325736] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-md transition-all hover:bg-[#284A2D] hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#325736] dark:bg-[#325736] dark:hover:bg-[#284A2D]"
                data-cursor="Book"
              >
                Book Table
              </Link>

              {/* Mobile Hamburger Button (Strictly 44x44px minimum) */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex md:hidden min-h-[44px] min-w-[44px] h-11 w-11 items-center justify-center rounded-full border border-[#E0D2B8] bg-white text-[#325736] shadow-sm transition-colors hover:border-[#325736] touch-press active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#325736] dark:border-[#284A2D] dark:bg-[#1F3A24] dark:text-[#EDE3D1]"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                <div className="relative h-4 w-4">
                  <span
                    className={`absolute left-0 top-1 h-[2px] w-4 bg-current transition-all duration-200 ${
                      isMobileMenuOpen ? 'top-2 rotate-45' : ''
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-3 h-[2px] w-4 bg-current transition-all duration-200 ${
                      isMobileMenuOpen ? 'top-2 -rotate-45' : ''
                    }`}
                  />
                </div>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Full-Screen Mobile Drawer with Staggered Links */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 flex flex-col justify-between bg-[#F5EFE4]/98 dark:bg-[#101C13]/98 px-6 pt-28 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] backdrop-blur-2xl md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            {/* Nav links */}
            <div className="flex flex-col gap-4 overflow-y-auto">
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#38483C] dark:text-[#A3C2A5]">
                Explore The Leaf
              </span>
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * idx, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center font-display text-2xl uppercase tracking-wider font-bold text-[#1F2A22] hover:text-[#325736] dark:text-[#EDE3D1] dark:hover:text-[#A3C2A5] touch-press active:scale-[0.98]"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Quick Action in Mobile Menu */}
            <div className="pt-5 border-t border-[#E0D2B8] dark:border-[#284A2D] flex flex-col gap-3 shrink-0">
              <Link
                to="/book"
                onClick={() => setIsMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center justify-center rounded-full bg-[#325736] py-3 text-xs font-semibold uppercase tracking-widest text-white shadow-md touch-press active:scale-95"
              >
                Reserve a Table
              </Link>
              <div className="text-center text-[11px] text-[#38483C] dark:text-[#C9DCC9]">
                Arera Colony, Bhopal • 100% Pure Vegetarian
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
