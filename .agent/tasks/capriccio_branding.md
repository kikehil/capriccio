# Task: Personalización de Identidad Visual "Capriccio"

## Description
Transformar la aplicación "Pizza Cerebro" en "Pizza Capriccio", aplicando una paleta de colores cálida (Negro, Oro, Accento Rojo Quemado), tipografías premium (Oswald para títulos, Montserrat para cuerpo) y un estilo rústico/artesanal que evoque el horno de leña.

## Proposed Changes

### Configuration & Theme
- [x] Configure Tailwind (globals.css v4) with `capriccio-gold`, `capriccio-dark`, and `capriccio-accent`.
- [x] Import Google Fonts: **Oswald** and **Montserrat**.

### Core Components Branding
- [x] **Home Page**: Update branding, hero section, and colors.
- [x] **PizzaCard**: Update price colors and "Add to Cart" button styles.
- [x] **FloatingCart**: Update colors and branding message.
- [x] **CustomizationModal**: Update selection highlights and button colors.
- [x] **CheckoutModal**: Update input focus states, total display, and confirmation button.
- [x] **Promotions**: Update promo data and slider visuals.

### New Components & Refinements
- [x] **BrandHeader**: Create a premium header component as requested.
- [x] **Kitchen/Admin Dashboards**: Update headers and accents to match the brand.
- [x] **Assets**: Generate/Verify logo and hero images.

## Verification Plan
1. Ensure all red/blue/yellow default Tailwind colors are replaced by brand variables.
2. Verify that font families `font-title` and `font-brand` are applied correctly.
3. check responsiveness of the new `BrandHeader`.
