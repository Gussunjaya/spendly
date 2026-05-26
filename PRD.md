# Product Requirements Document (PRD) – Spendly (Final)

**Version:** 1.4  
**Status:** Final  
**Tech Stack:** Vue 3 (Composition API, JavaScript), Vite, Tailwind CSS v4, Pinia, Firebase (Auth + Firestore + Functions), Google Gemini AI, PapaParse (CSV parsing)  
**Design Language:** Clean fintech UI – supports **Light mode** (white background, black buttons, blue accent) and **Dark mode** (slate-950 background, white text, blue accent).  
**Currency:** Indonesian Rupiah (Rp) – formatted with `Intl.NumberFormat('id-ID')` without decimals.  
**Data Input Methods:** Manual entry + CSV import (no live bank API integration).  
**Mobile Navigation:** Hamburger menu (drawer) – no bottom navigation bar.

---

## 1. Overview

Spendly is a web-based personal finance management SPA that allows individuals to track transactions, budgets, savings goals, and receive AI-powered financial insights.  
All financial data is entered **manually** or via **CSV import** from bank/e-wallet exports. There is **no automatic bank/API integration** – this keeps the app free, secure, and easy to develop.

### 1.1 Product Goals

- Provide full visibility of the user's financial status.
- Help users achieve financial goals with AI guidance.
- Simplify transaction entry via quick forms and CSV uploads.
- Offer personalized budget recommendations based on spending patterns.

### 1.2 Target Users

- Individuals who want to seriously manage personal finances.
- Users familiar with exporting CSV from their bank/e-wallet (BCA, Mandiri, GoPay, OVO, etc.).

---

## 2. Architecture & Tech Stack

| Layer              | Technology                                              |
| ------------------ | ------------------------------------------------------- |
| Frontend Framework | Vue 3 (Composition API, JavaScript)                     |
| Build Tool         | Vite                                                    |
| Styling            | Tailwind CSS v4                                         |
| State Management   | Pinia                                                   |
| Routing            | Vue Router 4                                            |
| Icons              | `lucide-vue-next`                                       |
| CSV Parsing        | PapaParse (client-side)                                 |
| Animations         | CSS transitions + `@vueuse/motion` (optional)           |
| BaaS / Auth        | Firebase Authentication (Email/Password + Google OAuth) |
| Database           | Firebase Firestore (NoSQL, real-time)                   |
| Backend Logic      | Firebase Cloud Functions (Node.js) for Gemini AI        |
| Hosting            | Firebase Hosting                                        |

### 2.1 Firebase Services Used

| Service              | Purpose                                                                      |
| -------------------- | ---------------------------------------------------------------------------- |
| **Firebase Auth**    | Email/Password login, Google OAuth, session management                       |
| **Firestore**        | Stores all user data (transactions, budgets, goals, accounts, notifications) |
| **Cloud Functions**  | Endpoint `/aiInsights` – calls Gemini API safely (API key as secret)         |
| **Firebase Hosting** | Deploys the Vite-built SPA                                                   |
| **Security Rules**   | Users can only read/write their own data (`request.auth.uid == userId`)      |

### 2.2 Firestore Collections Structure

/users/{userId}/
├── profile (document) -> { name, email, phone, bio, avatarUrl }
├── accounts/ (collection) -> { name, type, maskNumber, balance, connectionNotes }
├── transactions/ (collection) -> { name, amount, date, time, category, paymentMethod, notes, source } // source: 'manual' or 'csv'
├── budgets/ (collection) -> { category, spent, limit }
├── goals/ (collection) -> { name, description, currentAmount, targetAmount, category }
├── notifications/ (collection) -> { title, message, type, time, read }
└── securityLogs/ (collection) -> { event, time }

### 2.3 Main File Structure (JavaScript)

spendly-vue/
├── index.html
├── firebase.json
├── .firebaserc
├── functions/
│ ├── index.js # Cloud Function: aiInsights
│ └── package.json
└── src/
├── main.js
├── App.vue
├── firebase.js
├── router/index.js
├── stores/
│ ├── auth.js
│ ├── transaction.js
│ ├── budget.js
│ ├── goal.js
│ ├── account.js
│ ├── notification.js
│ ├── profile.js
│ └── ai.js
├── composables/
│ ├── useFormatCurrency.js
│ ├── useChartHelper.js
│ └── useCSVImport.js
├── components/
│ ├── layout/
│ │ ├── Navbar.vue
│ │ ├── Footer.vue
│ │ └── HamburgerMenu.vue # mobile drawer
│ ├── common/
│ │ ├── BaseModal.vue
│ │ ├── BaseButton.vue
│ │ └── NotificationsPanel.vue
│ ├── transactions/
│ │ ├── QuickTransactionCard.vue
│ │ └── CSVImportModal.vue
│ └── charts/
│ ├── SpendingTrend.vue
│ └── CategoryDonut.vue
└── views/
├── AuthView.vue
├── DashboardView.vue
├── TransactionsView.vue
├── AnalyticsView.vue
├── BudgetView.vue
├── GoalsView.vue
└── SettingsView.vue

---

## 3. Authentication

