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

- [Node.js](https://nodejs.org/) (v18+)
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

## Production Build

Type-checks, lints, and builds optimized output to the `dist/` folder:

```bash
pnpm run build
```

## Project Structure

```
├── public/          # Static assets and styles
│   ├── style.css
│   └── assets/
├── src/             # Application source code
│   └── main.ts      # Entry point
├── index.html       # HTML shell
├── vite.config.ts   # Vite configuration
└── tsconfig.json    # TypeScript configuration
```
