/**
 * Tailwind CSS Animation Configurations
 *
 * This file contains all animation-related configurations
 * Extracted from the main tailwind.config.ts to improve build performance
 * and reduce webpack cache serialization warnings
 */

export const animations = {
  // Accordion Down
  'accordion-down': 'accordion-down 0.2s ease-out',
  // Accordion Up
  'accordion-up': 'accordion-up 0.2s ease-out',
  // Floating
  float: 'float 6s ease-in-out infinite',
  // Shimmer
  shimmer: 'shimmer 2s linear infinite',
  // Shine Text
  'shiny-text': 'shiny-text 8s infinite',
  // Spin Slow
  'spin-slow': 'spin 3s linear infinite',
  // Wiggle
  wiggle: 'wiggle 0.75s infinite',
  // Spinner
  spinner: 'spinner 1.2s linear infinite',
  // Blink
  blink: 'blink 1.4s infinite both',
  // Image Glow
  'image-glow': 'image-glow 4s ease-out 0.6s forwards',
  // Flip
  flip: 'flip 6s infinite steps(2, end)',
  // Rotate
  rotate: 'rotate 3s linear infinite both',
  // Caret Blink
  'caret-blink': 'caret-blink 1.25s ease-out infinite',
  // Loading
  loading: 'loading 0.5s linear infinite',
  // Border Beam
  'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
  // Fade Up
  'fade-up': 'fade-up 0.5s',
  // Fade Down
  'fade-down': 'fade-down 0.5s',
  // Slide Up Fade
  'slide-up-fade': 'slide-up-fade 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  // Slide Down Fade
  'slide-down-fade': 'slide-down-fade 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  // Spotlight
  spotlight: 'spotlight 2s ease .75s 1 forwards',
  // Shine
  shine: 'shine var(--duration) infinite linear',
  // Marquee
  marquee: 'marquee var(--duration) var(--speed, 2s) infinite linear',
  // Marquee Vertical
  'marquee-vertical':
    'marquee-vertical var(--duration) var(--speed, 2s) linear infinite',
  // Movement animations
  first: 'moveVertical 30s ease infinite',
  second: 'moveInCircle 20s reverse infinite',
  third: 'moveInCircle 40s linear infinite',
  fourth: 'moveHorizontal 40s ease infinite',
  fifth: 'moveInCircle 20s ease infinite',
  scroll:
    'scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite',

  // Additional animations from the original config (globals-tailwindv4.css)
  hide: 'hide 0.3s ease-out',
  slideDownAndFade: 'slideDownAndFade 0.3s ease-out',
  slideLeftAndFade: 'slideLeftAndFade 0.3s ease-out',
  slideUpAndFade: 'slideUpAndFade 0.3s ease-out',
  slideRightAndFade: 'slideRightAndFade 0.3s ease-out',
  accordionOpen: 'accordionOpen 0.3s ease-out',
  accordionClose: 'accordionClose 0.3s ease-out',
  dialogOverlayShow: 'dialogOverlayShow 0.3s ease-out',
  dialogContentShow: 'dialogContentShow 0.3s ease-out',
  drawerSlideLeftAndFade: 'drawerSlideLeftAndFade 0.3s ease-out',
  drawerSlideRightAndFade: 'drawerSlideRightAndFade 0.3s ease-out',
  dashes: 'dashes 1.5s linear infinite',
  gridMovingLine: 'gridMovingLine 1.5s linear infinite',
  'logo-cloud': 'logo-cloud 30s linear infinite',
  orbit: 'orbit calc(var(--duration)*1s) linear infinite',
  gradient: 'gradient 8s linear infinite',
  buttonheartbeat: 'buttonheartbeat 2s infinite ease-in-out',
  'background-shine': 'background-shine 2s linear infinite',
};