**Auth Provider:** Firebase Authentication  
**Store:** `useAuthStore`  
**Route Guard:** Redirect to `/login` if not authenticated; redirect to `/dashboard` if already logged in.

### 3.1 Auth Page (`AuthView.vue`, routes `/login` and `/register`)

- Single component with Login/Register toggle.
- Card layout (`max-w-md`, `rounded-2xl`).
- Fields for Login: Email, Password, "Remember me", "Forgot password?".
- Fields for Register: Full Name, Email, Password, Confirm Password, Terms agreement.
- Buttons: "Sign In" / "Sign Up" (black background), "Continue with Google".
- Footer: Terms of Service · Privacy Policy.

---

## 4. Global Navigation (`Navbar.vue`)

- Sticky top, responsive, white/dark background.
- **Desktop (>768px):**
  - Left: Spendly logo.
  - Center: router-links to Dashboard, Transactions, Analytics, Budget, Goals.
  - Right: Bell icon (notifications), Dark mode toggle, User avatar (links to Settings), Logout.
- **Mobile (≤768px):**
  - Left: Spendly logo.
  - Right: Bell icon, Dark mode toggle, **Hamburger icon** (Menu).
  - Clicking hamburger opens `HamburgerMenu.vue` drawer (slide from left) containing navigation links and logout.

### 4.1 Hamburger Menu (`HamburgerMenu.vue`)

- Slides from left edge, overlay backdrop.
- Contains vertical list of links: Dashboard, Transactions, Analytics, Budget, Goals, Settings.
- User avatar and name at top.
- Logout button at bottom.
- Closes when link is clicked or backdrop tapped.

---

## 5. Footer (`Footer.vue`)

- Shown on all authenticated pages (desktop and mobile – below content).
- Light gray (light mode) or slate-900 (dark mode).
- Contains copyright, links to Privacy Policy, Terms, Support.

---

## 6. Dashboard (`DashboardView.vue`, route `/dashboard`)

### 6.1 Header

- Welcome message with user’s name.
- Subtext: "Here's your financial overview for this week."

### 6.2 AI Insight Banner

- Shows dynamic insight from `useAiStore().bannerInsight`.
- Refresh button to call `fetchInsights()`.

### 6.3 Stats Cards (4‑col grid, responsive: 2x2 on mobile)

- **Total Balance** – sum of all connected account balances.
- **Income** – total income this month + progress bar.
- **Expenses** – total expenses + mini progress bars.
- **Financial Health** – score 88/100, donut gauge.

### 6.4 Financial Goals (3‑col grid, responsive: 1 col on mobile)

- Top 3 goals by progress.
- Each card: name, description, progress bar, saved/target.

### 6.5 Spending Trend Chart

- Line chart for last 7 days (SVG).

### 6.6 Quick Transaction Card (right sidebar)

- Embedded `QuickTransactionCard.vue` component.

### 6.7 Recent Transactions (right sidebar below quick card)

- List of 4 most recent transactions, "View All" link.

---

## 7. Transactions (`TransactionsView.vue`, route `/transactions`)

### 7.1 Header

- Heading "Transactions".
- Two action buttons: **"+ Add Transaction"** (manual) and **"Import CSV"**.

### 7.2 Filter Bar

- Search, filters (category, method, date range, amount range), export CSV.

### 7.3 Transactions Table

- Responsive: on mobile, table becomes stacked cards or horizontal scroll.
- Columns: Transaction, Date, Method, Amount.
- Click row → detail modal.
- Delete button on hover.

### 7.4 Pagination

- 6 items per page.

### 7.5 Quick Transaction Card (`QuickTransactionCard.vue`)

- Toggle Expense/Income (red/green).
- Transaction name input.
- Amount slider + number input (range 0–10M).
- Category dropdown.
- Payment method dropdown (from accounts).
- Save button → calls `useTransactionStore.addTransaction()`.

### 7.6 CSV Import Modal (`CSVImportModal.vue`)

- File picker (.csv).
- PapaParse preview (first 5 rows).
- Column mapping (Date, Description, Amount, Category).
- Skip header option.
- Confirm import → batch add transactions.

### 7.7 Transaction Detail Modal

- Shows all fields + ID.
- Download receipt (simulated).

### 7.8 Delete Transaction

- Confirmation modal with cascade effect (reverse budget & account balance).

---

## 8. Analytics (`AnalyticsView.vue`, route `/analytics`)

### 8.1 Header

- "Visual Analytics" + date toggle.

### 8.2 Spending Trends (left card)

- Line chart 12 months.

### 8.3 Categories Donut (right card)

- Donut chart + legend.

### 8.4 Monthly Comparison

- Bar chart June vs July.

### 8.5 Subscriptions

- List of recurring subscriptions (example data).

### 8.6 Daily Average & Budget Performance

- Daily average spending, progress bars for categories.

---

## 9. Budget (`BudgetView.vue`, route `/budget`)

### 9.1 Header

- "Budget Management" – subheading explains CSV import & manual tracking.

### 9.2 Monthly Overview Card

- Total budget, total spent, remaining, main progress bar.

