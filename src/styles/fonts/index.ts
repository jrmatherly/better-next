import { Inter } from 'next/font/google';
import { Fira_Code as FontMono, Inter as FontSans } from 'next/font/google';
import localFont from 'next/font/local';

export const sfPro = localFont({
  src: './SF-Pro-Display-Medium.otf',
  variable: '--font-sf',
});

export const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-mono',
});
