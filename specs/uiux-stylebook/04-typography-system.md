# 04 — Typography System

## Visual reference

![Typography system guide](./images/04-typography-system.png)

## Direction

A restrained type system built for long-form clarity, technical content, and elegant presentation.

The system combines:

- editorial serif for display moments
- clean sans-serif for reading and UI labels
- monospace for code and technical annotations

## Typeface families

| Role | Suggested font | Use |
|---|---|---|
| Display Serif | Canela, Cormorant Garamond, Spectral, Georgia fallback | Slide titles, large statements, quotes |
| Text Sans | Inter, Source Sans 3, system UI fallback | Body copy, labels, lists, captions |
| Mono | IBM Plex Mono, JetBrains Mono, ui-monospace fallback | Code, filenames, technical notes |

Implementation-safe stack:

```css
--font-display: 'Canela', 'Cormorant Garamond', 'Spectral', Georgia, serif;
--font-sans: Inter, 'Source Sans 3', ui-sans-serif, system-ui, sans-serif;
--font-mono: 'IBM Plex Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
```

## Type scale

| Style | Size | Line height | Use |
|---|---:|---:|---|
| Display | 64px | 72px | Large opening statements |
| H1 | 40px | 48px | Main slide heading |
| H2 | 28px | 36px | Secondary heading |
| Subtitle | 18px | 24px | Slide subtitle, intro line |
| Body | 16px | 24px | Paragraphs |
| Caption | 13px | 18px | Captions, attributions |
| Code | 15px | 22px | Code blocks |
| Quote | 32px | 40px | Pull quotes |

## Fluid scaling

Use `clamp()` for viewport resilience:

```css
--type-display: clamp(3rem, 6vw, 4rem);
--type-h1: clamp(2rem, 4vw, 2.5rem);
--type-h2: clamp(1.5rem, 3vw, 1.75rem);
--type-subtitle: clamp(1rem, 1.8vw, 1.125rem);
--type-body: clamp(0.95rem, 1.4vw, 1rem);
--type-caption: clamp(0.75rem, 1.1vw, 0.8125rem);
--type-code: clamp(0.85rem, 1.2vw, 0.9375rem);
```

## Typographic principles

### Prefer left alignment

Left alignment is the default because it supports fast reading.

Centered layouts are reserved for:

- opening slides
- section breaks
- quotes
- short statements

### Use generous line height

Slides are read at distance and under time pressure.

Use comfortable line height instead of dense paragraph blocks.

### Keep line length comfortable

Recommended max line length:

```css
max-width: 58ch;
```

For large headings:

```css
max-width: 14ch;
```

### Use italics for emphasis

Prefer italic emphasis over heavy bold styling.

Bold should be used sparingly.

### Use monospace only where meaningful

Use monospace for:

- code
- paths
- filenames
- commands
- technical values

Do not use monospace as decoration.

## Slide title rail typography

The title rail should use the display serif for the title and small sans/mono-like uppercase for subtitle metadata.

```css
.slide-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3.25rem);
  line-height: 0.95;
  letter-spacing: -0.02em;
}

.slide-subtitle {
  font-family: var(--font-sans);
  font-size: 0.6875rem;
  line-height: 1;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
```

## Quote typography

Quotes should feel literary, not decorative.

```css
blockquote {
  font-family: var(--font-display);
  font-size: var(--type-quote);
  line-height: 1.25;
  font-style: italic;
  max-width: 18ch;
}
```

## Body typography

```css
p {
  font-family: var(--font-sans);
  font-size: var(--type-body);
  line-height: 1.5;
  max-width: 58ch;
}
```
