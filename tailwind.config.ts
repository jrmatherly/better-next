import { heroui } from '@heroui/theme';
import type { Config } from 'tailwindcss';
import {
  animations,
  colors,
  fonts,
  keyframes,
  themes,
} from './src/styles/config';

const svgToDataUri = require('mini-svg-data-uri');
const {
  default: flattenColorPalette,
} = require('tailwindcss/lib/util/flattenColorPalette');

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: fonts.fontFamily,
      fontSize: fonts.fontSize,
      spacing: {
        '300-600': 'var(--fluid-300-600)',
      },
      boxShadow: {
        input:
          '0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)',
      },
      colors: colors,
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        large: '1rem',
        medium: '0.75rem',
        small: '0.5rem',
      },
      borderWidth: {
        DEFAULT: '1px',
        '0': '0',
        '2': '2px',
        '4': '4px',
        '8': '8px',
        small: '1px',
        medium: '2px',
        large: '3px',
      },
      // Import animations from modular config
      animation: animations,
      // Import keyframes from modular config
      keyframes: keyframes,
    },
  },
  plugins: [
    heroui({
      layout: {
        borderWidth: {
          large: '3px', // border-large
          medium: '2px', // border-medium (default)
          small: '1px', // border-small
        },
        // Using the correct property name 'radius' instead of 'borderRadius'
        radius: {
          small: '0.375rem', // rounded-small
          medium: '0.5rem', // rounded-medium (default)
          large: '0.75rem', // rounded-large
        },
        // Removed fontSize configuration to use heroui defaults
      },
      themes: themes,
    }),
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('tailwindcss-animate'),
    // Re-adding plugins that were in the original config
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar-hide'),
    // Re-adding the Radix variant plugin
    require('tailwindcss/plugin')(
      ({
        addVariant,
      }: { addVariant: (name: string, definition: string) => void }) => {
        addVariant('radix-side-top', '&[data-side="top"]');
        addVariant('radix-side-bottom', '&[data-side="bottom"]');
      }
    ),
    // Keep the addVariablesForColors reference
    addVariablesForColors,
    function ({
      matchUtilities,
      theme,
    }: {
      matchUtilities: (
        utilities: Record<string, (value: string) => Record<string, unknown>>,
        options: { values: Record<string, string>; type: string }
      ) => void;
      theme: (path: string) => Record<string, unknown>;
    }) {
      matchUtilities(
        {
          'bg-grid': (value: string) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
          'bg-grid-small': (value: string) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
          'bg-dot': (value: string) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`
            )}")`,
          }),
          // Re-adding the bg-dot-thick utility which was in the original
          'bg-dot-thick': (value: string) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="2.5"></circle></svg>`
            )}")`,
          }),
        },
        { values: flattenColorPalette(theme('borderColor')), type: 'color' }
      );
    },
  ],
} satisfies Config;

function addVariablesForColors({
  addBase,
  theme,
}: {
  addBase: (base: Record<string, unknown>) => void;
  theme: (path: string) => Record<string, string>;
}) {
  const allColors = flattenColorPalette(theme('colors'));
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ':root': newVars,
  });
}

export default config;
