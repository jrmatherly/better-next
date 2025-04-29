import Footer from '@/components/layout/shared/footer';
import Header from '@/components/layout/shared/header';

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-grow px-2 md:px-5">
        {children}
      </main>
      <Footer />
    </div>
  );
}
