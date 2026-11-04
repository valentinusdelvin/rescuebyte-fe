# Project: RescueByte Frontend Competition Showcase Blueprint

## 1. Architecture

### 1.1 High-Level Architecture & Layered Boundaries
```
┌────────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                              │
│  - App.tsx (Modular Hash Router with Deep-linking & React.lazy)        │
│  - Pages (CustomerMarketplace, CustomerStoreDetail, CustomerCheckout) │
│  - Features/Slices (Customer, Seller, Dashboard, Auth)                 │
│  - Atomic UI Primitives (src/components/ui: Button, Input, Modal, etc) │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ consume hooks & context
┌──────────────────────────────────▼─────────────────────────────────────┐
│                   State & Business Logic Layer                         │
│  - Global React Contexts (src/context: AuthContext, CartContext, etc.) │
│  - Custom React Hooks (src/hooks: useProducts, useOrders, useCheckout) │
│  - Mappers & Formatters (src/utils/currency, src/utils/markdown)       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ consume typed services
┌──────────────────────────────────▼─────────────────────────────────────┐
│                    API Transport & Data Layer                          │
│  - Domain API Modules (src/api/services: authApi, productApi, etc.)   │
│  - Centralized Axios Client (src/api/client.ts with VITE_API_BASE_URL) │
│  - Auth Interceptor & Transparent 401 Token Refresh Queue              │
│  - Authoritative Swagger Types (src/api/types.ts: 49 DTOs & Enums)     │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Module / Package Boundaries
- `src/components/ui/`: Pure presentational atomic primitives with zero domain knowledge and zero API dependencies. Must provide explicit loading, error, empty, disabled, and focus states.
- `src/context/`: Application-level state management (Authentication session, Active cart, Toast notifications) replacing fragmented `localStorage` and `window.dispatchEvent` CustomEvent buses.
- `src/hooks/`: Headless business logic, data fetching, mutations, and query state hooks. Presentational components consume hooks instead of directly calling services.
- `src/api/`: Centralized API client utilizing `VITE_API_BASE_URL` (`https://dolpin-fourthree.bccdev.id/`). Contains typed request/response methods mapped 1:1 with backend Swagger tags.
- `src/utils/`: Pure deterministic utility functions (currency formatting, date/time calculation, markdown parsing).

---

## 2. Feature Inventory

