'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbsProps {
  /** The section this breadcrumb is used in ('admin' or 'user') */
  section: 'admin' | 'user';
}

/**
 * Shared breadcrumb component that generates breadcrumbs based on the current path
 * and section context (admin or user)
 */
export default function SharedBreadcrumb({ section }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Skip rendering for root paths
  if (pathname === '/' || pathname === `/${section}`) {
    return null;
  }

  // Create breadcrumb segments from the path
  const pathSegments = pathname.split('/').filter(Boolean);

  // Get the current section from the path
  const currentSection =
    pathSegments[0] === 'admin' || pathSegments[0] === 'user'
      ? pathSegments[0]
      : section;

  // Format displayed text for each segment
  const formatSegmentText = (segment: string) => {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home link - always points to the section root */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">
              {/* <Link href={currentSection === 'admin' ? '/admin/dashboard' : '/'}> */}
              <Home className="h-4 w-4" />
              <span className="sr-only">
                {currentSection === 'admin' ? 'Admin' : 'User'} Home
              </span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>

        {/* First add the section if applicable */}
        {currentSection === 'admin' && pathname !== '/admin' && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/dashboard">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
          </>
        )}

        {pathSegments.map((segment, index) => {
          // Skip the first segment (admin or user) as we've already handled it
          if (index === 0 && (segment === 'admin' || segment === 'user')) {
            return null;
          }

          // Build the link for this segment
          const segmentPath = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLastSegment = index === pathSegments.length - 1;
          const displayText = formatSegmentText(segment);

          return (
            <React.Fragment key={segmentPath}>
              {isLastSegment ? (
                <BreadcrumbItem>
                  <BreadcrumbPage>{displayText}</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={segmentPath}>{displayText}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                </>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
