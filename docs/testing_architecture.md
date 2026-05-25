# Tetasin Testing Architecture

This document outlines the testing architecture for the Tetasin modular monolith, covering the Web, Backend, and Mobile platforms.

## Overview

The testing strategy is broken into several layers:
1. **Unit Testing:** Isolated tests for components, services, and utilities.
2. **Integration Testing:** Tests bridging multiple units, database interactions, and API contracts.
3. **End-to-End (E2E) Testing:** Full workflow testing simulating real users in browsers and physical mobile devices.

## 1. Web Application (Next.js)

**Tools:** Vitest (primary), React Testing Library, Playwright, Mock Service Worker (MSW)

> **Note:** Vitest is the primary test runner used in CI. Jest config exists for legacy compatibility but new tests should use Vitest.

### Folder Structure
- `web/tests/unit/`: Component and hook unit tests (`.test.tsx`, `.test.ts`).
- `web/e2e/`: Playwright E2E tests (`.spec.ts`).
- `web/tests/mocks/`: MSW handlers for intercepting network requests.
- `web/tests/utils/`: Custom renderers and setup files (e.g., `setupTests.ts`).

### Commands
- **Run Unit Tests (Vitest):** `npx vitest run` (from `web` directory)
- **Run Unit Tests (Jest):** `npm run test`
- **Run E2E Tests:** `npm run test:e2e`
- **Run with Coverage:** `npx vitest run --coverage`

### Playwright E2E
Playwright is configured in `web/playwright.config.ts`:
- `testDir: './e2e'` — place all E2E specs in `web/e2e/`
- 3 browser projects: chromium, firefox, mobile-chrome (Pixel 5)
- Screenshots captured on failure, video retained on retry, trace on first retry
- Runs headlessly in CI with auto-starting dev server

## 2. Backend (NestJS)

**Tools:** Jest (in-module specs), ts-jest

### Folder Structure
- `backend/src/__tests__/unit/`: Pure-function unit tests (`.spec.ts`).
- `backend/src/__tests__/integration/`: Controller logic tests (`.spec.ts`).
- `backend/src/__tests__/mocks/`: Mock factory functions (`factories.ts`).
- `backend/src/modules/**/*.spec.ts`: NestJS `TestingModule` service tests (co-located).
- `backend/test/`: NestJS-generated e2e specs (separate Jest config).
- `backend/tests/seeds/`: Database seeding scripts using Faker.js.

> **Important:** The Jest config uses `rootDir: "src"`. All runnable spec files must reside within `backend/src/`. Tests in `backend/tests/` are invisible to `jest` unless referenced by a separate config.

### Seeding the Database
For local integration testing and staging, we use a seed script to generate a deterministic "Test Tenant".
- **Run Seeder:** `npm run seed` (from root directory, runs `backend/tests/seeds/seed-db.ts`)
- **Prerequisites:** Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables.

## 3. Mobile Application (Flutter)

**Tools:** `flutter_test`, `integration_test`

### Folder Structure
- `tetasin_flutter/test/unit/`: Business logic and widget unit tests.
- `tetasin_flutter/test/widget/`: Widget-specific UI tests.
- `tetasin_flutter/integration_test/`: Full device E2E tests (`app_test.dart`).

### Commands
- **Run Unit/Widget Tests:** `flutter test`
- **Run E2E on Physical Device:** `flutter test integration_test/app_test.dart`

## Continuous Integration (CI/CD)

The GitHub Actions pipeline (`.github/workflows/ci.yml`) runs on every PR and push to `main`/`staging`.
It automatically:
1. Lints and type-checks all codebases.
2. Runs unit tests for Web (Vitest), Backend (Jest), and Flutter (`flutter test`).
3. Runs headless Playwright E2E tests and uploads visual regression artifacts on failure.
4. Ensures coverage metrics are maintained.

> **Note on Database in CI:** CI runs rely heavily on MSW and Jest mocking to prevent mutating the cloud staging database. E2E tests in CI target the isolated Test Tenant (requires a pre-seeded deployment with `test@tetasin.com` user).
