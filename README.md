# Softgames Assignment

A PixiJS project built with TypeScript and Vite for the Sofgames technical assignment. This project contains a simple menu, with 3 demos showcasing different features.
See [ASSIGNMENT.md](.docs/ASSIGNMENT.md) for the assignment details. (copied from the PDF)

## Tech Stack

- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [PixiJS](https://pixijs.com/) v8 - Rendering engine
- [Vite](https://vitejs.dev/) - bundler and dev server
- [ESLint](https://eslint.org/) - linting
- [Prettier](https://prettier.io/) - code formatting

## Prerequisites

- [Node.js](https://nodejs.org/) (v20.18.1+)
- [pnpm](https://pnpm.io/)

## Setup

```bash
pnpm install
```

## Development

Start the local dev server:

```bash
pnpm start
```

## Linting

```bash
pnpm run lint
```

## Deployment

Deployment is done through Cloudflare Workers using Wrangler.
It deploys to a project with the name `softgames-assignment`.

Authenticate Wrangler against the Cloudflare account for `softgames-assignment@jroossien.com`:

```bash
pnpm wrangler login
```

Build and deploy the Worker:

```bash
pnpm run deploy
```

The Worker is configured in `wrangler.jsonc` and serves the built app as a single-page application by serving the `dist` folder.

### GitHub Actions deployment

The repository includes a workflow that deploys when you push a tag whose target commit is contained in `main`.

Add these repository secrets before using the workflow:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

The API token should be scoped to Workers deploy access for the Cloudflare account you want to use.

## Production Build

Type-checks, lints, and builds optimized output to the `dist/` folder:

```bash
pnpm run build
```

## Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml     # Tag-based Cloudflare deploy workflow
├── public/                # Static assets served directly
│   ├── assets/            # Texture atlases and shared images
│   ├── favicon.png
│   └── style.css
├── src/                   # Application source code
│   ├── scenes/            # Scene implementations and shared scene base
│   ├── services/          # Assets, events, tweens, scene and window services
│   ├── ui/                # Reusable Pixi UI components
│   ├── utils/             # Shared utility helpers
│   ├── App.ts             # App bootstrap and composition root
│   └── main.ts            # Browser entry point
├── index.html             # HTML shell
├── vite.config.ts         # Vite configuration
├── wrangler.jsonc         # Cloudflare Worker deployment config
└── tsconfig.json          # TypeScript configuration
```
