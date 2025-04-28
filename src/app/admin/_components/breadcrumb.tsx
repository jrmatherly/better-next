'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

const BreadcrumbDashboard = () => {
  const pathname = usePathname();
  const router = useRouter();

  const pathSegments = pathname
    .split('/')
    .filter(segment => segment)
    .slice(1);

  const transformSegment = (segment: string) => {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.length > 0 ? (
          pathSegments.map((segment, index) => {
            const href = `/admin/${pathSegments.slice(0, index + 1).join('/')}`;
            const displayText = transformSegment(segment);
            const segmentPath = pathSegments.slice(0, index + 1).join('-');

            return (
              <React.Fragment key={`breadcrumb-${segmentPath}`}>
                {index > 0 && (
                  <BreadcrumbSeparator key={`separator-${segmentPath}`} />
                )}
                <BreadcrumbItem key={`item-${segmentPath}`}>
                  {index !== pathSegments.length - 1 ? (
                    <BreadcrumbLink
                      href={href}
                      onClick={e => {
                        e.preventDefault();
                        router.push(href);
                      }}
                    >
                      {displayText}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{displayText}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })
        ) : (
          <BreadcrumbPage>Dashboard</BreadcrumbPage>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbDashboard;
