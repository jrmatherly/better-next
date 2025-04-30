import Logo from '@/components/logo';
import { APP_NAME } from '@/lib/settings';
import { FaInstagram, FaSquareGithub, FaXTwitter } from 'react-icons/fa6';

const socialIcons = [
  { icon: FaXTwitter, href: 'https://x.com/jrmatherly', ariaLabel: 'Twitter' },
  {
    icon: FaInstagram,
    href: 'https://instagram.com/jrmatherly',
    ariaLabel: 'Instagram',
  },
  {
    icon: FaSquareGithub,
    href: 'https://github.com/jrmatherly',
    ariaLabel: 'Github',
  },
];

const footerData = [
  {
    title: 'Services',
    links: [
      { name: 'Web Development', href: '#web-development' },
      { name: 'Mobile Applications', href: '#mobile-applications' },
      { name: 'UI/UX Design', href: '#ui-ux-design' },
      { name: 'Cloud Services', href: '#cloud-services' },
      { name: 'SEO Optimization', href: '#seo-optimization' },
    ],
  },
  {
    title: 'About',
    links: [
      { name: 'Our Story', href: '#our-story' },
      { name: 'Leadership', href: '#leadership' },
      { name: 'Partners', href: '#partners' },
      { name: 'Newsroom', href: '#newsroom' },
    ],
  },
  {
    title: 'Support',
    links: [
      { name: 'Help Center', href: '#help-center' },
      { name: 'FAQs', href: '#faqs' },
      { name: 'Contact Support', href: '#contact-support' },
      { name: 'Status Page', href: '#status-page' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '#privacy-policy' },
      { name: 'Terms of Use', href: '#terms-of-use' },
      { name: 'Cookie Policy', href: '#cookie-policy' },
      { name: 'Compliance', href: '#compliance' },
    ],
  },
];

export default function Footer() {
  return (
    <footer>
      <div className="relative mx-auto mt-10 max-w-6xl px-2 md:px-5">
        <div className="grid grid-cols-2 justify-between gap-12 py-8 sm:grid-rows-[auto_auto] md:grid-cols-4 md:grid-rows-[auto_auto] md:py-12 lg:grid-cols-[repeat(4,minmax(0,140px))_1fr] lg:grid-rows-1 xl:gap-20">
          {footerData.map(block => (
            <div key={block.title} className="space-y-2">
              <h3 className="text-sm font-bold">{block.title}</h3>
              <ul className="space-y-2 text-sm">
                {block.links.map(link => (
                  <li key={link.name}>
                    <a
                      className="text-secondary-foreground transition hover:text-primary"
                      href={link.href}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {/* 5th block */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 lg:text-right">
            <div className="mb-3">
              <Logo />
            </div>
            <div className="text-sm">
              <p className="mb-3 text-secondary-foreground">
                &copy; {APP_NAME}
                <span> · </span>
                <a
                  className="text-primary transition hover:text-primary/80"
                  href="https://matherly.net"
                >
                  Matherly.net
                </a>
              </p>
              <ul className="inline-flex gap-4">
                {socialIcons.map(social => (
                  <li key={social.ariaLabel}>
                    <a
                      className="flex items-center justify-center text-primary transition hover:text-primary/80"
                      href={social.href}
                      aria-label={social.ariaLabel}
                    >
                      <social.icon className="h-4 w-4 fill-current" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
