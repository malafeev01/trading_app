# Trading App

A mock trading-app home screen built with **Angular**, **ng-zorro-antd** and **Feature-Sliced Design (FSD)**.
There is no real backend: account data lives in `localStorage`, and the news feed comes from the public
[Spaceflight News API](https://api.spaceflightnewsapi.net/v4).

The goal of the project is to show a clean, layered Angular architecture: signals, standalone components,
strict module boundaries (enforced by ESLint) and unit-tested business logic.

## Features

- **Home page** with a header, an account widget, a deposit history and a news feed.
- **Deposit dialog** opened by the `/deposit` route: the home page stays rendered underneath the modal, and closing the dialog returns to `/`.
- **Account balance** kept separately from the deposit history and updated only after the (mock) backend confirms a deposit.
- **News feed** with virtual scrolling, lazy page loading, memory-friendly page eviction and persisted sort order (newest / oldest first).
- **Responsive layout**: on small screens the news widget moves into a drawer opened from the header.

## Tech stack

| Area          | Tools                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------- |
| Framework     | Angular (standalone components, signals, new control flow `@if`/`@for`)                        |
| UI kit        | [ng-zorro-antd](https://ng.ant.design/) (Ant Design for Angular), Angular CDK (virtual scroll) |
| State & async | Signals for state, RxJS for async flows                                                        |
| Forms         | Angular Reactive Forms (typed, non-nullable controls)                                          |
| Architecture  | Feature-Sliced Design                                                                          |
| Quality       | ESLint (`typescript-eslint`, `angular-eslint`), Prettier                                       |
| Tests         | Angular unit-test runner (`ng test`)                                                           |

## Getting started

Requirements: a current LTS version of Node.js and npm.

```bash
npm install      # install dependencies
npm start        # dev server at http://localhost:4200
npm run build    # production build into dist/
npm test         # unit tests
```

### Useful commands

| Command                | What it does                                              |
| ---------------------- | --------------------------------------------------------- |
| `npm start`            | Starts the dev server with live reload (`ng serve`)       |
| `npm run build`        | Builds the app for production                             |
| `npm test`             | Runs unit tests (`ng test`)                               |
| `npm run lint`         | Lints the whole project, including the FSD boundary rules |
| `npm run lint:fix`     | Lints and auto-fixes what can be fixed                    |
| `npm run format`       | Formats all files with Prettier                           |
| `npm run format:check` | Checks formatting without changing files (good for CI)    |
| `npm run check`        | `lint` + `format:check` in one go                         |

### Resetting the mock data

All mock state is stored in the browser. To start from scratch, clear these `localStorage` keys
(or just clear site data in DevTools):

| Key              | Content                  |
| ---------------- | ------------------------ |
| `mock_deposits`  | Deposit history          |
| `mock_balance`   | Current account balance  |
| `mock_sort_type` | Selected news sort order |

## Architecture: Feature-Sliced Design

The code in `src/` is organised by [FSD](https://feature-sliced.design/): first by **layer**, then by
**slice** (a business-meaningful unit), then by **segment** (a technical purpose inside a slice).

### Layers

Layers are ordered from the highest to the lowest. **A module may only import from layers below it.**

```
app        ← bootstrap, global config, routing
pages      ← one slice per route / screen
widgets    ← self-contained UI blocks assembled from lower layers
features   ← user actions that bring business value (e.g. "make a deposit")
entities   ← business entities (deposit, account, article)
shared     ← reusable code with no business knowledge
```

### Folder structure

```
src/
├── app/                          # entry point
│   ├── app.ts                    # root component (just a <router-outlet>)
│   ├── app.config.ts             # providers: router, HttpClient, ng-zorro
│   └── app.routes.ts             # lazy routes: "" (home) → "deposit" (modal)
│
├── pages/
│   ├── home/                     # home screen, composes the widgets
│   └── deposit/                  # route that opens the deposit dialog
│
├── widgets/
│   ├── header/                   # top bar + mobile drawer (content is projected in)
│   ├── account/                  # balance + "Deposit" button
│   ├── deposit-history/          # list of past deposits
│   └── news/                     # virtual-scroll news feed
│       ├── lib/                  #   persisted sort order
│       ├── model/                #   virtual-scroll data source
│       └── ui/                   #   component
│
├── features/
│   └── deposit/
│       ├── model/                # MakeDepositService: deposit + account credit
│       └── ui/                   # deposit dialog (form)
│
├── entities/
│   ├── deposit/                  # deposit history
│   │   ├── api/                  #   mock backend
│   │   └── model/                #   types, limits, store
│   ├── account/                  # account balance
│   │   ├── api/
│   │   └── model/
│   └── article/                  # news article
│       ├── api/                  #   HTTP client
│       └── model/                #   domain types
│
└── shared/
    ├── ui/                       # widget-block
    ├── lib/                      # responsive layout service
    └── config/                   # route paths, mock app config
```

Common segments: `ui` (components), `model` (types, stores, business logic), `api` (backend access),
`lib` (helpers), `config` (constants).

### Rules

1. **Layers only import downwards.** `entities` cannot import `features`, `shared` cannot import anything above it.
2. **Public API only.** Every slice exposes an `index.ts`. Import `@/entities/deposit`, never `@/entities/deposit/model/...`.
3. **Slices of one layer are isolated.** `widgets/header` must not import `widgets/news`; `entities/deposit` must not import `entities/account`.
4. **Use the `@/` alias** (mapped to `src/` in `tsconfig.json`) across slices; relative paths are for files inside the same slice.

These rules are enforced by ESLint (see [Code quality](#code-quality)), so a violation fails `npm run lint`.

### How the layers work together: making a deposit

```
DepositDialog (features/deposit/ui)
      │  submit
      ▼
MakeDepositService (features/deposit/model)       ← the only place that knows both entities
      │ 1. DepositStore.add()   → entities/deposit  → mock API → history updated
      │ 2. AccountStore.credit() → entities/account → mock API → balance updated
      ▼
Widgets read signals:  AccountWidget → AccountStore.balance
                       DepositHistoryWidget → DepositStore.deposits
```

Entities do not know about each other. The feature ties them together, so adding withdrawals or trades later
does not force `account` to depend on every kind of operation.

Both stores follow the same pattern: state is a private writable signal exposed as a read-only signal, and it
is updated **only after the backend responds** (no optimistic updates).

### Composition without cross-imports

The header needs to show news in a mobile drawer, but widgets must not import each other. Instead, the page
passes the content in:

```html
<app-header-widget>
  <ng-template #drawerContent><app-news-widget /></ng-template>
</app-header-widget>
```

The template is rendered lazily, so the news widget is created only when the drawer is opened.

## Mock backend and data sources

- **Deposits and balance**: `DepositApi` and `AccountApi` persist to `localStorage` and simulate network latency (300 ms).
  They are the only places to replace with real `HttpClient` calls once a backend exists.
- **News**: `ArticleApi` calls the Spaceflight News API. The base URL is provided through the `ARTICLES_API_URL`
  injection token, so it can be overridden in `app.config.ts` or in tests.

## Testing

Unit tests live next to the code they cover (`*.spec.ts`). They focus on logic rather than markup:

| Area                           | What is verified                                                                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DepositStore`, `AccountStore` | State changes only after the backend responds; the balance comes from the server; failures leave state untouched                                                         |
| `MakeDepositService`           | Deposit is recorded first, then the account is credited; a failed deposit never credits the account                                                                      |
| `ArticlesDataSource`           | Only visible pages are loaded; list length follows the server count; failed pages can be retried; stale responses after a sort change are ignored; far pages are evicted |
| `DepositApi`, `AccountApi`     | Invalid amounts are rejected; corrupted storage is handled; data is persisted                                                                                            |
| Mappers and storage helpers    | DTO → domain mapping, validation of the stored sort order                                                                                                                |

Backend calls are replaced with hand-written fakes (usually backed by a `Subject`), so timing and race conditions
are fully controlled without timers.

## Code quality

- **ESLint** (`eslint.config.js`): `typescript-eslint` and `angular-eslint` recommended presets, plus the component/directive
  selector prefix `app`.
- **FSD boundaries** (`eslint.fsd.cjs`): built on the standard `no-restricted-imports` rule. For every layer and slice it
  generates restrictions for upward imports, deep imports bypassing the public API, imports between sibling slices
  and long relative paths. New slices are picked up automatically.
- **Prettier**: 100 columns, single quotes, Angular parser for HTML templates.

Limitations: dynamic `import()` expressions are not checked by `no-restricted-imports`, and the `@x` cross-import
notation of FSD is not supported.

## Conventions

- Standalone components only; state is held in signals, RxJS is used where streams are natural (HTTP, form submit).
- Stores and APIs never expose writable state.
