import { ReactNode } from 'react';

export interface ResourceCategory {
  id: string;
  name: string;
  icon: ReactNode;
}

export interface ResourceSpecs {
  [key: string]: string | number;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  category: string;
  status: string;
  allocation: number;
  location: string;
  lastUpdated: Date;
  specs: ResourceSpecs;
  tags: string[];
  owner: string;
  description: string;
}

/**
 * Resource types
 */
export type ResourceType =
  | 'virtual-machine'
  | 'database'
  | 'storage'
  | 'network';

/**
 * Widget types
 */
export type WidgetType =
  | 'resource-usage'
  | 'active-requests'
  | 'system-health'
  | 'quick-actions'
  | 'documentation'
  | 'team-updates';

/**
 * Resource interface
 */
export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Widget interface
 */
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  data: unknown;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
