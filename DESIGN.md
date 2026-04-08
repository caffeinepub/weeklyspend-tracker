# Design Brief

## Summary
Minimal, mobile-first budgeting app emphasizing speed of entry and clarity of weekly data. Brutally utilitarian design with restrained hierarchy, clean surfaces, and functional directness. Chart-centric weekly view with three vertical bars (not pie/donut) for category comparison. Floating action button for rapid transaction capture. System preference dark mode support.

## Tone & Aesthetic
Minimalist utility design inspired by iOS system apps. Neutral-warm palette with sparingly-used mint green accent for primary actions (add, active states). Large touch targets, generous white space, fast-scanning typography. No decoration, no gradients.

## Color Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| Primary | 68/0.15/142 | 72/0.15/142 | Accent, primary actions, focus states |
| Chart 1 | 65/0.22/40 | 68/0.22/40 | Food category (warm orange) |
| Chart 2 | 58/0.15/220 | 62/0.16/220 | Recreational category (teal) |
| Chart 3 | 42/0.12/264 | 55/0.14/264 | Utility category (cool navy) |
| Foreground | 12/0/0 | 93/0/0 | Body text, labels |
| Border | 92/0/0 | 28/0/0 | Subtle dividers, card edges |

## Typography
- **Family**: DM Sans (body + display)
- **Scale**: 32px (heading), 18px (subhead), 16px (body), 14px (label), 12px (caption)
- **Weight**: Regular (400) for body, Medium (500) for labels, Semibold (600) for headings
- **Line height**: 1.4 (compact, scanning-friendly)

## Elevation & Depth
- **Flat background**: Main content area on `background` (off-white light / charcoal dark)
- **Card surface**: Header, chart, navigation bar on `card` with 1px `border-border` and subtle shadow
- **Interactive**: Buttons and FAB use `primary` with rounded corners (8px on FAB, 4-6px on buttons)

## Structural Zones

| Zone | Surface | Treatment |
|------|---------|-----------|
| Header | Elevated card | 1px border-bottom, date range display, week summary |
| Main content | Background | Transaction totals, category breakdown labels |
| Chart | Elevated card | Three vertical bars (wide aspect), ample padding |
| Navigation | Elevated card | Bottom tab bar, two tabs (Home / History) |
| FAB | Primary color | Fixed bottom-right, 64px diameter, mint green, white icon |

## Component Patterns
- **Large buttons**: 56px height, full-width or 1:1 square, primary color on light/dark backgrounds
- **Card**: Rounded corners (8px), 1px border, minimal shadow
- **Input**: Light fill on light mode, dark fill on dark mode, 8px radius, 12px padding
- **Tabs**: Underline active, no background, semantic text color
- **Typography labels**: Uppercase, small caps, 12px, muted foreground

## Motion
Single transition: `transition-smooth` (0.3s cubic-bezier) for state changes (tap, hover, tab switch). No entrance animations. Instant visual feedback on interactions.

## Constraints
- Mobile-first breakpoints only (`sm`, `md` for larger screens)
- No hover effects on touch devices (use active states instead)
- Maximum 3 colors in any chart or visual group
- Minimum 48px touch target on all interactive elements
- No custom cursors or decorative pseudo-elements

## Signature Detail
Vertical bar chart (three separate bars) vs. donut/pie emphasizes category comparison and week-at-a-glance spending clarity. Simplicity of form drives speed of comprehension.
