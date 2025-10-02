# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development Server**:
```bash
npm run dev
```

**Build**:
```bash
npm run build
```

**Preview Production Build**:
```bash
npm run preview
```

**Add shadcn/ui Components**:
```bash
npx shadcn@latest add [component-name]
```

## Architecture Overview

### Framework Stack
- **Astro 5** as the main framework with React integration
- **Tailwind CSS v4** for styling (using Vite plugin)
- **shadcn/ui** component system configured with New York style
- Mixed component architecture: `.astro` files for static components, React for interactive components

### Tailwind CSS v4 Configuration
This project uses Tailwind CSS v4 with a modern setup:
- **Vite plugin integration**: `@tailwindcss/vite` configured in `astro.config.mjs`
- **No tailwind.config file**: Configuration lives in `src/styles/global.css` using `@theme` directive
- **CSS variables**: Theme uses CSS custom properties with `oklch` color space
- **Dark mode**: Custom variant `@custom-variant dark (&:is(.dark *))` for dark mode support
- **Animations**: `tw-animate-css` package included for animation utilities

### Component System
- **shadcn/ui setup**: Configured in `components.json` with:
  - New York style variant
  - TypeScript support
  - Path aliases: `@/components`, `@/lib`, `@/hooks`, `@/components/ui`
  - Lucide React for icons
  - Base color: zinc

### Path Aliases
Configured in `tsconfig.json`:
- `@/*` → `./src/*`

### Project Structure
- `src/pages/` - Astro page routes
- `src/layouts/` - Reusable page layouts
- `src/components/` - Astro components
- `src/components/ui/` - shadcn/ui React components (when added)
- `src/lib/` - Utility functions (includes `cn()` helper)
- `src/styles/global.css` - Tailwind v4 configuration and theme

### Component Pattern Guidelines
- Use **Astro components** (`.astro`) for static content and server-side rendering
- Use **React components** (`.tsx`) for interactive client-side functionality
- Astro components can import and use React components with `client:*` directives
- The `cn()` utility from `@/lib/utils` is available for conditional class merging

### Theme System
- Theme defined using CSS variables in `src/styles/global.css`
- Uses modern `oklch` color space for better color consistency
- Includes comprehensive design tokens: background, foreground, primary, secondary, muted, accent, destructive, border, input, ring, chart colors, and sidebar variants
- Dark mode theme automatically applies when `.dark` class is present on parent element
