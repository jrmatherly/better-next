import Link from 'next/link';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React from 'react';

const Logo = () => {
  return (
    <Link href="/" className="text-2xl font-bold text-primary">
      Better Next
    </Link>
  );
};

export default Logo;
