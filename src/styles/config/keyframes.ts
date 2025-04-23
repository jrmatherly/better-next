/**
 * Tailwind CSS Keyframes Configurations
 * 
 * This file contains all keyframe animation definitions
 * Extracted from the main tailwind.config.ts to improve build performance
 * and reduce webpack cache serialization warnings
 */

export const keyframes = {
  // Accordion Down
  "accordion-down": {
    from: { height: "0" },
    to: { height: "var(--radix-accordion-content-height)" },
  },

  // Accordion Up
  "accordion-up": {
    from: { height: "var(--radix-accordion-content-height)" },
    to: { height: "0" },
  },

  // Float
  float: {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-5%)" },
  },

  // Shimmer
  shimmer: {
    "0%": { backgroundPosition: "-1000%" },
    "100%": { backgroundPosition: "1000%" },
  },

  // Spinner
  spinner: {
    to: { transform: "rotate(360deg)" },
  },

  // Blink
  blink: {
    "0%": { opacity: "0.2" },
    "20%": { opacity: "1" },
    "100%": { opacity: "0.2" },
  },

  // Image Glow
  "image-glow": {
    "0%": {
      opacity: "0",
      "animation-timing-function": "cubic-bezier(0.74, 0.25, 0.76, 1)",
    },
    "10%": {
      opacity: "1",
      "animation-timing-function": "cubic-bezier(0.12, 0.01, 0.08, 0.99)",
    },
    "100%": {
      opacity: "0.2",
    },
  },

  // Flip
  flip: {
    to: {
      transform: "rotate(360deg)",
    },
  },

  // Rotate
  rotate: {
    from: {
      transform: "rotate(0)",
    },
    to: {
      transform: "rotate(360deg)",
    },
  },

  // Caret Blink
  "caret-blink": {
    "0%, 70%, 100%": { opacity: "1" },
    "20%, 50%": { opacity: "0" },
  },

  // Loading
  loading: {
    "0%, 100%": { transform: "translateX(0) scale(1)" },
    "50%": { transform: "translateX(0) scale(1.2)" },
  },

  // Border Beam
  "border-beam": {
    "100%": {
      "offset-distance": "100%",
    },
  },

  // Fade Up
  "fade-up": {
    "0%": {
      opacity: "0",
      transform: "translateY(10px)",
    },
    "80%": {
      opacity: "0.6",
    },
    "100%": {
      opacity: "1",
      transform: "translateY(0px)",
    },
  },

  // Fade Down
  "fade-down": {
    "0%": {
      opacity: "0",
      transform: "translateY(-10px)",
    },
    "80%": {
      opacity: "0.6",
    },
    "100%": {
      opacity: "1",
      transform: "translateY(0px)",
    },
  },

  // Slide Up Fade
  "slide-up-fade": {
    "0%": { opacity: "0", transform: "translateY(6px)" },
    "100%": { opacity: "1", transform: "translateY(0)" },
  },

  // Slide Down Fade
  "slide-down-fade": {
    "0%": { opacity: "0", transform: "translateY(-6px)" },
    "100%": { opacity: "1", transform: "translateY(0)" },
  },

  // Spotlight
  spotlight: {
    "0%": {
      opacity: "0",
      transform: "translate(-72%, -62%) scale(0.5)",
    },
    "100%": {
      opacity: "1",
      transform: "translate(-50%,-40%) scale(1)",
    },
  },

  // Shine
  shine: {
    from: { backgroundPosition: "200% 0" },
    to: { backgroundPosition: "-200% 0" },
  },

  // Marquee
  marquee: {
    from: { transform: "translateX(0)" },
    to: { transform: "translateX(calc(-100% - var(--gap)))" },
  },

  // Marquee Vertical
  "marquee-vertical": {
    from: { transform: "translateY(0)" },
    to: { transform: "translateY(calc(-100% - var(--gap)))" },
  },

  // Movement animations
  moveVertical: {
    "0%": {
      transform: "translateY(-100%)",
    },
    "100%": {
      transform: "translateY(100%)",
    },
  },

  moveHorizontal: {
    "0%": {
      transform: "translateX(-50%) translateY(-10%)",
    },
    "50%": {
      transform: "translateX(50%) translateY(10%)",
    },
    "100%": {
      transform: "translateX(-50%) translateY(-10%)",
    },
  },

  moveInCircle: {
    "0%,100%": {
      transform: "translate(0%, 0%)",
    },
    "25%": {
      transform: "translate(100%, 0%)",
    },
    "50%": {
      transform: "translate(100%, 100%)",
    },
    "75%": {
      transform: "translate(0%, 100%)",
    },
  },

  scroll: {
    to: {
      transform: "translate(calc(-50% - 0.5rem))",
    },
  },

  // Meteor animation
  meteor: {
    "0%": {
      transform: "rotate(215deg) translateX(0)",
      opacity: "1",
    },
    "70%": {
      opacity: "1",
    },
    "100%": {
      transform: "rotate(215deg) translateX(-500px)",
      opacity: "0",
    },
  },

  // Rainbow animation
  rainbow: {
    "0%": {
      "background-position": "0%",
    },
    "100%": {
      "background-position": "200%",
    },
  },

  // Animation from globals-tailwindv4.css
  // Hide
  hide: {
    from: { opacity: "1" },
    to: { opacity: "0" },
  },

  // Slide animations for tooltips, popovers, etc.
  slideDownAndFade: {
    from: { opacity: "0", transform: "translateY(-2px)" },
    to: { opacity: "1", transform: "translateY(0)" },
  },

  slideLeftAndFade: {
    from: { opacity: "0", transform: "translateX(2px)" },
    to: { opacity: "1", transform: "translateX(0)" },
  },

  slideUpAndFade: {
    from: { opacity: "0", transform: "translateY(2px)" },
    to: { opacity: "1", transform: "translateY(0)" },
  },

  slideRightAndFade: {
    from: { opacity: "0", transform: "translateX(-2px)" },
    to: { opacity: "1", transform: "translateX(0)" },
  },

  // Accordion animations
  accordionOpen: {
    from: { height: "0" },
    to: { height: "var(--radix-accordion-content-height)" },
  },

  accordionClose: {
    from: { height: "var(--radix-accordion-content-height)" },
    to: { height: "0" },
  },

  // Dialog animations
  dialogOverlayShow: {
    from: { opacity: "0" },
    to: { opacity: "1" },
  },

  dialogContentShow: {
    from: { opacity: "0", transform: "translate(-50%, -48%) scale(0.96)" },
    to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
  },

  // Drawer animations
  drawerSlideLeftAndFade: {
    from: { opacity: "0", transform: "translateX(-100%)" },
    to: { opacity: "1", transform: "translateX(0)" },
  },

  drawerSlideRightAndFade: {
    from: { opacity: "0", transform: "translateX(100%)" },
    to: { opacity: "1", transform: "translateX(0)" },
  },

  // Dashes animation
  dashes: {
    to: { "stroke-dashoffset": "-10" },
  },

  // Grid moving line
  gridMovingLine: {
    "0%": { transform: "translateY(0%)" },
    "100%": { transform: "translateY(100%)" },
  },

  // Logo cloud animation
  "logo-cloud": {
    "0%": { transform: "translateX(0)" },
    "100%": { transform: "translateX(-100%)" },
  },

  // Orbit animation
  orbit: {
    "0%": {
      transform: "rotate(0deg) translateX(var(--radius)) rotate(0deg)",
    },
    "100%": {
      transform: "rotate(360deg) translateX(var(--radius)) rotate(-360deg)",
    },
  },

  // Gradient animation
  gradient: {
    "0%": { "background-position": "0% 50%" },
    "50%": { "background-position": "100% 50%" },
    "100%": { "background-position": "0% 50%" },
  },

  // Button heartbeat animation
  buttonheartbeat: {
    "0%": {
      "box-shadow": "0 0 0 0 rgba(37, 99, 235, 0.8)",
      transform: "scale(1)",
    },
    "70%": {
      "box-shadow": "0 0 0 10px rgba(37, 99, 235, 0)",
      transform: "scale(1.05)",
    },
    "100%": {
      "box-shadow": "0 0 0 0 rgba(37, 99, 235, 0)",
      transform: "scale(1)",
    },
  },

  // Background shine animation
  "background-shine": {
    from: { "background-position": "0 0" },
    to: { "background-position": "-200% 0" },
  },

  // Shiny text animation
  "shiny-text": {
    "0%, 90%, 100%": {
      "background-position": "calc(-100% - var(--shiny-width)) 0",
    },
    "30%, 60%": {
      "background-position": "calc(100% + var(--shiny-width)) 0",
    },
  },

  // Wiggle animation
  wiggle: {
    "0%, 100%": {
      transform: "translateX(0%)",
      transformOrigin: "50% 50%",
    },
    "15%": { transform: "translateX(-4px) rotate(-4deg)" },
    "30%": { transform: "translateX(6px) rotate(4deg)" },
    "45%": { transform: "translateX(-6px) rotate(-2.4deg)" },
    "60%": { transform: "translateX(2px) rotate(1.6deg)" },
    "75%": { transform: "translateX(-1px) rotate(-0.8deg)" },
  },
};
