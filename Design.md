# Design System Tokens

```yaml
name: Botanical Rescue & Nourishment
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
  on-surface-variant: '#434844'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0ef'
  outline: '#737874'
  outline-variant: '#c3c8c3'
  surface-tint: '#56615a'
  primary: '#0b1510'
  on-primary: '#ffffff'
  primary-container: '#202a24'
  on-primary-container: '#86918a'
  inverse-primary: '#bec9c1'
  secondary: '#3c6a00'
  on-secondary: '#ffffff'
  secondary-container: '#b8f07e'
  on-secondary-container: '#406e05'
  tertiary: '#1c1100'
  on-tertiary: '#ffffff'
  tertiary-container: '#32250c'
  on-tertiary-container: '#a08c6a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae5dd'
  primary-fixed-dim: '#bec9c1'
  on-primary-fixed: '#141e18'
  on-primary-fixed-variant: '#3e4943'
  secondary-fixed: '#bbf381'
  secondary-fixed-dim: '#a0d668'
  on-secondary-fixed: '#0e2000'
  on-secondary-fixed-variant: '#2c5000'
  tertiary-fixed: '#f8dfb9'
  tertiary-fixed-dim: '#dbc39f'
  on-tertiary-fixed: '#261a03'
  on-tertiary-fixed-variant: '#544429'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  display-hero:
    font-family: Sora
    font-size: 48px
    font-weight: '800'
    line-height: 56px
    letter-spacing: -0.02em
  display-hero-mobile:
    font-family: Sora
    font-size: 32px
    font-weight: '800'
    line-height: 40px
    letter-spacing: -0.02em
  headline-xl:
    font-family: Sora
    font-size: 36px
    font-weight: '700'
    line-height: 44px
    letter-spacing: -0.02em
  headline-xl-mobile:
    font-family: Plus Jakarta Sans
    font-size: 26px
    font-weight: '700'
    line-height: 34px
    letter-spacing: -0.015em
  headline-lg:
    font-family: Plus Jakarta Sans
    font-size: 28px
    font-weight: '700'
    line-height: 36px
    letter-spacing: -0.01em
  headline-lg-mobile:
    font-family: Plus Jakarta Sans
    font-size: 22px
    font-weight: '700'
    line-height: 28px
    letter-spacing: -0.01em
  headline-md:
    font-family: Plus Jakarta Sans
    font-size: 20px
    font-weight: '600'
    line-height: 28px
  headline-sm:
    font-family: Plus Jakarta Sans
    font-size: 18px
    font-weight: '600'
    line-height: 24px
  body-lg:
    font-family: Plus Jakarta Sans
    font-size: 16px
    font-weight: '400'
    line-height: 24px
  body-md:
    font-family: Plus Jakarta Sans
    font-size: 14px
    font-weight: '400'
    line-height: 20px
  body-sm:
    font-family: Plus Jakarta Sans
    font-size: 12px
    font-weight: '400'
    line-height: 18px
  label-lg:
    font-family: Plus Jakarta Sans
    font-size: 15px
    font-weight: '600'
    line-height: 20px
    letter-spacing: 0.01em
  label-md:
    font-family: Plus Jakarta Sans
    font-size: 13px
    font-weight: '500'
    line-height: 18px
  label-sm:
    font-family: Plus Jakarta Sans
    font-size: 11px
    font-weight: '600'
    line-height: 14px
    letter-spacing: 0.02em
  price-display:
    font-family: Plus Jakarta Sans
    font-size: 20px
    font-weight: '800'
    line-height: 26px
    letter-spacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
```

## Brand & Style
The design system embodies botanical vitality, ethical stewardship, and community trust tailored specifically for the Indonesian urban food landscape. It balances ecological urgency with the warmth of local culinary culture, removing the stigma of "leftover food" by reframing rescued surplus into high-value mystery packages and verified redistribution opportunities.

The aesthetic fuses modern editorial warmth with tactile clarity. Interfaces reject sterile tech minimalism in favor of an organic palette reminiscent of lush foliage, natural paper, and sun-ripened produce. The tone evokes relief, abundance, and transparency—reassuring users regarding freshness, hygiene, and Halal integrity while conveying the real-time thrill of rescuing meals before store closing hours.

## Colors
The color architecture relies on high-contrast grounding punctuated by lively, nature-inspired signals:

- **Primary Canvas & Surfaces**: The background layer is anchored by `#F8F7F2` (Warm Linen/Cream), maintaining an organic, tactile paper quality that minimizes eye strain compared to harsh blue-white. Foreground content rests on pure `#FFFFFF` cards, framed with soft earthen strokes `#E2E6DF`.
- **Primary Evergreen (`#1F2A24`)**: Deep Indonesian forest green used for high-intent action items, primary buttons, headers, and active navigation states. It grounds the platform in quiet authority.
- **Fresh Leaf Green (`#7BAE45`)**: Signals ecological restoration, positive impact metrics (kg CO2 avoided, portions rescued), and value-saving counters.
- **Warm Marigold (`#F2B84B`)**: Captures delight, curiosity, and surprise for mystery box accents, rating stars, and merchant spotlight ribbons.
- **Soft Sage (`#E8F1DE`)**: Serves as a soothing secondary tint for badges, subtle card fills, voucher chips, and secondary button backgrounds.
- **Urgent Vermilion (`#D94A38`)**: Communicates authentic scarcity and temporal limits (e.g., *Hanya 2 tersisa*, 15-minute pickup countdowns) without inducing clinical alarm.
- **Typography Neutrals**: Main body reads in `#252525` (Deep Charcoal) for optimal legibility, while metadata, pickup schedules, and tertiary attributes rest in `#737873` (Slate Sage).

