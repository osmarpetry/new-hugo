---
title: "Typescript Overwrite Types"
date: 2025-01-15
tags:
  - typescript
description: "Overwriting types in TypeScript"
---

## Summary

This is a simple example of how to overwrite types from a library. When you do not want to use `Pick` or `Omit`, this strategy can be a good option.

## Example

```typescript
declare module "@maas-components/button" {
  export interface ButtonProps {
    /**
     * The content of the button.
     */
    children?: React.ReactNode;

    /**
     * The color of the component. It supports those theme colors
     * that make sense for this component.
     */
    color?: "inherit" | "primary" | "secondary" | "danger" | "success";

    /**
     * If `true`, the button will be disabled.
     */
    disabled?: boolean;

    /**
     * If `true`, no elevation is used.
     */
    disableElevation?: boolean;

    /**
     * If `true`, the keyboard focus ripple will be disabled.
     */
    disableFocusRipple?: boolean;

    /**
     * Element placed after the children.
     */
    endIcon?: React.ReactNode;

    /**
     * If `true`, the button will take up the full width of its container.
     */
    fullWidth?: boolean;

    /**
     * The URL to link to when the button is clicked.
     * If defined, an `a` element will be used as the root node.
     */
    href?: string;

    /**
     * The size of the button.
     * `small` is equivalent to the dense button styling.
     */
    size?: "small" | "medium" | "large";

    /**
     * Element placed before the children.
     */
    startIcon?: React.ReactNode;

    /**
     * The variant to use.
     */
    variant?: "text" | "outlined" | "contained";

    /**
     * Can be set to circle, square, or omitted.
     */
    shape?: "circle" | "square";

    /**
     * The styles in className.
     */
    className?: string;

    type?: "submit";
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  }

  // eslint-disable-next-line react/prefer-stateless-function
  declare const Button: React.FC<ButtonProps>;

  export default Button;
}
```

## Related Notes



- [[typescript-mapped-types-and-generics|Mapped Types and Generics]]


