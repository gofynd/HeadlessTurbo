# Turbo - Fynd Commerce React Theme

A production-ready, high-performance React storefront theme built for the **Fynd Commerce Platform**. Turbo provides a complete e-commerce experience with dynamic product listings, checkout, user accounts, blog, and AI-powered search — all powered by GraphQL via the Fynd FDK SDK.

## Documentation

### Getting Started

- **[Getting Started](#quick-start)** - Setup and run locally
- **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to Boltic, AWS EC2, or Cloudflare Workers

### Architecture & Core Concepts

- **[Project Structure](#project-structure)** - Codebase organization
- **[Server Architecture](#server-architecture)** - Fastify server and proxy setup
- **[Webpack Configuration](#webpack-configuration)** - Build pipeline details
- **[Global Configuration](#global-configuration)** - Theme customization via local config files
- **[Copilot.live Integration](#copilotlive-integration)** - AI chatbot setup

## Features

- **Full E-commerce Storefront** — Product catalog, collections, categories, cart, checkout, wishlists, and order tracking
- **GraphQL Integration** — All data fetching via `@gofynd/fdk-store-gql` for fast, typed API communication
- **Section-based Architecture** — 58 prebuilt, reusable section components composed in code per page
- **AI-Powered Copilot** — Copilot.live chatbot with 11+ actions (product search, add to cart, navigation)
- **Multi-language Support** — i18n with 22 language locales
- **Responsive Design** — Mobile-first, works across all screen sizes
- **Hyperlocal Delivery** — Delivery promise display (minutes, hours, date range)
- **User Accounts** — Login (OTP + password), registration, profile, addresses, order history, refunds
- **Blog & Content** — Blog with categories, contact forms, FAQ, policy pages
- **Performance Optimized** — Code splitting, lazy loading, CSS extraction, asset hashing, LRU caching
- **Fastify Server** — Lightweight production server with compression, security headers, API proxy, and SPA fallback
- **Developer Experience** — HMR, ESLint + Prettier, Husky pre-commit hooks, hot reload

## Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Redux, React Hook Form |
| **Styling** | LESS, CSS Modules, Framer Motion |
| **Build** | Webpack 5, Babel 7, MiniCssExtractPlugin |
| **Server** | Fastify 5, with compress/helmet/static/proxy plugins |
| **API** | GraphQL via @gofynd/fdk-store-gql |
| **Images** | PixelBin CDN (@pixelbin/core) |
| **Carousel** | Embla Carousel |
| **Maps** | React Google Maps API, Google Model Viewer |
| **Auth** | JWT (jwt-decode), OTP & password-based |
| **Linting** | ESLint (Airbnb config), Prettier |
| **Containerization** | Docker (multi-stage, distroless) |

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** v20 or above (Fastify 5 requires Node 20+) — [Download](https://nodejs.org/)
2. **Git** installed — [Download](https://git-scm.com/)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url> Turbo
cd Turbo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

The `.env` should contain:

```env
PROXY_TARGET=https://api.fynd.com
DOMAIN=api.fynd.com
PORT=8080
APPLICATION_ID=your_application_id
APPLICATION_TOKEN=your_public_application_token
TURBO_DEV_PORT=5002
USE_PROXY=true
```

- `PORT` — Fastify app port (the one you open in the browser)
- `TURBO_DEV_PORT` — Webpack Dev Server port that Fastify proxies to in dev
- `USE_PROXY=true` — Fastify proxies `/service`, `/ext`, `/graphql` to `PROXY_TARGET`
- `APPLICATION_ID` / `APPLICATION_TOKEN` — injected into the HTML at request time via `window.__APP_CREDENTIALS__`. The token is readable by every visitor, so it **must be a public-scope token only** — never a partner-level or privileged token

> **Important**: Never commit your `.env` file with real credentials. Use `.env.example` as the template.

### 4. Start Development Server

```bash
npm run dev
```

`scripts/dev.js` boots both processes in the right order:

- **Webpack Dev Server** on port `5002` (HMR + React Refresh)
- **Fastify proxy server** on port `8080` — forwards HTML to WDS and API calls to `PROXY_TARGET`

Open `http://localhost:8080` in your browser.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev environment (Webpack + Fastify proxy) |
| `npm run build` | Production build (clean + Webpack minification) |
| `npm start` | Start Fastify server in production mode |
| `npm run webpack:serve` | Start Webpack Dev Server only |
| `npm run build:dev` | Development build with watch mode |
| `npm run clean` | Remove `dist/` and `dist_sections/` directories |
| `npm run start:static` | Serve built `dist/` folder via `npx serve` |
| `npm run lint` | Run ESLint on `.js`/`.jsx` files |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format code with Prettier |

## Project Structure

```
Turbo/
├── theme/                          # Main theme source code
│   ├── app.jsx                     # React entry (ErrorBoundary, providers, router)
│   ├── index.jsx                   # FPI client setup, GraphQL config
│   ├── routes.jsx                  # React Router (lazy-loaded pages)
│   │
│   ├── pages/                      # 45 page components
│   │   ├── home.jsx
│   │   ├── product-listing.jsx
│   │   ├── product-description.jsx
│   │   ├── cart-landing.jsx
│   │   ├── single-page-checkout.jsx
│   │   ├── login.jsx
│   │   ├── orders-list.jsx
│   │   ├── blog.jsx
│   │   └── ...
│   │
│   ├── sections/                   # 58 reusable section components
│   │   ├── hero-section.jsx
│   │   ├── featured-collection.jsx
│   │   ├── featured-products.jsx
│   │   ├── testimonials.jsx
│   │   ├── application-banner.jsx
│   │   └── ...
│   │
│   ├── components/                 # 70+ reusable UI components
│   │   ├── header/
│   │   ├── footer/
│   │   ├── cart/
│   │   ├── product/
│   │   ├── auth/
│   │   ├── breadcrumb/
│   │   ├── carousel/
│   │   └── ...
│   │
│   ├── page-layouts/               # 30+ page layout variants
│   │   ├── pdp/                    # Product detail page
│   │   ├── plp/                    # Product listing page
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── profile/
│   │   └── ...
│   │
│   ├── queries/                    # 36 GraphQL query definitions
│   │   ├── productQuery.js
│   │   ├── cartQuery.js
│   │   ├── checkoutQuery.js
│   │   └── ...
│   │
│   ├── styles/                     # 35 LESS/CSS stylesheets
│   │   ├── base.global.less
│   │   ├── mixins.less
│   │   ├── media.less
│   │   └── ...
│   │
│   ├── helper/                     # Utility functions & business logic
│   │   ├── utils.js
│   │   ├── copilot-utils.js
│   │   ├── api-config.js
│   │   ├── auth-guard.js
│   │   ├── constant.js
│   │   └── ...
│   │
│   ├── providers/                  # Context providers
│   │   └── global-provider.jsx     # Redux/FPI/Copilot initialization
│   │
│   ├── layouts/
│   │   └── RootLayout.jsx          # Main app shell
│   │
│   ├── locales/                    # 22 language locales (translation + schema files)
│   ├── assets/                     # Static images, icons, fonts
│   ├── config/                     # Theme configuration schemas
│   │   ├── settings_schema.json    # Global settings schema (reference)
│   │   └── settings_data.json      # Active theme settings (read at runtime)
│   └── custom-templates/           # Custom template extensions
│
├── public/
│   └── index.html                  # HTML template
│
├── dist/                           # Production build output
├── scripts/
│   └── dev.js                      # Dev server orchestration
│
├── server.js                       # Fastify production server
├── webpack.config.js               # Webpack 5 configuration
├── Dockerfile                      # Multi-stage Docker build
├── boltic.yaml                     # Boltic deployment config
├── config.json                     # Font & styling metadata
├── package.json                    # Dependencies & scripts
├── .env                            # Environment variables (not committed)
└── copilot/                        # Copilot.live AI configuration
```

## Server Architecture

Turbo uses a **Fastify 5** server (`server.js`) that serves two purposes:

### Development Mode (`DEV=1`)

All traffic is forwarded to the Webpack Dev Server, enabling hot module reloading.

### Production Mode

- **Static file serving** — Serves built assets from `dist/` with immutable cache headers
- **SPA fallback** — All non-file routes serve `index.html` with runtime credential injection
- **API proxy** — Proxies `/service`, `/ext`, `/graphql` routes to Fynd API (`PROXY_TARGET`)
- **Security** — Helmet headers, response compression (gzip/brotli)
- **Health checks** — `/__health` and `/__version` endpoints

### Runtime Credential Injection

The server injects `APPLICATION_ID` and `APPLICATION_TOKEN` into the HTML at request time via `window.__APP_CREDENTIALS__`, so credentials are never baked into the build.

## Webpack Configuration

### Entry & Output

- **Entry**: `theme/app.jsx`
- **Output**: `dist/[name].[contenthash].js` with content-hash cache busting

### Loaders

| Loader | Purpose |
|---|---|
| `babel-loader` | Transpile JSX/ES6+ via `@babel/preset-env` and `@babel/preset-react` (+ `@babel/preset-typescript` for `.ts`/`.tsx`) |
| `css-loader` | Processes CSS — modules disabled for plain `.css` and `*.global.less`, enabled for all other `.less` files |
| `less-loader` | LESS compilation with module and global style support |
| `@svgr/webpack` | Import SVGs as React components |
| `asset/resource` | Manage fonts, images, and static assets (`assets/images/` and `assets/fonts/`) |

### Plugins

- **MiniCssExtractPlugin** — Extract CSS into separate files for parallel loading
- **HtmlWebpackPlugin** — Generate `index.html` with asset injection
- **DefinePlugin** — Injects only an explicit allowlist of non-sensitive build-time values (`NODE_ENV`, `PUBLIC_URL`, `DOMAIN`, `USE_PROXY`) into the client bundle; secrets like `APPLICATION_TOKEN` are never baked into the build (they are injected at request time by the server)
- **ReactRefreshWebpackPlugin** — Fast refresh during development

### Optimization

- **CssMinimizerPlugin** for CSS minification in production
- **Code splitting** with dynamic `import()` for lazy-loaded pages

## Global Configuration

Global theme settings are defined locally in the repository — this headless setup does **not** use the Fynd Platform theme editor. Settings are read at runtime from [`theme/config/settings_data.json`](./theme/config/settings_data.json) (via the `useThemeConfig` hook). [`theme/config/settings_schema.json`](./theme/config/settings_schema.json) documents most available options; a few flags (e.g. the hyperlocal/delivery-promise toggles) are read directly by components from `settings_data.json`.

The following configurations are available:

| Configuration | Type | Default | Category | Description |
|---|---|---|---|---|
| `font_header` | font | — | Typography | Font styling for header elements |
| `font_body` | font | — | Typography | Font styling for body text |
| `header_layout` | select | `single` | Header | Single or Double row navigation |
| `logo_menu_alignment` | select | `layout_1` | Header | Logo and menu alignment on desktop |
| `header_mega_menu` | radio | default menu | Header | Enable mega menu (double row only) |
| `is_hyperlocal` | checkbox | `false` | Header | Location-based content personalization |
| `is_delivery_minutes` | checkbox | `false` | Header | Show delivery promise in minutes |
| `is_delivery_hours` | checkbox | `false` | Header | Show delivery promise in hours |
| `is_delivery_day` | checkbox | `false` | Header | Show delivery as Today/Tomorrow |
| `is_delivery_date` | checkbox | `false` | Header | Show delivery as date range |
| `logo` | image_picker | — | Footer | Custom footer logo |
| `footer_description` | text | — | Footer | Footer branding text |
| `disable_cart` | checkbox | `false` | Cart & Buttons | Disable cart and checkout |
| `show_price` | checkbox | `true` | Cart & Buttons | Toggle price visibility |
| `button_options` | select | `addtocart_buynow` | Cart & Buttons | Product action button configuration |
| `product_img_width` | text | — | Product Card | Product card image width |
| `product_img_height` | text | — | Product Card | Product card image height |
| `show_sale_badge` | checkbox | `true` | Product Card | Show sale badge on discounted items |
| `image_border_radius` | range | `24` | Product Card | Corner radius for product images |
| `img_fill` | checkbox | `false` | Product Card | Image fill/cover mode |
| `show_image_on_hover` | checkbox | `false` | Product Card | Show alternate image on hover |
| `section_margin_bottom` | range | `16` | Other | Bottom margin for page sections |
| `button_border_radius` | range | `4` | Other | Corner radius for buttons |

### Modifying Global Configuration

1. Open `theme/config/settings_data.json`
2. Locate the active mode in `list` (matched by the `current` field, e.g. `"Default"`)
3. Edit values under `global_config` (Typography, Header, Cart, Product Card, etc.) — refer to `theme/config/settings_schema.json` for available options and types
4. Per-page section settings live under each mode's `page` array
5. Restart the dev server (or rebuild for production) to see the changes

## Copilot.live Integration

Turbo includes built-in **Copilot.live** AI chatbot integration for enhanced shopping experience.

> **Note**: The theme does not load the Copilot widget itself. It registers storefront actions with an already-present `window.copilot` object — the Copilot.live widget script must be embedded separately (e.g. via your Copilot.live account). If `window.copilot` is not present, initialization is silently skipped.

### Available Copilot Actions

| Action | Description |
|---|---|
| `search_product` | Search for products on the store |
| `add_to_cart` | Add products to the shopping cart |
| `redirect_to_cart` | Navigate to the cart page |
| `redirect_to_product` | Navigate to a specific product page |
| `redirect_to_home` | Navigate to the home page |
| `redirect_to_contact_support` | Navigate to contact/support page |
| `redirect_to_policies` | Navigate to policy pages |
| `redirect_to_checkout` | Navigate to checkout |
| `redirect_to_collections` | Navigate to collections or specific collection |
| `redirect_to_categories` | Navigate to categories or specific category |
| `redirect_to_blogs` | Navigate to blogs or specific blog post |

The full action list (including wishlist, order, and additional cart/product actions) is documented in [`copilot/README.md`](./copilot/README.md).

### Configuration

Storefront action registration is controlled by the `storefront_copilot_actions` setting in `theme/config/settings_data.json` (default: `false`). When disabled, the Copilot widget still works but uses backend API results instead of storefront actions. The action implementations live in [`copilot/actions/`](./copilot/actions/), and registration is triggered from `theme/providers/global-provider.jsx` via `initializeCopilot()`.

### Verifying Copilot

1. Ensure the Copilot.live widget script is embedded so `window.copilot` exists
2. Set `storefront_copilot_actions` to `true` in `theme/config/settings_data.json`
3. Start the dev server: `npm run dev`
4. Open the browser console — look for:
   - `"🚀 [COPILOT] Initializing copilot registration..."`
   - `"🎉 [COPILOT] Copilot initialization completed successfully"`
   - (If the setting is disabled you'll see `"ℹ️ [COPILOT] Storefront Copilot Actions disabled..."` instead)
5. Registration retries up to 3 times with exponential backoff; failures are logged to the console.

## Troubleshooting

| Issue | Solution |
|---|---|
| Dev server not loading | Check that ports `5002` (WDS) and `8080` (Fastify) are free, or override `TURBO_DEV_PORT` / `PORT` in `.env` |
| API calls failing | Verify `PROXY_TARGET` and `APPLICATION_ID`/`APPLICATION_TOKEN` in `.env` |
| Copilot not initializing | Ensure the Copilot.live widget script is embedded (`window.copilot` must exist) and `storefront_copilot_actions` is `true` in `settings_data.json`; registration retries automatically (3x with backoff) |
| Build errors | Run `npm run clean` then `npm run build` |
| Styles not updating | Clear browser cache; ensure LESS files are imported correctly |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow linting rules: `npm run lint`
4. Format code: `npm run format`
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code restructuring
- `docs:` — Documentation changes
- `chore:` — Build/tooling changes

## License

This project is licensed under the ISC License.

## Support

- Create an issue in the repository
- Check the [Fynd Documentation](https://docs.fynd.com)
- Visit [Fynd Partners Help](https://partners.fynd.com/help/docs)

---

Made with the Fynd Team
