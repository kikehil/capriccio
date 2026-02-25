# Implementation Plan - Capriccio Visual Identity

This plan outlines the steps to fully transition the "Pizza Cerebro" application to the "Capriccio" brand identity.

## Phase 1: Header & Navigation
1.  **Create `BrandHeader`**: Implement the new header in `src/components/layout/BrandHeader.tsx`.
    - Use `capriccio-dark` background.
    - Add logo placeholder and "Pánuco, Veracruz" location indicator.
    - Add smooth transitions and shadow effects.
2.  **Integrate Header**: Replace the existing info bar in `src/app/page.tsx` with the new `BrandHeader`.

## Phase 2: Hero & Visual Assets
1.  **Update Hero Section**: Adjust the `h-[80vh]` hero in `page.tsx` to use more "artisan" imagery.
2.  **Generate Logo/Background**: Use AI image generation to create a professional logo for `/img/capriccio-logo.png` (or equivalent) and a new background if needed.

## Phase 3: Secondary Screens
1.  **Kitchen Dashboard**: Update `src/components/kitchen/KitchenDashboard.tsx` (if it exists) or the kitchen page to use `capriccio-dark` headers.
2.  **Admin Dashboard**: Update admin components for branding consistency.

## Phase 4: Final Polish
1.  **Global Styles**: Review `globals.css` for any leftover generic colors.
2.  **Animations**: Ensure `framer-motion` transitions use the brand colors (e.g., gold hover states).

## User Review Required
- [ ] Does the `BrandHeader` layout meet the expectations?
- [ ] Are the gold/dark tones warm enough?
