---
title: "SVG Are the Best"
date: 2025-01-15
tags:
  - frontend
description: "Why SVG is often a better choice than icon fonts and bitmap images for modern web interfaces."
---

SVG and icon fonts can solve similar problems, especially for icons. However, icon fonts must be downloaded correctly and mapped to the expected glyphs. When that fails, users may see empty squares or broken characters. SVG does not have that problem because the graphic itself is rendered directly.

## SVG vs. Font Icons

Both approaches can be used for icons, but SVG is usually the better choice.

### Why SVG is better

- It does not depend on a font being loaded correctly
- It can be styled and animated with CSS
- It scales well across screen sizes
- It works well for diagrams, illustrations, and UI icons
- It supports filters and visual effects
- It is accessible when used correctly
- It exists as structured markup in the DOM
- It is code, so it can be versioned, reviewed, and edited easily

## SVG Benefits

### 1. Interactive and stylable with CSS

SVG elements can be targeted directly with CSS. You can change properties such as `fill`, `stroke`, `opacity`, `transform`, and more.

### 2. Responsive and adaptive

SVG is resolution-independent, so it remains sharp across different screen densities and sizes.

### 3. Advanced animations

You can animate SVG with CSS, JavaScript, or native SVG animation techniques.

### 4. Great for graphics and data visualisation

SVG is an excellent fit for diagrams, charts, maps, and illustrations. Libraries such as D3 make extensive use of it.

### 5. Effects and filters

SVG supports blur, shadow, masking, clipping, gradients, and other visual effects.

### 6. Internationalisation support

Because SVG is markup, it can support text, structure, and language-aware adaptations more naturally than many image workflows.

### 7. Good compression

SVG is text-based, which means it compresses very well with GZIP.

### 8. Accessibility

SVG can be made accessible with proper labelling, titles, roles, and semantic usage.

### 9. DOM tree visibility

An inline SVG becomes part of the DOM, which makes inspection and manipulation much easier.

### 10. It is code

Because SVG is code, it fits naturally into engineering workflows such as linting, code review, version control, and componentisation.

## When to Use SVG or Bitmap

As a rule of thumb:

- Use **SVG** for icons, logos, diagrams, charts, UI illustrations, and graphics with clean geometric shapes
- Use **bitmap formats** such as PNG, JPG, or WebP for photographs and highly detailed textured images

The image below demonstrates the difference between bitmap and SVG scaling:

![Comparison of bitmap and SVG scaling](https://commons.wikimedia.org/wiki/Special:FilePath/Bitmap%20VS%20SVG.svg)

## How to Embed SVG

There are several ways to use SVG on the web, and each has trade-offs.

### 1. HTML `img`

```html
<img src="/icons/check.svg" alt="Check icon" />
```

This is simple and works well, but the internal SVG nodes cannot be styled directly with CSS from the page.

### 2. CSS `background-image`

```css
.icon {
  background-image: url("/icons/check.svg");
  background-repeat: no-repeat;
  background-size: contain;
}
```

Useful for decorative assets, but it has the same limitation: you cannot directly style the internal SVG structure.

### 3. `iframe`, `object`, or `embed`

These approaches are heavier and generally less convenient. They also make styling and integration more difficult.

### 4. Data URI

You can embed SVG as a data URI, but it is usually harder to maintain and may not benefit from normal caching strategies in the same way as external assets.

### 5. Inline SVG

```html
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="..." />
</svg>
```

This is the most flexible option. Because the SVG is inline, you can style and animate individual elements directly. The trade-off is that the markup ships with the HTML.

## `viewBox` and Viewport

These two concepts are essential.

### `viewBox`

The `viewBox` defines the internal coordinate system of the SVG.

```html
<svg viewBox="0 0 100 100"></svg>
```

That means the drawing area uses a coordinate space that starts at `0 0` and spans `100 x 100`.

### Viewport

The viewport is the actual rendered size on the page, controlled by attributes like `width` and `height` or by CSS.

```html
<svg viewBox="0 0 100 100" width="200" height="200"></svg>
```

Here, the internal drawing system remains `100 x 100`, but it is rendered at `200 x 200` pixels.

## `preserveAspectRatio`

This property controls how the SVG scales inside its viewport.

### Default behaviour

By default, SVG preserves its aspect ratio. That means it scales without distortion.

### `none`

If you set `preserveAspectRatio="none"`, the SVG stretches to fill the viewport, even if that distorts the graphic.

```html
<svg viewBox="0 0 100 100" preserveAspectRatio="none"></svg>
```

### Other useful values

Values such as `xMidYMid meet`, `xMaxYMin meet`, or `xMidYMid slice` give you more control over alignment and scaling. They are powerful, but should be chosen carefully depending on the layout goal.

## Practical Recommendation

Use inline SVG when:

- you need styling control

- you need animation

- you need accessibility hooks

- you want full control in a component system

Use `img` when:

- the SVG is static

- you only need to display it

- you do not need to style its internals

Use bitmap when:

- the asset is a photograph

- the image contains complex natural detail

- vector conversion would not make sense

## Related Notes

- [12 Principles of Animation](https://chatgpt.com/c/12-principles-of-animation)

- [Databases for Front-End Developers](https://chatgpt.com/c/database-for-frontend)

- [Enterprise UI Development — Testing, Standards, and Ego Control](https://chatgpt.com/c/enterprise-ui-development)

- [Form Validation in Next.js](https://chatgpt.com/c/form-validation-nextjs)

- [Forwarding Ref](https://chatgpt.com/c/forwarding-ref)

- [Web Accessibility V3 — Topics cheat-sheet & decision guide](https://chatgpt.com/c/web-accessibility)
