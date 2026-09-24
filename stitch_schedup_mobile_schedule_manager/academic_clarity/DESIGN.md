---
name: Academic Clarity
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464554'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777586'
  outline-variant: '#c7c4d7'
  surface-tint: '#5148d7'
  primary: '#2a14b4'
  on-primary: '#ffffff'
  primary-container: '#4338ca'
  on-primary-container: '#c1beff'
  inverse-primary: '#c3c0ff'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#553300'
  on-tertiary: '#ffffff'
  tertiary-container: '#744800'
  on-tertiary-container: '#ffb759'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#100069'
  on-primary-fixed-variant: '#372abf'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system is engineered for academic rigor combined with everyday student ergonomics. It balances structural calm with decisive kinetic cues. The audience spans high-velocity university students, researchers, and self-directed learners navigating overlapping lectures, labs, and study groups.

The design movement merges Modern Corporate/SaaS precision with Tactile Functionalism:
- Clean, uncluttered canvas foundations ensure dense timetables remain digestible.
- Critical friction points—specifically scheduling collisions, hard deadlines, and transit warnings—are treated with high-urgency, unmissable chromatic punctuation.
- Calm, rational layouts de-stress chaotic academic semesters, while tactile, pill-accented interactions make rapid triage feel intuitive and rewarding.

## Colors

The palette establishes an authoritative, collegiate anchor through deep slate and indigo, elevated by high-signal functional alerts.

- **Primary (`#4338CA`) & Secondary (`#6366F1`)**: Indigo and energetic violet govern key actions, current time markers, navigation highlights, and AI scanning confirmations. They convey institutional precision without feeling dated.
- **Tertiary (`#F59E0B`)**: Amber represents tentative overlaps, pending syncs, and syllabus parsing warnings. It pairs with a dedicated Conflict Crimson (`#EF4444`) to make hard schedule collisions instantly distinct.
- **Neutral (`#0F172A`)**: A deep slate foundation. Surfaces leverage pure white (`#FFFFFF`) with cool slate-tinted canvas backdrops (`#F8FAFC`, `#F1F5F9`) rather than sterile grayscale, reducing eye strain across extended screen sessions.
- **Accessibility & Filters**: Filter chips for critical views (e.g., *Today*, *Conflicts*) must preserve a minimum 4.5:1 contrast ratio against backgrounds, shifting to solid slate or indigo fills when active.

## Typography

Typography prioritizes tabular legibility and rapid skimming under mobile viewing conditions.

- **Typeface**: `Inter` handles all structural, display, and quantitative roles. Feature settings should enable tabular figures (`tnum`) for time blocks, room numbers, and conflict counters.
- **Hierarchy & Proportions**:
  - `display-lg` and `headline-lg` are reserved for semester milestones, major schedule reviews, and camera scanning flows.
  - `headline-sm` anchors course titles and calendar entry headers.
  - `label-sm` operates in uppercase for badges, conflict indicators, and day abbreviations to maximize legibility at compact dimensions.

## Layout & Spacing

Layouts are anchored to an 8pt base grid with a 4pt sub-grid for dense timeline modules.

- **Mobile Viewport (< 640px)**: A 4-column fluid layout with `16px` outer margins (`margin`) and `12px` gutters (`gutter-sm`). Hour tracks follow strict row heights (64px base unit per hour) to allow precise vertical slot positioning.
- **Tablet & Desktop Viewports (640px - 1024px+)**: Expands to an 8-column or 12-column grid. Timetables transition from single-day vertical carousels to full 5-day or 7-day multi-column spreads with persistent contextual side drawers for course notes and AI conflict resolutions.
- **Rhythm Rules**: Keep internal card padding at `space-md` (12px) to maximize schedule density on phones, expanding to `space-lg` (16px) for elevated conflict dialogs and camera preview wrappers.

## Elevation & Depth

Visual hierarchy uses clean tonal surfaces combined with subtle tinted ambient shadows.

- **Base Canvas**: Neutral tint (`#F8FAFC`). Timetable grids are etched with 1px structural borders in slate (`#E2E8F0`).
- **Standard Cards**: Layered at Surface Tier 1 (`#FFFFFF`) with a delicate dual shadow: `0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)`.
- **Active / Drag State**: Timetable blocks being rescheduled elevate to Surface Tier 2 with an amplified violet-tinted shadow: `0 10px 15px -3px rgba(67, 56, 202, 0.12), 0 4px 6px -4px rgba(67, 56, 202, 0.08)` and scale up slightly.
- **Collision Overlays**: Conflicting classes produce hard-edge crimson warning strips with no blur, ensuring direct visibility over subtle surface colors.

## Shapes

The design uses balanced rounded geometry (`roundedness: 2` — base radius of 8px / 0.5rem).

- **Calendar Blocks & Containers**: Standard class slots, exam cards, and summary containers use an 8px radius (`0.5rem`), aligning with the structural grid.
- **Interactive Controls**: Buttons, camera capture buttons, search inputs, and day filter chips scale up to `rounded-lg` (16px) or full pill boundaries (`9999px`) to create an inviting, human-friendly feel.
- **Floating Overlays**: Bottom sheets, conflict resolution alerts, and AI syllabus review dialogs use `rounded-xl` (24px) on their top edge.

## Components

### Buttons
- **Primary**: Solid indigo fill (`#4338CA`), white label, pill or 8px rounded container. On press, shifts to `#3730A3`.
- **Secondary / Ghost**: Slate border (`#CBD5E1`) with transparent fill, slate-900 text.
- **Conflict Action**: Destructive resolutions use solid red fill (`#EF4444`) with white typography.

### Chips & Day Filters
- **Day Filter Group (*All, Today, Week, Conflicts*)**: Segmented track with high-contrast active states. Inactive chips use transparent backgrounds with muted slate text (`#64748B`). Active chips transition to solid slate (`#0F172A`) or deep indigo (`#4338CA`) with crisp white text.
- **Conflict Chip**: Pill-shaped badge featuring an amber (`#F59E0B`) or red (`#EF4444`) border, tinted 10% fill, and an alert icon paired with the conflict count.

### Timetable Cards
- **Normal Class Card**: White surface with a 4px left accent border color-coded by course. Contains course title (`headline-sm`), room/location icon + string (`body-sm`), and time interval (`label-md` with tabular figures).
- **Collision / Overlap Card**: Dual striped border or full red tinted fill (`#FEF2F2`) with an overlaid warning banner: *"Time conflict with CS 201"*. Actionable tap opens resolution options directly.

### AI Schedule Scanner
- **Camera Frame**: Fullscreen dark backdrop with a rounded scanning viewport and animated indigo corner brackets.
- **Review List**: Extracted events displayed in a staging card list with checkboxes, confidence scores, and conflict warning icons before adding to the timetable.

### Inputs & Checkboxes
- **Input Fields**: 8px corner radius, slate borders (`#E2E8F0`), focused with an indigo ring (`#6366F1`) at 2px offset.
- **Checkboxes**: Rounded 4px squares; checked state fills with `#4338CA` presenting a bold white checkmark.