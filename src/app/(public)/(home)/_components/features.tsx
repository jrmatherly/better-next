import { FaUserLock } from 'react-icons/fa6';
import { RiNextjsFill } from 'react-icons/ri';
import {
  SiActix,
  SiBiome,
  SiDarkreader,
  SiDrizzle,
  SiReact,
  SiShadcnui,
  SiTailwindcss,
  SiTypescript,
  SiZod,
} from 'react-icons/si';
import { TbDeviceDesktopAnalytics } from 'react-icons/tb';

const techList = [
  { icon: RiNextjsFill, label: 'Next.js 15 App Router' },
  { icon: SiReact, label: 'React Hook Form' },
  { icon: SiBiome, label: 'Biome' },
  { icon: SiTypescript, label: 'Typescript' },
  { icon: SiTailwindcss, label: 'Tailwind CSS' },
  { icon: SiShadcnui, label: 'Shadcn UI Components' },
  { icon: SiDarkreader, label: 'Light / Dark Mode' },
  { icon: FaUserLock, label: 'Credentials Authentication' },
  { icon: SiDrizzle, label: 'Drizzle ORM' },
  { icon: SiZod, label: 'Zod Validation' },
  { icon: TbDeviceDesktopAnalytics, label: 'Analytics using Umami' },
  { icon: SiActix, label: 'And more!' },
];

export default function Features() {
  return (
    <section id="features" className="container mx-auto space-y-4">
      <h2 className="mx-auto max-w-6xl text-center text-4xl font-medium">
        So what&apos;s included in this starter kit?
      </h2>

      <p className="mx-auto max-w-4xl text-center text-lg leading-tight">
        This code starter kit includes the frameworks, libraries, and tech I use
        most and believe in to be a great choice in regards to performance, ease
        of development, and customizability.
      </p>

      <ul className="grid grid-cols-2 gap-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {techList.map(tech => (
          <li
            key={tech.label}
            className="flex flex-col items-center justify-center gap-4 rounded-xl bg-accent p-4 text-center leading-tight shadow shadow-primary drop-shadow-xl transition hover:scale-105"
          >
            <tech.icon className="h-10 w-10 text-primary" /> {tech.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
