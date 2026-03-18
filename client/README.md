# B1ngo Client

npm workspace containing the Angular apps and shared packages.

## Structure

```
client/
├── apps/
│   ├── b1ngo/        Main app (Angular 21, Tailwind v4)
│   └── showcase/     Design system catalog (dev only)
└── packages/
    └── bng-ui/       Design system component library
```

## Setup

```bash
cd client
npm install
```

All dependencies are hoisted to `client/node_modules/` via npm workspaces.

## Run

```bash
# Main app (http://localhost:4200)
cd apps/b1ngo
npx ng serve

# Showcase (http://localhost:4201)
cd apps/showcase
npx ng serve
```

## Build

```bash
# Library
cd apps/b1ngo
npx ng build bng-ui

# Main app
cd apps/b1ngo
npx ng build

# Showcase
cd apps/showcase
npx ng build
```

## Test

```bash
# Library tests (146 specs)
cd apps/b1ngo
npx ng test bng-ui

# App tests
cd apps/b1ngo
npx ng test
```
