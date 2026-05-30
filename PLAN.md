# Markdown Demo Slides Project

## Summary / PRD
Build a greenfield pnpm app for presenting demo slides from MDX files in the browser. The target user is a presenter who wants markdown-first, React-enhanced, portrait-oriented slides with zero visible controls.

Core requirements:
- R1. Slides are loaded from `lectures/<lecture-slug>/<NNN-topic-name>.mdx`.
- R2. Each slide has frontmatter: `title` required, `subtitle` optional.
- R3. Title/subtitle render consistently on every slide.
- R4. Slide viewport is exactly `100vw` by `100dvh`, with no page scrolling, gutters, toolbar, progress bar, or buttons.
- R5. `ArrowRight` advances, `ArrowLeft` goes back; bounds are no-ops.
- R6. Lectures open via `/lectures/:lectureSlug/:slideNumber`; navigation updates the URL with the active slide.
- R7. V1 supports MDX, GFM, images/assets, syntax-highlighted code, custom React components, and Mermaid diagrams.
- R8. The repo includes `lectures/demo-lecture/` as an example deck demonstrating every supported engine capability.

## Architecture
Use a custom Vite + React + TypeScript SPA rather than Slidev/reveal/Marp. This best matches the required folder model, full-viewport portrait behavior, and no-control playback.

Planned structure:
```text
plan.md

lectures/
  demo-lecture/
    001-title-and-subtitle.mdx
    002-markdown-and-gfm.mdx
    003-code-highlighting.mdx
    004-assets-and-images.mdx
    005-mdx-components.mdx
    006-mermaid-diagram.mdx
    assets/

src/
  content/lectures.ts
  presentation/Deck.tsx
  presentation/SlideFrame.tsx
  mdx/MdxProvider.tsx
  mdx/MermaidBlock.tsx
  routes.tsx
```

Important interfaces:
- File naming: `NNN-topic-name.mdx`, where `NNN` is contiguous and unique per lecture.
- Frontmatter schema: `{ title: string; subtitle?: string }`, validated at build/test time.
- Route contract: `/lectures/:lectureSlug/:slideNumber`, with root redirecting to `/lectures/demo-lecture/1`.
- Authoring contract: Mermaid diagrams use fenced blocks with `mermaid`; lecture-local assets live in `assets/`.

## Implementation Plan
- Scaffold `pnpm` + Vite React TS, configure MDX with `@mdx-js/rollup`, React plugin order, GFM/frontmatter plugins, and Shiki-based rehype highlighting.
- Build a lecture registry using `import.meta.glob('/lectures/**/*.mdx', { eager: true })`; parse filenames, sort by numeric prefix, expose slide metadata and components.
- Add validation for missing frontmatter title, invalid subtitle type, duplicate/gapped slide numbers, bad filenames, and empty lectures.
- Implement the deck shell: full viewport CSS reset, keyboard listener, URL synchronization via `history.replaceState`, and no visible controls.
- Implement MDX rendering with shared components, including Mermaid rendering through `mermaid.run`/API with `securityLevel: "strict"` for trusted local content.
- Create `lectures/demo-lecture/` with example slides covering title/subtitle, GFM tables/tasks, syntax-highlighted code, images/assets, a custom MDX component, and Mermaid.

## Test Plan
- Unit tests for filename parsing, lecture sorting, route lookup, and frontmatter validation.
- Component tests for title/subtitle rendering, missing optional subtitle, keyboard navigation, and boundary no-ops.
- Build test that fails on invalid lecture content.
- Playwright checks for `/lectures/demo-lecture/1`: no scrollbars, slide dimensions match viewport, no visible controls, arrows navigate, URL updates, Mermaid SVG renders, and all six demo slides are reachable.

## Assumptions
- Slides are trusted local project content; untrusted remote MDX is out of scope.
- V1 does not include presenter notes, fragments, PDF export, recording, lecture picker UI, or live editor.
- The project starts from the current empty directory.
- `plan.md` should live at the project root.
