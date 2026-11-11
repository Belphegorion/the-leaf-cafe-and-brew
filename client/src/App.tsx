import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Preloader } from './components/common/Preloader';
import { CustomCursor } from './components/common/CustomCursor';
import { ScrollProgressWave } from './components/common/ScrollProgressWave';
import { CartDrawer } from './components/cart/CartDrawer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useLenis } from './hooks/useLenis';

import { HomePage } from './pages/HomePage';
const MenuPage = lazy(() => import('./pages/MenuPage').then(m => ({ default: m.MenuPage })));
const BookingPage = lazy(() => import('./pages/BookingPage').then(m => ({ default: m.BookingPage })));
const PreOrderPage = lazy(() => import('./pages/PreOrderPage').then(m => ({ default: m.PreOrderPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const TableQRPage = lazy(() => import('./pages/TableQRPage').then(m => ({ default: m.TableQRPage })));
const OrderTrackerPage = lazy(() => import('./pages/OrderTrackerPage').then(m => ({ default: m.OrderTrackerPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then(m => ({ default: m.AccountPage })));
const DesignSystemPage = lazy(() => import('./pages/DesignSystemPage').then(m => ({ default: m.DesignSystemPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const InfoLegalPage = lazy(() => import('./pages/InfoLegalPage').then(m => ({ default: m.InfoLegalPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const RouteLoadingFallback: React.FC = () => (
  <div
    className="min-h-[60dvh] flex items-center justify-center p-8"
    role="status"
    aria-label="Loading sanctuary view..."
  >
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#325736] border-t-transparent" />
      <span className="font-display text-xs uppercase tracking-widest text-[#325736] dark:text-[#A3C2A5]">
        The Leaf • Loading...
      </span>
    </div>
  </div>
);

export const App: React.FC = () => {
  // Initialize Lenis smooth scroll
  useLenis();
  const location = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#F5EFE4] text-[#1F2A22] dark:bg-[#101C13] dark:text-[#EDE3D1] transition-colors duration-300">
      {/* 1. Skip to main content landmark for keyboard / screen-reader accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[9999] px-4 py-2 bg-[#325736] text-white rounded-xl font-semibold shadow-xl ring-2 ring-white"
      >
        Skip to main content
      </a>

      {/* 2. Branded Preloader on initial visit */}
      <Preloader />

      {/* 3. Scroll Progress Wave Indicator */}
      <ScrollProgressWave />

      {/* 4. Hardware-gated Custom Pointer */}
      <CustomCursor />

      {/* 5. Global Navbar */}
      <Navbar />

      {/* 6. Global Cart Drawer */}
      <CartDrawer />

      {/* 7. Page Content with Error Boundary and Animated Route Transitions */}
      <div className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Routes location={location}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/book" element={<BookingPage />} />
                  <Route path="/pre-order" element={<PreOrderPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/t/:tableId" element={<TableQRPage />} />
                  <Route path="/order/:id" element={<OrderTrackerPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/contact" element={<InfoLegalPage />} />
                  <Route path="/faq" element={<InfoLegalPage />} />
                  <Route path="/privacy" element={<InfoLegalPage />} />
                  <Route path="/terms" element={<InfoLegalPage />} />
                  <Route path="/design" element={<DesignSystemPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* 8. Global Footer */}
      <Footer />
    </div>
  );
};
