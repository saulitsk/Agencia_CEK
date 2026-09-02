---
name: Horizonte Editorial
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#454650'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#767681'
  outline-variant: '#c6c5d1'
  surface-tint: '#4e5a98'
  primary: '#000a3e'
  on-primary: '#ffffff'
  primary-container: '#12205c'
  on-primary-container: '#7d89cb'
  inverse-primary: '#b9c3ff'
  secondary: '#7c5800'
  on-secondary: '#ffffff'
  secondary-container: '#fec247'
  on-secondary-container: '#715000'
  tertiary: '#62603f'
  on-tertiary: '#ffffff'
  tertiary-container: '#b0ac86'
  on-tertiary-container: '#424023'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dee1ff'
  primary-fixed-dim: '#b9c3ff'
  on-primary-fixed: '#041452'
  on-primary-fixed-variant: '#36427f'
  secondary-fixed: '#ffdea6'
  secondary-fixed-dim: '#f8bd42'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#e9e4bb'
  tertiary-fixed-dim: '#ccc8a0'
  on-tertiary-fixed: '#1e1c04'
  on-tertiary-fixed-variant: '#4a4829'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
  deep-navy: '#12205C'
  vibrant-gold: '#F4B93E'
  cream-canvas: '#F7F2C8'
  pure-white: '#FFFFFF'
typography:
  display-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 64px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  section-gap: 120px
---

## Brand & Style

The design system blends the sophisticated, boutique feel of a high-end hotel with the regional warmth and accessibility of a premier Brazilian travel agency. The aesthetic is **Editorial Modernism**—characterized by high-contrast color blocks, generous whitespace, and a focus on grand photography.

The brand personality is authoritative yet welcoming, evocative of the golden age of travel but updated for a digital-first audience. It relies on bold, chunky typography to project confidence and reliability, while using "ticket-inspired" design motifs (like serrated edges and perforated lines) to ground the digital experience in the tangible nostalgia of physical travel.

## Colors

The palette is rooted in a **Deep Navy** base that provides a serious, premium foundation. This is punctuated by **Vibrant Gold/Amber**, used strategically for action-oriented elements and brand accents to evoke the warmth of the "Novo Horizonte" sun. 

**Cream Canvas** serves as a softer, more sophisticated alternative to pure white for backgrounds, adding a boutique "vintage paper" feel. Use the secondary Cream color for large content blocks or sections to provide a high-contrast but "warm" reading experience. Pure White is reserved strictly for high-clarity text on Navy backgrounds or small UI details.

## Typography

This design system uses a high-contrast typographic pairing. Headings utilize **Plus Jakarta Sans** in its heaviest weights (ExtraBold/Bold) and are always styled in **All-Caps**. This creates the "chunky, friendly" editorial look required, while its rounded terminals ensure the brand remains approachable.

For body text, **Hanken Grotesk** provides a clean, neutral, and highly legible counterpoint, ensuring long-form content and destination lists are easy to scan. 

**JetBrains Mono** is used sparingly for labels and "ticket metadata" (dates, times, seat numbers) to reinforce the technical/travel-utility aspect of the brand.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** on desktop (12 columns) with extreme whitespace to mirror the Drake Hotel's "boutique" layout. 

Key principles:
- **Full-Bleed Imagery:** Main sections should lead with edge-to-edge photography of destinations or fleet vehicles.
- **Asymmetrical Padding:** Use generous, intentional gaps (120px+) between major sections to allow the brand elements "room to breathe."
- **Editorial Alignment:** Text blocks should often be centered or offset with wide margins to prevent a "crowded" commercial feel.
- **Mobile Reflow:** On mobile, margins tighten to 20px, and section gaps reduce to 64px, maintaining the verticality of the editorial style.

## Elevation & Depth

This design system avoids traditional drop shadows in favor of **Tonal Layers** and **Bold Outlines**. 

Depth is achieved through color-blocking (e.g., a Navy card sitting on a Cream background). When an element needs to feel elevated, such as a ticket promo block, use a crisp 1px border in a slightly darker or lighter shade of the background color. 

Interactive elements like buttons use a "Hard Shadow" (0px blur, 4px offset) in Navy to create a tactile, physical feel without the "fuzzy" aesthetic of standard SaaS interfaces.

## Shapes

The primary shape language is **Rounded**, mirroring the chunky terminals of the headline typography. 

A unique brand element is the **Serrated Edge**. This should be applied to the top and bottom (or left and right) of "Promo Blocks" and "Featured Tickets." This zig-zag cut-out reinforces the travel agency theme. The "NH" sun logo should be used as a watermark or a centered anchor point between sections, often breaking the boundary between two background colors.

## Components

### Buttons
Buttons are solid-fill **Vibrant Gold** with **Deep Navy** text. They utilize a `rounded-lg` radius. The hover state should involve a slight vertical shift (lifting up) with a hard Navy shadow appearing underneath.

### Ticket Promo Blocks
These are the signature components. They use the **Cream Canvas** background and feature **serrated/notched edges**. They should include a perforated line (dashed border) to separate the "Promo Title" from the "Action/CTA" area of the block.

### Input Fields
Inputs use a minimal style: a solid 1px Navy border on a White or Cream background. Focus states should highlight the border in Vibrant Gold. Labels always use the `label-caps` (Monospaced) typography style.

### Cards
Cards for "Destinations" should be image-heavy. The text overlay should use a Navy-to-transparent gradient at the bottom to ensure the All-Caps White headlines remain legible over the full-bleed imagery.

### Destination Lists
Lists of cities or routes should be styled with "bullet-less" clean columns, using `body-lg` text, often center-aligned to maintain the editorial balance.