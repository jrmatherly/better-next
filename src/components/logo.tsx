import Link from 'next/link';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React from 'react';

const Logo = () => {
  return (
    <Link href="/" className="text-2xl font-bold text-primary">
      ITSApp
    </Link>
  );
};

export default Logo;
