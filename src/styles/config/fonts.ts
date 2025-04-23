/**
 * Tailwind CSS Font Configuration
 * 
 * This file contains font-family and font-size configurations
 * Extracted from the main tailwind.config.ts to improve build performance
 * and reduce webpack cache serialization warnings
 */

import { fontFamily } from "tailwindcss/defaultTheme";

export const fonts = {
  fontFamily: {
    mono: ["var(--font-geist-mono)", ...fontFamily.mono],
    sans: ["var(--font-geist-sans)", ...fontFamily.sans],
    heading: ["var(--font-aeonik)"],
    default: ["var(--font-inter)", "system-ui", "sans-serif"],
    display: ["var(--font-sf)", "system-ui", "sans-serif"],
  },
  fontSize: {
    "48-96": "var(--fluid-48-96)",
    "24-40": "var(--fluid-24-40)",
    tiny: "0.625rem",
    xs: "0.75rem",
    small: "0.875rem",
    base: "1rem",
    medium: "1rem",
    large: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
};