Every feature discovered in Phase 1 Survey is inventoried and assigned to an autonomous milestone:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Architecture Blueprint & Folder Setup | Document complete system blueprint and file ownership rules | M1 | R1 Survey |
| 2 | Tailwind v4 Design System Tokens | Configure `@theme` in `src/index.css` with Botanical Rescue palette, typography, shadows, radii | M1 | R3, Design.md |
| 3 | Core UI Primitives (`Button`, `Input`, `Badge`) | Build reusable components with loading, disabled, focus-visible states | M1 | R3, Survey 2 |
| 4 | Core UI Primitives (`Card`, `Modal`, `EmptyState`, `Skeleton`) | Build standardized card, accessible modal dialog, empty state, and pulsing skeletons | M1 | R3, Survey 2 |
| 5 | Centralized Utility Consolidation | Consolidate `formatRupiah` from 15 files to `src/utils/currency.ts`; consolidate markdown utils | M1 | R2, Survey 1 |
| 6 | Dead Starter Code Removal | Remove boilerplate starter files (`Home.tsx`, `FolderCard.tsx`, `Header.tsx`, `useCounter.ts`, `MysteryBoxThumb.tsx`) | M1 | R2, Survey 1 |
| 7 | Authoritative Swagger TypeScript Schemas | Create `src/api/types.ts` containing all 49 backend DTOs and system enums matching Swagger 2.0 | M2 | R4, Survey 3 |
| 8 | Centralized Axios API Client | Build `src/api/client.ts` using `VITE_API_BASE_URL`, auth interceptor, transparent 401 refresh queue, and error unwrap | M2 | R4, Survey 3 |
| 9 | Domain API Modules | Implement pure service callers strictly mapped to Swagger tags (auth, cart, order, product, store, user, storage, enum) | M2 | R4, Survey 3 |
| 10 | Global React Context Providers | Build `AuthContext`, `CartContext`, and `ToastContext` in `src/context/` to replace window event bus | M2 | R2, Survey 1 |
| 11 | Reusable Custom Data Hooks | Build `useAuth`, `useCart`, `useProducts`, `useOrders`, `useCheckout`, `useStoreProfile` with explicit states | M2 | R3, R4 |
| 12 | Eliminate Invalid User Lookup Call | Remove erroneous `GET /api/v1/users/{id}` call from `userService.ts` & `SellerOrderDetailModal.tsx` | M2 | R4, Survey 3 |
| 13 | Component Decoupling & Service Migration | Refactor 26 presentational components to consume custom hooks instead of importing raw services | M3 | R2, R4 |
| 14 | Giant Page Decomposition (CustomerStoreDetail) | Break down 1,240-line page into `StoreHero`, `StoreTabs`, `StoreDagangan`, `StoreProfileView`, `StoreReviews` | M3 | R2, Survey 1 |
| 15 | Giant Page Decomposition (CustomerOrderDetail) | Break down 1,161-line page into `OrderStepper`, `OrderItemsSummary`, `OrderPickupInfo`, `OrderPaymentAction` | M3 | R2, Survey 1 |
| 16 | Giant Page Decomposition (CustomerCheckout) | Break down 1,128-line page into `CheckoutItems`, `CheckoutContactForm`, `CheckoutPaymentMethod`, `CheckoutSummary` | M3 | R2, Survey 1 |
| 17 | Giant Page Decomposition (CustomerMarketplace) | Extract `useMarketplaceFilters`, eliminate 140 lines of duplicated `MysteryBoxCard` markup | M3 | R2, R3 |
| 18 | App.tsx Hash Router & Code Splitting | Add hash query param support for deep linking (`#detail-produk?id=...`); wrap routes in `React.lazy` & `Suspense` | M3 | R2, Survey 1 |
| 19 | Mobile Sticky Conversion Bars | Implement responsive sticky bottom conversion action bars for Cart, Checkout, and Product Detail | M3 | R3, Design.md |
| 20 | CustomerHeader Mobile Alignment Fix | Fix 24px off-center rightward drift (`left-1/2` instead of `left-[calc(50%+24px)]`) on mobile screens | M3 | R3, Survey 2 |
| 21 | Accessibility & Semantic Controls | Convert payment div elements to semantic keyboard-accessible radio buttons; fix yellow chart contrast | M3 | R3, Survey 2 |
| 22 | Touch Target Expansion | Expand interactive buttons, datepicker controls, and password toggles to >= 44x44px touch targets | M3 | R3, Survey 2 |
| 23 | Comprehensive QA & Static Verification | Run and verify `npm run build` (0 errors), `tsc -b` (0 errors), and `oxlint` (0 errors/blocking warnings) | M4 | R5 Acceptance |
| 24 | Bug Remediation & Verification Cycle | Resolve any functional, behavioral, or typing regressions identified during testing | M4 | R5 Acceptance |
| 25 | 10 Final Deliverables Documentation | Author the complete 10-part final deliverables report covering all technical and operational facets | M4 | R5 Acceptance |

---

## 3. Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Foundation, Design System, & Core UI Primitives | Configure Tailwind v4 `@theme`, atomic primitives (`Button`, `Input`, `Badge`, `Card`, `Modal`, `EmptyState`, `Skeleton`), utilities consolidation, and dead code removal | None | DONE |
| M2 | Centralized API Client, Swagger Types, & Custom Hooks | Build centralized Axios client with auto-refresh, 49 Swagger schemas in `types.ts`, domain API callers, `AuthContext`, `CartContext`, and custom data hooks | M1 | DONE |
| M3 | Component Decomposition, UI Slicing, & State Decoupling | Decouple 26 presentational components; decompose 4 giant pages (>1,000 lines); implement mobile sticky bars, header fix, and a11y keyboard controls | M1, M2 | DONE |
| M4 | Independent QA Review, Bug Remediation, Validation, & Final Deliverables | Execute static checks (`tsc -b`, `npm run build`), contract verification, responsive/a11y validation, bug fixes, and compile 10-part final deliverable report | M3 | DONE |

