# 01 — Core Principles

## Visual reference

![Core principles and slide anatomy](./images/02-core-principles-slide-anatomy.png)

## Product feeling

The MDX Presentation Engine should feel like a calm editorial reading surface, not like a slideware interface.

It is closer to a typographic book, essay, or design manual than to PowerPoint, Keynote, Reveal, or Slidev.

The viewer should focus on the content, not on the software.

## Principles

### 1. Full viewport, zero chrome

Every slide occupies the entire browser viewport.

Use:

```css
width: 100vw;
height: 100dvh;
overflow: hidden;
```

Do not show:

- toolbar
- slide counter
- progress bar
- navigation buttons
- side gutters
- scrollbars
- browser-like frame

Navigation exists, but the interface stays invisible.

### 2. Vertical title rail

Every slide has a persistent title rail in the lower-left corner.

The rail contains:

- required `title`
- optional `subtitle`

The text reads bottom-to-top.

The title rail acts like a book spine: quiet, consistent, and structural.

### 3. Readable hierarchy

Typography should guide attention before decoration does.

Hierarchy order:

1. main idea / heading
2. supporting explanation
3. media / diagram / code
4. caption / attribution / metadata
5. persistent vertical title rail

The title rail is always present, but it should not dominate the main content.

### 4. Comfortable rhythm

Spacing should feel measured and calm.

Prefer generous margins, modular spacing, and restrained content density.

Use whitespace as an active part of the composition.

A slide should never feel packed.

### 5. Composable content blocks

MDX content should render through predictable content components:

- paragraphs
- headings
- lists
- blockquotes
- code blocks
- images with captions
- tables
- checklists
- Mermaid diagrams
- custom React callouts/components

Each block should obey the same rhythm, color, and typography rules.

### 6. Dark & light parity

Dark mode and light mode should use the same hierarchy and layout rules.

Dark mode is not a neon developer theme.

It should feel like warm night paper:

- low glare
- readable contrast
- soft parchment text
- warm charcoal backgrounds
- muted accents

## Decision rule

When unsure, choose the quieter option.

Remove decorative elements unless they improve comprehension.
