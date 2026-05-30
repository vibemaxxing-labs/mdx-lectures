# 08 — Interaction and Engine Rules

## Visual reference

![Slide anatomy and no-chrome presentation rules](./images/02-core-principles-slide-anatomy.png)

## Runtime behavior

The presentation should behave like a quiet full-screen reading surface.

The engine itself should stay invisible.

## Navigation

Required keyboard behavior:

| Key | Action |
|---|---|
| `ArrowRight` | Go to next slide |
| `ArrowLeft` | Go to previous slide |

Bounds are no-ops:

- pressing `ArrowLeft` on the first slide does nothing
- pressing `ArrowRight` on the final slide does nothing

## URL contract

Lectures open through:

```text
/lectures/:lectureSlug/:slideNumber
```

The URL updates when the active slide changes.

Example:

```text
/lectures/demo-lecture/1
/lectures/demo-lecture/2
/lectures/demo-lecture/3
```

## No visible controls

The engine must not render:

- next/previous buttons
- progress bar
- slide thumbnails
- sidebar
- header
- footer navigation
- debug overlays

Exceptions:

- development-only diagnostics may exist behind a debug flag
- future presenter mode is out of scope for V1

## Viewport

The slide viewport is exactly:

```css
width: 100vw;
height: 100dvh;
```

The app should prevent document scrolling:

```css
html,
body,
#root {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
}
```

## Slide content overflow

No slide should scroll internally.

If content overflows:

1. reduce content
2. split into multiple slides
3. switch to a more appropriate pattern
4. simplify the visual object

Do not solve overflow by adding scroll.

## Frontmatter contract

Every slide file requires:

```yaml
---
title: Slide Title
subtitle: Optional Subtitle
---
```

Rules:

- `title` is required
- `title` must be a non-empty string
- `subtitle` is optional
- `subtitle`, when present, must be a string
- the title rail renders consistently for every slide

## File contract

Slides live in:

```text
lectures/<lecture-slug>/<NNN-topic-name>.mdx
```

Rules:

- `NNN` is numeric
- numbering is contiguous
- numbers are unique per lecture
- filenames are stable and meaningful

Good:

```text
001-title-and-subtitle.mdx
002-markdown-and-gfm.mdx
003-code-highlighting.mdx
```

Bad:

```text
intro.mdx
1.mdx
003 random draft.mdx
```

## Supported content in V1

The engine supports:

- MDX
- GFM
- images/assets
- syntax-highlighted code
- custom React components
- Mermaid diagrams

## Out of scope for V1

Do not design UI around these yet:

- presenter notes
- fragments
- PDF export
- recording
- lecture picker UI
- live editor
- visible playback controls
