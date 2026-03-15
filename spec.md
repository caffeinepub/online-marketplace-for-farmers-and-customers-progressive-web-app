# Online Marketplace for Farmers and Customers - Progressive Web App

## Overview
An online marketplace connecting farmers with customers, allowing farmers to list their produce and customers to place orders. The application uses Internet Identity for authentication and is designed as a Progressive Web App (PWA) for mobile installation and offline functionality.

## User Types
- **Farmers**: Can register, create profiles, list produce, and manage orders
- **Customers**: Can register, browse produce, place orders, and track order status

## Authentication
- Internet Identity integration for secure login/registration for both farmers and customers

## Core Features

### Farmer Registration & Profile
- Farmers can sign up and create detailed profiles
- Profile information includes farmer details and contact information
- Farmers can edit their profile information

### Produce Management
- Farmers can list their produce with the following details:
  - Product name
  - Quantity available
  - Price per unit
  - Harvest details (date, location, etc.)
- Farmers can edit or remove their listed produce
- All produce listings are stored in the backend

### Customer Experience
- Customers can browse all available produce from different farmers
- Marketplace dashboard displays produce with filtering options:
  - Filter by category/type of produce
  - Filter by price range
  - Filter by specific farmer
- Customers can place orders for available produce

### Order Management
- **For Farmers**:
  - View all incoming orders for their produce
  - Update order status (pending, accepted, completed)
  - Track order history
- **For Customers**:
  - View all their placed orders
  - Track order status in real-time
  - View order history

## Progressive Web App Features

### PWA Manifest
- App name: "Farmers Marketplace"
- Short name: "FarmMarket"
- App icons in multiple sizes (192x192, 512x512)
- Theme color and background color configuration
- Display mode: standalone for full-screen mobile experience
- Start URL configuration
- Language: English

### Service Worker & Offline Support
- Cache key application assets (HTML, CSS, JavaScript, images)
- Cache all main application pages for offline access
- Implement offline fallback strategies for API calls
- Cache management for optimal performance

### Installation & Mobile Experience
- Automatic installation prompt for supported browsers
- Add to home screen functionality
- Full-screen mobile experience without browser UI
- Optimized touch interactions and gestures

## Application Screens
1. **Home/Marketplace Dashboard**: Browse all available produce with filters
2. **Farmer Dashboard**: Overview of farmer's produce and orders
3. **Add/Edit Produce**: Form for farmers to list new produce
4. **Orders**: Order management for both farmers and customers
5. **Profile**: User profile management

All screens must be fully responsive and optimized for mobile devices with touch-friendly interfaces.

## Data Storage (Backend)
- User profiles (farmers and customers)
- Produce listings with all details
- Order records with status tracking
- User authentication data linked to Internet Identity

## Navigation Flow
Home (produce list) → Farmer Dashboard → Add Produce → Orders → Profile

## UI/UX Requirements
- Clean, intuitive interface optimized for mobile-first design
- Full responsive design with mobile breakpoints
- Touch-friendly buttons and navigation elements
- Optimized layouts for small screens and portrait orientation
- Fast loading times and smooth animations
- Clear visual distinction between farmer and customer interfaces
- PWA-specific UI elements (installation prompts, offline indicators)
