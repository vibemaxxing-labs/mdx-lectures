# 03 — Color System

## Visual reference

![Light and dark color system](./images/03-color-system.png)

## Direction

Use soft neutrals and low-saturation accents to preserve a book-like reading atmosphere.

The palette should avoid pure white and pure black.

The interface should feel like paper and ink, not like a dashboard.

## Light mode palette

| Token | Hex | Use |
|---|---:|---|
| Paper | `#F7F4EF` | Main background |
| Stone | `#EAE4D8` | Surfaces, subtle cards |
| Mist | `#D7D0C5` | Rules, borders, quiet fills |
| Graphite | `#6E716F` | Secondary text |
| Ink | `#1F1E1B` | Primary text |
| Muted Blue | `#7E8A92` | Structural accent |

## Dark mode palette

| Token | Hex | Use |
|---|---:|---|
| Night Paper | `#171613` | Main background |
| Coal | `#24211D` | Surfaces, cards, code panels |
| Rule | `#3A3732` | Rules, borders, dividers |
| Smoke | `#8F8A82` | Secondary text |
| Chalk | `#E8E1D5` | Primary text |
| Mist Blue | `#98A4A8` | Structural accent |

## Semantic tokens

| Semantic token | Light | Dark |
|---|---:|---:|
| `--color-bg` | `#F7F4EF` | `#171613` |
| `--color-surface` | `#EAE4D8` | `#24211D` |
| `--color-text` | `#1F1E1B` | `#E8E1D5` |
| `--color-text-muted` | `#6E716F` | `#8F8A82` |
| `--color-rule` | `#D7D0C5` | `#3A3732` |
| `--color-accent` | `#7E8A92` | `#98A4A8` |

## Usage rules

### Do not use pure white or pure black

Pure white and pure black are too harsh for long reading sessions and projected screens.

Use warm near-white and warm near-black instead.

### Accent color is structural

Accent color should guide reading or mark structure.

Use accent color for:

- section labels
- active emphasis
- thin rules
- small metadata
- diagram highlights

Do not use accent color as decoration.

### Contrast should feel gentle, not clinical

Aim for readable but soft contrast.

Text must stay legible, but the page should not feel like a developer console or admin UI.

### Images should be calm

Images should be:

- desaturated
- low contrast
- quiet in composition
- compatible with both light and dark modes

Avoid:

- bright saturated photos
- noisy backgrounds
- high-detail images behind text
- random decorative images

## Recommended theme classes

```css
:root,
[data-theme='light'] {
  --color-bg: #F7F4EF;
  --color-surface: #EAE4D8;
  --color-text: #1F1E1B;
  --color-text-muted: #6E716F;
  --color-rule: #D7D0C5;
  --color-accent: #7E8A92;
}

[data-theme='dark'] {
  --color-bg: #171613;
  --color-surface: #24211D;
  --color-text: #E8E1D5;
  --color-text-muted: #8F8A82;
  --color-rule: #3A3732;
  --color-accent: #98A4A8;
}
```
