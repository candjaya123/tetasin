# Tumbuhin — Project Feature & UI Summary

**Tumbuhin** is a multi-tenant SaaS platform built for the Indonesian market, serving both SMEs (UMKM) and individual users through two strictly separated "modes": **Business** and **Personal**. The platform spans a **Next.js Web Dashboard** and a **Flutter Mobile App**.

This document summarizes the core features and UI/UX elements available to end-users, excluding backend logic or architectural details.

---

## 1. Shared UI/UX & Cross-Platform Features

Regardless of the account type, Tumbuhin offers a premium, consistent experience across web and mobile:

*   **Responsive Web Dashboard (Next.js):** Features a sleek side-navigation layout with dynamic states (expanded/collapsed) and quick-access top bar icons for alerts and profiles.
*   **Mobile First (Flutter App):** Native iOS and Android experience utilizing bottom navigation bars, swipe-to-refresh, and smooth hero transitions for transaction details.
*   **"Smart Alerts" System:** A floating notification feed that acts as the nerve center. It displays contextual alerts like "Bill Due in 3 days," "Stock running low," or "Goal achieved!" with one-tap deep links to resolve the alert.
*   **AI CFO Assistant (Gemini):** 
    *   *Web:* A floating chat widget available on all dashboard pages.
    *   *Mobile:* A prominent floating action button (FAB) for quick access. 
    *   Users can chat naturally to ask for financial insights (e.g., "Berapa pengeluaran saya minggu ini?").
*   **Shared Bill Tracker (Hutang/Piutang):** A unified interface to track payables (Hutang) and receivables (Piutang).
    *   **UI:** Tabbed views (`Hutang | Piutang | Semua`), overdue banners pinned to the top, and color-coded status badges (Pending = Blue, Partial = Yellow, Paid = Green, Overdue = Red).
    *   **Features:** Customizable reminder schedules (e.g., alert me 3 days before due), partial payment sliders, and a bottom-sheet payment recorder.

---

## 2. Business Mode Features

Designed for SME owners, cashiers, and stock managers to run daily operations smoothly.

### Key Features:
*   **Point of Sale (POS):** 
    *   **UI:** Tablet-optimized grid view of products, quick-add to cart, barcode scanner integration, and a streamlined checkout modal.
    *   **Features:** Real-time discount engine, custom pricing, split payments, and receipt generation (print or digital).
*   **Inventory & Multi-Warehouse Management:**
    *   **Features:** Stock opname, inter-warehouse transfers, and low-stock alerts.
    *   **Product Recipes (BOM):** Track raw materials. Selling a cup of coffee automatically deducts beans, milk, and cups from inventory.
*   **Procurement & OCR Receipts:**
    *   **UI:** Drag-and-drop receipt upload zone with a visual "Confidence Indicator" (Green/Yellow/Red) showing how well the AI read the receipt.
    *   **Features:** Upload a supplier invoice, and the AI extracts vendor names, line items, and totals to automatically draft a Purchase Order or Expense.
*   **Comprehensive Financial Reports:**
    *   **UI:** Interactive charts (bar, line, pie) for revenue trends.
    *   **Reports:** Standardized Income Statement (Laba/Rugi), Balance Sheet (Neraca), and Cash Flow statements exportable to PDF/CSV.
*   **Staff & RBAC:** Invite staff with specific roles (Manager, Kasir, Stok) to restrict UI access (e.g., Kasir cannot see the profit/loss dashboard).

### Business Subscription Tiers:
*   **Free:** Trial POS (100 tx/month).
*   **Pro:** Full ERP, AI Chat, unlimited transactions, multi-warehouse.
*   **Franchise:** Multi-branch consolidated reporting.

---

## 3. Personal Mode Features

Designed for individuals focusing on wealth building, budgeting, and financial hygiene.

### Key Features:
*   **Personal Finance Tracker:**
    *   **UI:** Clean, feed-style list of daily income and expenses. Quick-add FAB for manual entry.
    *   **Features:** Categorized spending replacing the complex POS system of the business mode.
*   **Budget Management:**
    *   **UI:** Visual "Progress Bars" (Green → Yellow → Red) indicating how close a user is to hitting their monthly limit for specific categories (e.g., Groceries, Entertainment).
*   **Financial Goals (Savings & Debt):**
    *   **UI:** Circular "Progress Rings" showing visually how close the user is to their goal (e.g., "Emergency Fund", "Pay off Car"). 
    *   **Features:** Gamified milestones and confetti animations upon goal completion.
*   **Net Worth Dashboard:**
    *   **UI:** A primary hero card at the top of the personal dashboard showing total Assets minus Liabilities with a sparkline trend chart.
*   **Recurring Transactions:** Set-and-forget scheduled entries (e.g., monthly Netflix subscription or rent). The system automatically drafts the transaction for one-tap approval.

### Personal Subscription Tiers:
*   **Free:** Basic tracking, limited goals (2), and strict budget categories (3).
*   **Premium:** Unlimited goals, unlimited budgets, recurring transactions, and custom bill reminders.
