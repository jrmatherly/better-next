'use client';

import { ChevronRight, LayoutDashboard } from 'lucide-react';
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
  /** The section this breadcrumb is used in ('admin' or 'dashboard') */
  section: 'admin' | 'dashboard';
}

/**
 * Map of path segments to display names
 * This is used to override the default display text for specific segments
 */
const SEGMENT_DISPLAY_MAP: Record<string, string> = {
  'api-keys': 'API Keys',
  'endpoint-technology': 'Endpoint Technology',
  'field-technology': 'Field Technology',
  'collaboration-services': 'Collaboration Services',
  'workload-hosting': 'Workload Hosting',
  vmware: 'VMware',
  documentation: 'Documentation',
  dashboard: 'Dashboard',
  requests: 'Requests',
  resources: 'Resources',
  insights: 'Insights',
  files: 'Files',
  profile: 'Profile',
  settings: 'Settings',
  teams: 'Teams',
  user: 'User',
};

/**
 * List of team section paths that should be preceded by a "Teams" breadcrumb
 */
const TEAM_SECTIONS = [
  'collaboration-services',
  'field-technology',
  'endpoint-technology',
  'workload-hosting',
];

/**
 * List of segments that should be displayed but not linked
 * These segments don't have corresponding pages and would result in 404 errors
 */
const NON_NAVIGABLE_SEGMENTS = ['user', 'settings', 'admin', 'teams'];

/**
 * Map of path patterns that should not be navigable
 * Each entry is a parent path followed by an array of child segments that should not be navigable
 * Example: { 'user': ['settings'] } means /user/settings should not be a link
 */
const NON_NAVIGABLE_PATHS: Record<string, string[]> = {
  user: ['settings'],
};

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
    pathSegments[0] === 'admin' || pathSegments[0] === 'dashboard'
      ? pathSegments[0]
      : section;

  // Format displayed text for each segment
  const formatSegmentText = (segment: string): string => {
    // Check if we have a custom display name for this segment
    if (SEGMENT_DISPLAY_MAP[segment]) {
      return SEGMENT_DISPLAY_MAP[segment];
    }

    // Special case for teams section - remove parentheses
    if (segment.startsWith('(') && segment.endsWith(')')) {
      const cleanSegment = segment.substring(1, segment.length - 1);
      return (
        SEGMENT_DISPLAY_MAP[cleanSegment] || formatSegmentText(cleanSegment)
      );
    }

    // Default formatting: capitalize each word and replace hyphens with spaces
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Map segment to its appropriate href, handling special cases
  const getSegmentHref = (segments: string[], index: number): string => {
    const segment = segments[index];

    // Ensure segment is defined
    if (!segment) {
      return '/';
    }

    // Special case for teams section
    if (segment.startsWith('(') && segment.endsWith(')')) {
      // Teams routes are directly under the root
      return `/${segments.slice(0, index + 1).join('/')}`;
    }

    return `/${segments.slice(0, index + 1).join('/')}`;
  };

  // Check if a segment should be navigable or not
  const isSegmentNavigable = (
    segment: string,
    parentSegment: string | null
  ): boolean => {
    // First check if this segment itself is in the non-navigable list
    if (NON_NAVIGABLE_SEGMENTS.includes(segment.toLowerCase())) {
      return false;
    }

    // Then check if this segment is a child of a non-navigable parent path
    if (
      parentSegment &&
      NON_NAVIGABLE_PATHS[parentSegment] &&
      NON_NAVIGABLE_PATHS[parentSegment].includes(segment)
    ) {
      return false;
    }

    return true;
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home link - always points to the section root */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            {/* <Link href="/"> */}
            <Link
              href={
                currentSection === 'admin' ? '/admin/dashboard' : '/dashboard'
              }
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="sr-only">
                {currentSection === 'admin' ? 'Admin' : 'Dashboard'} Home
              </span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>

        {/* First add the section if applicable */}
        {currentSection === 'admin' &&
          pathname !== '/admin' &&
          pathname !== '/admin/dashboard' && (
            <>
              <BreadcrumbItem>
                <BreadcrumbPage>Admin</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            </>
          )}

        {/* Special case for Teams section */}
        {pathSegments[0] && TEAM_SECTIONS.includes(pathSegments[0]) && (
          <>
            <BreadcrumbItem>
              <BreadcrumbPage>Teams</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
          </>
        )}

        {pathSegments.map((segment, index) => {
          // Skip the first segment (admin or dashboard) as we've already handled it
          if (index === 0 && (segment === 'admin' || segment === 'dashboard')) {
            return null;
          }

          // Skip the teams segments we've already handled specially
          if (index === 0 && TEAM_SECTIONS.includes(segment)) {
            return null;
          }

          // Build the link for this segment
          const segmentPath = getSegmentHref(pathSegments, index);
          const isLastSegment = index === pathSegments.length - 1;
          const displayText = formatSegmentText(segment);
          const parentSegment = index > 0 ? pathSegments[index - 1] : null;
          const canNavigate = isSegmentNavigable(
            segment,
            parentSegment ?? null
          );

          return (
            <React.Fragment key={segmentPath}>
              {isLastSegment ? (
                <BreadcrumbItem>
                  <BreadcrumbPage>{displayText}</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <>
                  <BreadcrumbItem>
                    {canNavigate ? (
                      <BreadcrumbLink asChild>
                        <Link href={segmentPath}>{displayText}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{displayText}</BreadcrumbPage>
                    )}
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