---

## 4. Interface Contracts

### 4.1 Design System & UI Primitives (`src/components/ui/`)
- **`Button`**:
  ```typescript
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'urgent' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
  }
  ```
- **`Input`**:
  ```typescript
  export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
  }
  ```
- **`Modal`**:
  ```typescript
  export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  }
  ```

### 4.2 Centralized API Client & Types (`src/api/`)
- Universal Success Response:
  ```typescript
  export interface ApiResponse<T> {
    request_id: string;
    payload: T;
  }
  ```
- Universal Error Response:
  ```typescript
  export interface ApiErrorResponse {
    request_id: string;
    payload: {
      error: {
        error: string;
        error_code: string;
        location?: string;
        message: string;
        details?: Record<string, unknown> | string;
      };
    };
  }
  ```
- Axios Client: `src/api/client.ts`
  - Base URL: `import.meta.env.VITE_API_BASE_URL || 'https://dolpin-fourthree.bccdev.id/'`
  - Interceptors: Bearer token injection, automatic 401 token refresh queue via `/api/v1/auth/refresh`, error normalization.

### 4.3 Custom Data Hooks (`src/hooks/`)
- **`useAuth`**: `{ user, isAuthenticated, isLoading, login, register, logout, switchRole, error }`
- **`useCart`**: `{ cart, count, subtotal, isLoading, addItem, removeItem, updateQty, clearStore, clearCart, error }`
- **`useProducts`**: `{ products, meta, isLoading, isError, error, setFilters, refetch }`
- **`useOrders`**: `{ orders, meta, isLoading, cancelOrder, refetch }`
- **`useMerchantOrders`**: `{ orders, meta, isLoading, updateStatus, refetch }`
- **`useStoreProfile`**: `{ store, isLoading, updateProfile, updateOperational, toggleStatus }`

---

## 5. Code Layout

```
src/
├── api/                      # Centralized API layer (Owned by Agent 4)
│   ├── client.ts             # Central Axios client with interceptors & auto-refresh
│   ├── types.ts              # Swagger 2.0 DTOs & System Enums (all 49 models)
│   ├── services/             # Pure API service functions grouped by Swagger tag
│   │   ├── authApi.ts
│   │   ├── cartApi.ts
│   │   ├── orderApi.ts
│   │   ├── productApi.ts
│   │   ├── storeApi.ts
│   │   ├── userApi.ts
│   │   ├── storageApi.ts
│   │   └── enumApi.ts
│   └── mappers/              # DTO <-> UI data mappers
│       ├── productMapper.ts
│       ├── orderMapper.ts
│       └── storeMapper.ts
├── components/
│   ├── ui/                   # Reusable atomic design primitives (Owned by Agent 2)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── EmptyState.tsx
│   │   └── Skeleton.tsx
│   ├── layout/               # Header, Sidebar, Mobile navigation
│   ├── customer/             # Customer domain components
│   ├── seller/               # Merchant/seller domain components
│   └── dashboard/            # Merchant analytics and metrics
├── context/                  # React Contexts (Owned by Agent 4 & 5)
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── ToastContext.tsx
├── hooks/                    # Custom data and UI hooks (Owned by Agent 4 & 5)
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useCheckout.ts
│   ├── useProducts.ts
│   ├── useOrders.ts
│   ├── useMerchantOrders.ts
│   ├── useStoreProfile.ts
│   ├── useMarketplaceFilters.ts
│   └── useBrandLoading.ts
├── pages/                    # Routed page views (Owned by Agent 3 & 5)
├── utils/                    # Pure utilities (currency, date, time, markdown)
├── index.css                 # Tailwind v4 @theme design tokens (Owned by Agent 2)
├── App.tsx                   # Modular hash router and application shell (Agent 1 & 3)
└── main.tsx                  # Application bootstrap with Providers
```
