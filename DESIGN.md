# Design System: The Move (AI Strategic Dynamics)

## 1. Visual Identity
**Mood:** Professional, Elite, Strategic, Masculine.
**Aesthetic:** Dark Luxury / Minimal SaaS.

## 2. Color Palette
| Role | Hex Code | Description |
|------|----------|-------------|
| **Background** | `#050505` | Deep matte black for premium feel. |
| **Surface** | `#0A0A0A` | Slightly lighter black for cards and inputs. |
| **Accent** | `#F27D26` | Warm, high-energy orange for CTAs and highlights. |
| **Ink (Primary)** | `#E4E3E0` | Off-white for high readability without harsh contrast. |
| **Ink (Muted)** | `#666666` | Mid-gray for secondary labels and metadata. |
| **Border** | `rgba(255, 255, 255, 0.1)` | Subtle lines to define structure. |

## 3. Typography
- **Display (Headings):** `Playfair Display` (Serif, Italic). Used for hero headlines to add a "human/editorial" touch.
- **Body / UI:** `Inter` (Sans-serif). Clean, modern, and highly legible for instructions and results.
- **Data / Strategic:** `JetBrains Mono` (Monospace). Used for the "The Text" and metadata to signal "raw data" and precision.

## 4. UI Components
### 4.1. Buttons
- **Primary:** Solid `#F27D26` background, black text, rounded-full (pill) or rounded-xl.
- **Secondary:** Border only (`1px solid border`), transparent background, white text.
- **Hover:** Subtle scale (1.05) and opacity shifts.

### 4.2. Input Area
- **Textarea:** `bg-white/5`, `border-white/10`, `rounded-2xl`.
- **Focus:** `border-[#F27D26]/50`.
- **Placeholder:** Low opacity (`opacity-20`) to keep the focus on user content.

### 4.3. Result Cards
- **Structure:** Vertical stack with clear semantic labels (e.g., "DIAGNOSIS").
- **Visuals:** Left-border accents in the accent color to guide the eye.
- **Typography:** Large font sizes for the "Move" and "Text" to emphasize importance.

## 5. Layout Strategy
### 5.1. Landing Page
- **Headline:** Massive (7xl+) serif text with negative letter-spacing.
- **CTA:** Centered, oversized pill button.
- **Pricing:** Split-pane layout comparing Free vs. Pro, with the Pro card featuring a prominent border and "Recommended" tag.

### 5.2. Dashboard
- **Split Screen (Desktop):** Input on the left (40%), Results on the right (60%).
- **Single Column (Mobile):** Stacked vertically with smooth scroll-to-result behavior.

## 6. Mobile Responsiveness
- **Touch Targets:** Minimum 44px for all buttons.
- **Padding:** Generous side padding (24px) to prevent content from feeling cramped.
- **Typography Scaling:** Headlines scale down to 4xl on mobile to maintain hierarchy without breaking layout.
