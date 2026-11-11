"use strict";
// Exact Business Facts and Configuration Constants for The Leaf – Cafe and Brew
// STRICT RULE: All phone, WhatsApp, GSTIN, FSSAI are placeholders. Never fabricate them.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MENU_CATEGORIES = exports.BRAND_TOKENS = exports.PLACEHOLDERS = exports.BUSINESS_FACTS = void 0;
// Safe universal environment accessor that works seamlessly across browser, Vite, and Node.js
const getEnvVar = (key) => {
    const g = globalThis;
    if (g.process?.env?.[key]) {
        return g.process.env[key];
    }
    try {
        const meta = new Function('return import.meta')();
        if (meta?.env?.[key]) {
            return meta.env[key];
        }
    }
    catch {
        // Ignore in non-ESM environments
    }
    return undefined;
};
exports.BUSINESS_FACTS = {
    name: 'The Leaf – Cafe and Brew',
    address: '1st Floor, E7/161, E-7, Arera Colony, Bhopal, MP 462016',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    pincode: '462016',
    phone: getEnvVar('VITE_CAFE_PHONE') || '+91 755 XXXXXXX (Config Placeholder)',
    whatsapp: getEnvVar('VITE_CAFE_WHATSAPP') || '+91 98930 XXXXX (Config Placeholder)',
    phonePlaceholder: '+91 755 XXXXXXX (Config Placeholder)',
    instagram: 'https://www.instagram.com/theleafverse/',
    instagramUrl: 'https://www.instagram.com/theleafverse/',
    instagramHandle: '@theleafverse',
    hoursDisplay: '11:00 AM – 11:30 PM daily (Hours unconfirmed / subject to verification)',
    isPureVeg: true,
    dietaryStandard: '100% Pure Vegetarian Sanctuary',
    averageCostForTwo: 1000,
    googleRating: 4.9,
    googleRatingCount: 646,
    preOrderMinBufferMinutes: 20,
    tableDepositDefault: 0, // Toggleable in admin
    deliveryEnabled: false, // Delivery requires aggregator confirmation
    gstRate: 0.05,
};
exports.PLACEHOLDERS = {
    GSTIN: '23AAAAA0000A1Z5 (PLACEHOLDER - Awaiting Cafe GSTIN Certificate)',
    FSSAI: '10020000000000 (PLACEHOLDER - Awaiting Cafe FSSAI License No.)',
    GOOGLE_MAPS_LINK: 'https://maps.google.com/?q=The+Leaf+Cafe+and+Brew+Arera+Colony+Bhopal',
    GOOGLE_MAPS_EMBED: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3666.5!2d77.42!3d23.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDEyJzAwLjAiTiA3N8KwMjUnMTIuMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin',
};
// Brand Color Tokens (Single source of truth matching logo)
exports.BRAND_TOKENS = {
    primary: '#325736', // Leaf Green
    background: '#F7FBFA', // Soft White
    greenScale: {
        '50': '#EEF5EE',
        '100': '#E2EEE2',
        '200': '#C9DCC9',
        '300': '#A3C2A5',
        '500': '#5E8662',
        '700': '#325736',
        '800': '#284A2D',
        '900': '#1F3A24',
        '950': '#142318',
    },
    functional: {
        error: '#B3402F',
        warning: '#C98A1B',
        success: '#5E8662',
    },
    dark: {
        bg: '#101C13',
        surface: '#1F3A24',
        text: '#F7FBFA',
        border: '#284A2D',
    },
};
exports.MENU_CATEGORIES = [
    { id: 'coffee', name: 'Specialty Coffee', icon: 'cup', description: 'Single-origin Arabica beans, pour-overs, aeropress & espresso' },
    { id: 'cold-brews', name: 'Artisan Cold Brews', icon: 'cup', description: '18-hour slow-steeped smooth botanical extractions' },
    { id: 'shakes', name: 'Thick Shakes & Frappés', icon: 'cup', description: 'Handcrafted rich Belgian chocolate, brownies and nuts' },
    { id: 'mojitos-coolers', name: 'Botanical Coolers', icon: 'plant', description: 'Fresh mint, kaffir lime, cucumber & sparkling botanical refreshers' },
    { id: 'pizza', name: 'Wood-Fired Pizzas', icon: 'spoon', description: 'Hand-stretched sourdough crust with house marinara & gourmet cheese' },
    { id: 'pasta', name: 'Handmade Pastas', icon: 'spoon', description: 'Slow-simmered rich sauces with fresh herbs and garden vegetables' },
    { id: 'garlic-bread-bruschetta', name: 'Breads & Bruschetta', icon: 'spoon', description: 'Toasted artisan baguettes, house herb butter & roasted toppings' },
    { id: 'salads', name: 'Garden Bowls & Salads', icon: 'plant', description: 'Organic crisp greens, pomegranate sumac & citrus dressings' },
    { id: 'chinese', name: 'Pan-Asian Wok Delicacies', icon: 'spoon', description: 'Wok-tossed noodles, crispy lotus stem, dim sums & Manchurian' },
    { id: 'sandwiches', name: 'Pressed Sandwiches', icon: 'spoon', description: 'Grilled focaccia, paneer tikka, pesto and seasonal vegetables' },
    { id: 'desserts', name: 'Pastries & Desserts', icon: 'star', description: 'Tiramisu, molten chocolate cakes, and eggless brownies' },
];
