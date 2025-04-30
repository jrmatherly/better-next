# ITSApp - Frontend

![Screenshot](src/app/(public)/(home)/_components/hero-dark.jpg)

## Features

- 💫 Modern UI/UX : Responsive Landing & Dashboard Page
- 💯️ Fully Type-safe : Typescript, Zod
- 🔐 Authentication : Email & Password, more soon...
- 📊 Analytics : Event trigger, Page view
- 🙎🏼‍♂️ Admin Role: ⏳ coming-soon
- 💸 Payment : ⏳ coming-soon

## Tech Stack

- Framework : [Next.js 15](https://github.com/vercel/next.js)
- Database : [PostgreSQL](https://github.com/postgres/postgres) using Docker
- ORM : [Prisma ORM](https://github.com/prisma/prisma)
- Forms : [React Hook Form](https://github.com/react-hook-form/react-hook-form)
- Styling : [TailwindCSS](https://github.com/tailwindlabs/tailwindcss), [Shadcn/UI](https://github.com/shadcn-ui/ui), [ReactIcons](https://github.com/react-icons/react-icons)
- Dev Tools : [T3-Env](https://github.com/t3-oss/t3-env), [Prettier](https://github.com/prettier/prettier)
- Validation : [Zod](https://github.com/colinhacks/zod)
- Authentication : [Better-auth](https://github.com/better-auth/better-auth)
- Analytics : [Umami](https://github.com/umami-software/umami)
- Email : ⏳ coming-soon

## How to Get Started

Clone your own repository down to your computer and start working on it.

## Prerequisites

This project uses Docker Compose to run a postgres database, so you will need to have Docker installed, or modify the project to point to a hosted database solution.

## How to Run

```bash
cp .env.example .env
npm i
npx @better-auth/cli generate --config src/lib/auth/server.ts
npm run db:generate
npm run db:migrate
npm run dev
```

## Roadmap

- [x] Credentials Authentication
- [x] Protected Routes
- [x] Dark/Light Mode
- [x] Landing Page
- [x] User Dashboard
- [x] Update Profile
- [x] Analytics
- [x] OAuth (Microsoft)
- [x] Admin
- [x] Admin Dashboard
