import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { TheLeafLogo } from '../brand/TheLeafLogo';
import { MonolineIcon } from '../brand/MonolineIcon';
import { ThemeToggle } from './ThemeToggle';
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

  const navLinks = [
    { label: 'Menu', href: '/menu' },
    { label: 'Reserve Table', href: '/book' },
    { label: 'Order Ahead', href: '/pre-order' },
    { label: 'Dine-In QR', href: '/t/4' },
    { label: 'Our Story', href: '/about' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-3 md:pt-5">
          <nav
            className={`flex items-center justify-between rounded-full transition-all duration-300 ${
              isScrolled
                ? 'bg-[#F7FBFA]/90 dark:bg-[#101C13]/90 backdrop-blur-xl border border-[#325736]/15 dark:border-[#F7FBFA]/15 shadow-lg py-2.5 px-5 md:px-7'
                : 'bg-transparent py-3 px-2 md:px-4'
            }`}
            aria-label="Main Navigation"
          >
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#325736] rounded-lg"
              aria-label="The Leaf – Cafe and Brew Home"
            >
              <TheLeafLogo variant="horizontal" size={32} />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-7">
              {navLinks.map(link => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`relative text-xs uppercase tracking-[0.16em] font-medium transition-colors hover:text-[#325736] dark:hover:text-[#A3C2A5] py-1 ${
                      isActive
                        ? 'text-[#325736] dark:text-[#A3C2A5] font-semibold'
                        : 'text-[#142318]/80 dark:text-[#F7FBFA]/80'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavTab"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#325736] dark:bg-[#A3C2A5] rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Action Buttons: Theme Toggle, Cart Button, Table CTA, Mobile Hamburger */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <ThemeToggle />

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openCart}
                className="relative inline-flex h-10 items-center gap-2 rounded-full border border-[#325736]/20 bg-[#F7FBFA]/80 px-3.5 text-[#325736] shadow-sm backdrop-blur-md transition-all hover:border-[#325736] hover:bg-[#EEF5EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#325736] active:scale-95 dark:border-[#F7FBFA]/20 dark:bg-[#1F3A24]/90 dark:text-[#F7FBFA] dark:hover:bg-[#284A2D]"
                aria-label={`Open Cart with ${cartItemCount} items`}
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
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-[#325736] text-[10px] font-bold text-[#F7FBFA] dark:bg-[#5E8662]"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </button>

              {/* Reserve CTA Button (Desktop) */}
              <Link
                to="/book"
                className="hidden lg:inline-flex items-center justify-center rounded-full bg-[#325736] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F7FBFA] shadow-md transition-all hover:bg-[#284A2D] hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#325736] dark:bg-[#5E8662] dark:hover:bg-[#325736]"
                data-cursor="Book"
              >
                Book Table
              </Link>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-full border border-[#325736]/20 bg-[#F7FBFA]/80 text-[#325736] backdrop-blur-md transition-colors hover:border-[#325736] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#325736] dark:border-[#F7FBFA]/20 dark:bg-[#1F3A24]/90 dark:text-[#F7FBFA]"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                <div className="relative h-4 w-4">
                  <span
                    className={`absolute left-0 top-1 h-[2px] w-4 bg-current transition-all duration-300 ${
                      isMobileMenuOpen ? 'top-2 rotate-45' : ''
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-3 h-[2px] w-4 bg-current transition-all duration-300 ${
                      isMobileMenuOpen ? 'top-2 -rotate-45' : ''
                    }`}
                  />
                </div>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Full-Screen Mobile Drawer with Staggered Links & Leaf Vines */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 flex flex-col justify-between bg-[#F7FBFA]/98 dark:bg-[#101C13]/98 px-6 pt-28 pb-10 backdrop-blur-2xl md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            {/* Nav links */}
            <div className="flex flex-col gap-6">
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#5E8662]">
                Explore The Leaf
              </span>
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between border-b border-[#325736]/10 dark:border-[#F7FBFA]/10 pb-3 text-2xl font-display uppercase tracking-wider text-[#142318] dark:text-[#F7FBFA] hover:text-[#325736]"
                  >
                    <span>{link.label}</span>
                    <MonolineIcon name="arrow-right" size={20} className="text-[#5E8662]" />
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-4 flex flex-col gap-3"
              >
                <Link
                  to="/book"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center rounded-full bg-[#325736] py-3.5 text-sm font-semibold uppercase tracking-wider text-[#F7FBFA] shadow-md dark:bg-[#5E8662]"
                >
                  Book a Table
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center rounded-full border border-[#325736]/30 py-3 text-xs uppercase tracking-wider text-[#325736] dark:text-[#A3C2A5]"
                >
                  Staff &amp; Admin Portal
                </Link>
              </motion.div>
            </div>

            {/* Bottom info */}
            <div className="border-t border-[#325736]/10 dark:border-[#F7FBFA]/10 pt-5 text-xs text-[#5E8662] dark:text-[#A3C2A5] flex flex-col gap-1">
              <p className="font-semibold text-[#325736] dark:text-[#F7FBFA]">1st Floor, E-7, Arera Colony, Bhopal</p>
              <p>11:00 AM – 11:30 PM Daily · 100% Pure Vegetarian</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