## Typography
Plus Jakarta Sans is utilized holistically to offer a contemporary, welcoming geometric touch with high legibility across Southeast Asian digital devices.

- **Weight Intent**: Headings apply weights 700 and 800 to create decisive impact when promoting discount percentages and culinary category banners. Card titles, price amounts, and active interactive controls utilize weight 600 for structured visual clarity. Metadata tags, badges, and operational logistics (e.g., *Ambil: 20:30 - 21:30 WIB*) use weight 500. Extended narrative descriptions and vendor bios rely on weight 400.
- **Numbers & Currency**: Price tags must strictly render Rupiah values (`Rp`) in cohesive weights without superscripts, formatting with standard Indonesian grouping (e.g., `Rp25.000` rather than `Rp 25,000`).

## Layout & Spacing
The layout model employs an adaptable fluid grid configured for high-density mobile utilization while gracefully expanding across wide tablets and desktop viewports.

- **Grid Architecture**: 4 columns on mobile (360px–599px), 8 columns on tablet (600px–1023px), and 12 columns across desktop (1024px+). The maximum layout wrapper is pegged at 1280px to preserve comfortable scan paths.
- **Rhythm Rules**: Standard vertical spacing follows a baseline 4px/8px incremental cadence. Dense card contents utilize `space-sm` (8px) between title and tags, while major layout blocks leverage `space-lg` (24px) to `space-xl` (36px).
- **Sticky Viewports**: On mobile screens, critical conversion items (checkout bar, reserve button, active pickup countdown timer) lock cleanly to the bottom viewport with an 80px clearance allowance over the system safe area.

## Elevation & Depth
Depth is created through low-contrast physical outlines paired with soft, organic shadow casts rather than heavy synthetic blurs.

- **Level 0 (Flat Canvas)**: Resting surfaces (`#F8F7F2`) with zero elevation.
- **Level 1 (Cards & List Items)**: `#FFFFFF` surfaces with a 1px solid `#E2E6DF` border, layered with an ambient drop-shadow: `0 4px 16px -2px rgba(31, 42, 36, 0.05)`. The green-tinted charcoal shadow ensures a clean, grounded warmth.
- **Level 2 (Hover States & Dropdowns)**: Interactive elements lift slightly via `0 8px 24px -4px rgba(31, 42, 36, 0.08)` while retaining the 1px stroke.
- **Level 3 (Sticky Bars & Bottom Sheets)**: Overlays and persistent purchase action bars use `0 -4px 20px 0 rgba(31, 42, 36, 0.07)` to indicate elevation above active browse feeds.

## Shapes
A roundedness level of 2 balances approachability and structure. Primary cards, mystery package tiles, and bottom sheets adopt a 16px to 20px radius (`rounded-lg` to `rounded-xl`). Buttons, form fields, and status indicators implement balanced 8px to 12px radii. Micro-pills and status tags (such as *Halal Terverifikasi*) leverage fully rounded pill boundaries (`9999px`) to maintain separation from structured card borders.

## Components

### Buttons
- **Primary Action**: Solid `#1F2A24` container, white text, 12px border radius, 48px standard touch height on mobile. On hover/active, transitions smoothly to `#2C3B33` with a -1px vertical transform.
- **Secondary Action**: `#E8F1DE` container with `#1F2A24` text. Used for secondary paths (e.g., *Lihat Detail Merchant*, *Bantu Donasi*).
- **Outline Action**: Transparent background with a 1.5px `#E2E6DF` border and `#1F2A24` text.
- **Urgent Action**: `#D94A38` background with pure white text, strictly reserved for immediate checkout actions or expiring checkout windows.

### Badges & Status Tags
All badges utilize 9999px pill geometry, font weight 600, and standard 4px vertical / 10px horizontal padding:
- **Halal Verified**: `#E8F1DE` background with `#2D5922` text and emerald checkmark icon.
- **Mystery Box / Kejutan**: `#FFF6E5` background with `#A36605` text and amber sparkle accent.
- **Urgent Stock**: `#FDECEB` background with `#D94A38` text and flame/clock indicator (e.g., *Sisa 2 Porsi*).
- **Discount Ratio**: `#7BAE45` background with pure white text (e.g., *-65%*).
- **Donation Ready**: `#EAF4F4` background with `#24585B` text (e.g., *Auto-Donasi Aktif*).

### Cards (Surplus Food & Mystery Box)
Structured on `#FFFFFF` with 16px corner radii and a 1px border (`#E2E6DF`).
- Top quadrant: Aspect-ratio 16:9 imagery overlaid with vendor badge (e.g., *Bakery & Pastry*), localized distance (*1.2 km*), and urgent stock pill.
- Middle quadrant: Merchant name in weight 600 (`#252525`), followed by meal descriptor and pickup schedule window in `#737873` (e.g., *Ambil: 20:00 - 21:00 WIB*).
- Bottom quadrant: Striated price display. Strikethrough original price in `#737873` (e.g., *Rp60.000*) paired with rescued sale price in bold 20px `#1F2A24` (e.g., *Rp20.000*).

### Input Fields & Search
Fields use `#FFFFFF` background, 1px `#E2E6DF` perimeter, and 12px corner rounding. Placeholders sit in `#737873`. Upon focus, the border transitions to 1.5px `#1F2A24` without harsh blue rings. Search inputs integrate a quick location-selector affordance (*Jakarta Selatan*, *Bandung Kota*, *Surabaya Barat*).

### Interactive Impact Ticker
A specialized component displaying collective community metrics:
- Dual-toned pill card featuring `#E8F1DE` base, showcasing total kilograms of food diverted and rupiah saved by users, paired with vibrant `#7BAE45` metric highlights.