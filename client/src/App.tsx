import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Preloader } from './components/common/Preloader';
import { CustomCursor } from './components/common/CustomCursor';
import { ScrollProgressWave } from './components/common/ScrollProgressWave';
import { CartDrawer } from './components/cart/CartDrawer';
import { useLenis } from './hooks/useLenis';

// Complete Pages
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { BookingPage } from './pages/BookingPage';
import { PreOrderPage } from './pages/PreOrderPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { TableQRPage } from './pages/TableQRPage';
import { OrderTrackerPage } from './pages/OrderTrackerPage';
import { AboutPage } from './pages/AboutPage';
import { DesignSystemPage } from './pages/DesignSystemPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { InfoLegalPage } from './pages/InfoLegalPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  // Initialize Lenis smooth scroll
  useLenis();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FBFA] dark:bg-[#101C13] transition-colors duration-300">
      {/* 1. Branded Preloader on initial visit */}
      <Preloader />

      {/* 2. Scroll Progress Wave Indicator */}
      <ScrollProgressWave />

      {/* 3. Hardware-gated Custom Pointer */}
      <CustomCursor />

      {/* 4. Global Navbar */}
      <Navbar />

      {/* 5. Global Cart Drawer */}
      <CartDrawer />

      {/* 6. Page Content with Animated Page Transitions */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
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
      </div>

      {/* 7. Global Footer */}
      <Footer />
    </div>
  );
};
