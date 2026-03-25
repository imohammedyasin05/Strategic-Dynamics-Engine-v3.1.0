# Product Requirement Document: The Move (AI Dating Strategist)

## 1. Project Overview & Goals
**The Move** is an AI-powered strategic dating assistant designed to help men navigate the complexities of modern texting and attraction dynamics. Unlike traditional dating advice that focuses on "feelings," The Move provides blunt, psychologically-grounded analysis and tactical messaging options.

**Goals:**
- Provide immediate, actionable advice for specific dating scenarios.
- Increase user confidence through high-value communication patterns.
- Monetize through a "Pro" model offering unlimited deep-dives and advanced reply generation.

## 2. Target Audience
- **Primary:** Young men (18-35) who struggle with "ghosting," "friend-zoning," or losing attraction during the texting phase.
- **Psychographics:** Value efficiency, logic-driven advice, and "high-value" social calibration.

## 3. Core Features
### 3.1. Strategic Analysis (The "Situation" Mode)
- **Input:** Text area for describing a situation.
- **AI Output:** 
    - **Diagnosis:** Blunt read on the dynamic.
    - **The Move:** Strategic action plan.
    - **The Text:** A specific, non-needy message to send.

### 3.2. Reply Generator (The "Replies" Mode)
- **Input:** Paste a received message.
- **AI Output:** 5 tone-based options (Playful, Confident, Teasing, Calm Masculine, Slightly Flirty).
- **Functionality:** One-tap copy to clipboard.

### 3.3. Monetization Model (Freemium)
- **Free Tier:** 3 analyses per day, basic reply generation.
- **Pro Tier ($19/mo):** Unlimited analyses, "Elite Strategist" mode (deeper psychological breakdown), and priority server access.

## 4. Page Structure
### 4.1. Landing Page
- Hero section with "The Move" branding.
- Value proposition: "Stop guessing. Start winning."
- "Get Started" CTA leading to the Dashboard.

### 4.2. Dashboard (Main App)
- Mode toggle (Situation vs. Replies).
- Input area (Textarea + Submit).
- Results display (AnimatePresence for smooth transitions).
- Usage counter (Free tier limit).

### 4.3. Pricing / Upgrade Page
- Tier comparison (Free vs. Pro).
- "Upgrade Now" button.

## 5. User Journey
1. **First Visit:** User lands on the homepage, sees the value prop, and clicks "Analyze My Situation."
2. **Input:** User describes their latest text exchange.
3. **Result:** User receives a blunt diagnosis and a copy-pasteable text.
4. **Friction:** After 3 uses, the user is prompted with a "Limit Reached" modal.
5. **Upgrade:** User views the pricing page and upgrades to Pro for unlimited access.

## 6. Success Metrics
- **Conversion Rate:** % of free users who click "Upgrade."
- **Retention:** % of users returning within 7 days of their first analysis.
- **Virality:** % of users who use the "Share App" feature (if implemented).
- **NPS:** User satisfaction with the effectiveness of the "Moves."

## 7. Technical Stack
- **Frontend:** React + Vite + Tailwind CSS.
- **Animations:** Motion (motion/react).
- **AI Engine:** Google Gemini 3 Flash.
- **Icons:** Lucide React.