### 9.3 Virtual Wallet Balance Card

- Manual balance entry (from `useAccountStore`), adjustable via modal.

### 9.4 AI Insights Card

- Shows `budgetAdvisor` from AI, "Apply Suggestion" button.

### 9.5 Category Budgets List

Each row/card shows:

- Category name.
- Spent (auto‑incremented via Firestore `increment()` when expense added).
- Limit (editable inline).
- Progress bar (color based on percentage).
- Status badge.
- "Edit Limit" button.

### 9.6 CSV Import Section (Card)

- Same as in Transactions – import CSV to update budgets.

### 9.7 Recent Transactions (sidebar)

- Last 5 transactions.

---

## 10. Goals (`GoalsView.vue`, route `/goals`)

### 10.1 Header

- "Financial Goals" + "+ Add New Goal" button.

### 10.2 AI Advisory Banner

- Shows `goalsAdvisor` from AI.

### 10.3 Goal Cards (3‑col grid, responsive)

- Progress bar, saved/target, "Allocate Funds" button.

### 10.4 Add New Goal Modal

- Fields: Name, Description, Target Amount, Category.

### 10.5 Contribute Modal

- Select source account, enter amount → updates goal and account.

### 10.6 Milestone History Table

- Contributions log.

---

## 11. Settings (`SettingsView.vue`, route `/settings`)

### 11.1 Profile Section

- Avatar, name, bio, email, phone.
- "Edit Profile" modal.

### 11.2 Security & Privacy

- Account status, password last changed, 2FA toggle (simulated).
- "Manage Security" modal (change password + security logs).

### 11.3 Notifications Preferences

- Toggles for AI Insights, Budget Alerts, Monthly Reports, Security Alerts (stored locally).

### 11.4 Connected Devices

- Simulated list of active devices, "Sign out from all devices" button.

---

## 12. Notifications Panel (`NotificationsPanel.vue`)

- Slides from right.
- Lists notifications from Firestore.
- Mark as read, mark all read, clear all.

---

## 13. AI Integration – Gemini via Firebase Cloud Functions

### 13.1 Cloud Function Endpoint

POST /aiInsights
Headers: Authorization: Bearer <Firebase ID Token>
Body: { transactions, budgets, goals }
Response: { bannerInsight, budgetAdvisor, goalsAdvisor }

### 13.2 Pinia Store (`useAiStore`)

- Stores insights, loading state.
- `fetchInsights()` calls Cloud Function with auth token.

### 13.3 Fallback

- Hardcoded Indonesian responses if Gemini fails.

---

## 14. State Management – Pinia with Firestore

All stores use `onSnapshot()` for real-time sync.  
`useTransactionStore.addTransaction()` increments budget spent using Firestore `increment()`.

---

## 15. Initial Data Seeding (Development)

`seed.js` script populates Firestore with example user data (Alex Sterling, accounts, budgets, goals, transactions, notifications, security logs).

---

## 16. Responsiveness & Mobile Navigation (No Bottom Bar)

- **Desktop (>768px):** Standard navbar with visible links.
- **Mobile (≤768px):** Navbar collapses – shows logo, bell, dark mode toggle, and **hamburger icon**.
- **Hamburger Menu:** Drawer from left with all navigation links, user info, logout.
- **Footer** remains visible on all screen sizes (scroll to bottom).
- No fixed bottom navigation bar.

---

## 17. Non-Functional Requirements

| Aspect          | Requirement                                                                      |
| --------------- | -------------------------------------------------------------------------------- |
| Performance     | First paint < 1.5s, Firestore real-time sync                                     |
| Responsiveness  | Desktop-first, mobile ≥ 375px support, hamburger menu on mobile                  |
| Accessibility   | ARIA labels on forms and buttons, keyboard navigable menu                        |
| Security        | API key in Cloud Functions secret, strict Firestore rules, ID token verification |
| Firestore Rules | `allow read, write: if request.auth.uid == userId`                               |
| Localization    | Mixed Indonesian/English UI, Rupiah currency, Indonesian date format             |
| Dark Mode       | Toggle with local storage persistence                                            |

---

## 18. Out of Scope (v1.0)

- Real open banking API
- Multi-currency
- Team / multi-user collaboration
- Native mobile app
- Offline mode (PWA)
- PDF export
- Recurring transaction automation
- Automatic SMS/push notification reading from banks/e-wallets
- Bottom navigation bar (replaced by hamburger menu)

---

## 19. Summary of Key Features

| Feature           | Implementation                         |
| ----------------- | -------------------------------------- |
| Transaction entry | Manual + CSV import (PapaParse)        |
| Budget update     | Automatic increment when expense added |
| AI Insights       | Cloud Function + Gemini API            |
| No live bank API  | By design – free and secure            |
| Real‑time sync    | Firestore `onSnapshot` + Pinia         |
| Dark mode         | Toggle + local storage                 |
| Mobile navigation | Hamburger drawer (no bottom bar)       |
| Footer            | Always visible                         |

---

**This PRD is the complete specification for Spendly using Vue 3 + JavaScript + Pinia + Firebase with CSV import only and hamburger menu for mobile.**
