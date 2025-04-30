// File Repository Types
export type FileType =
  | 'document'
  | 'image'
  | 'video'
  | 'audio'
  | 'archive'
  | 'code'
  | 'spreadsheet'
  | 'presentation'
  | 'pdf'
  | 'other';
export type FilePermission =
  | 'private'
  | 'team'
  | 'department'
  | 'organization'
  | 'public';

export interface FileComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
}

export interface FileVersion {
  id: string;
  versionNumber: string;
  uploadedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  uploadedAt: Date;
  fileSize: number;
  comment?: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  mimeType: string;
  extension: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  folderId: string | null;
  path: string[];
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  permissions: FilePermission;
  tags: string[];
  starred: boolean;
  description?: string;
  thumbnail?: string;
  url: string;
  versions: FileVersion[];
  comments: FileComment[];
  metadata?: Record<string, string | number | boolean | null>;
  isShared: boolean;
  isLocked: boolean;
  lockedBy?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  parentId: string | null;
  path: string[];
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  permissions: FilePermission;
  color?: string;
  itemCount: number;
  size: number;
  isShared: boolean;
}

/**
 * Breadcrumb item for folder navigation in the file manager UI.
 * @property id - Folder ID (string) or null for root.
 * @property name - Display name for the breadcrumb.
 */
export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export interface FileSearchOptions {
  query: string;
  fileTypes?: FileType[];
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  owner?: string;
  tags?: string[];
  folder?: string;
  permissions?: FilePermission[];
}

export interface FilesSortOptions {
  field: 'name' | 'createdAt' | 'updatedAt' | 'size' | 'type';
  direction: 'asc' | 'desc';
}

export interface FileStorage {
  totalSpace: number;
  usedSpace: number;
  trashSpace: number;
}
