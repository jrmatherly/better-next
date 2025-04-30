'use client';

import { FileDetails } from '@/components/files/file-details';
import { FileFilters } from '@/components/files/file-filters';
import { FileGrid } from '@/components/files/file-grid';
import { FileList } from '@/components/files/file-list';
import { FileUpload } from '@/components/files/file-upload';
import { FolderCreate } from '@/components/files/folder-create';
import { FolderStructure } from '@/components/files/folder-structure';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';
import type {
  BreadcrumbItem,
  FileItem,
  FileStorage,
  FileType,
  FilesSortOptions,
  Folder,
} from '@/types/files';
import {
  AlignJustify,
  FileText,
  FolderPlus,
  HardDrive,
  LayoutGrid,
  Plus,
  RefreshCw,
  Search,
  Upload,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState, useEffect } from 'react';

// Sample data: File storage quota
const storageQuota: FileStorage = {
  totalSpace: 100 * 1024 * 1024 * 1024, // 100 GB
  usedSpace: 36 * 1024 * 1024 * 1024, // 36 GB
  trashSpace: 2 * 1024 * 1024 * 1024, // 2 GB
};

// Sample data: Folders
const initialFolders: Folder[] = [
  {
    id: 'folder-001',
    name: 'Project Documents',
    createdAt: new Date('2025-01-15T10:30:00'),
    updatedAt: new Date('2025-03-10T14:45:00'),
    parentId: null,
    path: ['Project Documents'],
    owner: {
      id: 'user-001',
      name: 'John Smith',
    },
    permissions: 'organization',
    color: '#4f46e5',
    itemCount: 12,
    size: 256 * 1024 * 1024, // 256 MB
    isShared: true,
  },
  {
    id: 'folder-002',
    name: 'Infrastructure',
    createdAt: new Date('2025-01-20T11:15:00'),
    updatedAt: new Date('2025-03-12T09:30:00'),
    parentId: 'folder-001',
    path: ['Project Documents', 'Infrastructure'],
    owner: {
      id: 'user-001',
      name: 'John Smith',
    },
    permissions: 'team',
    color: '#0ea5e9',
    itemCount: 8,
    size: 120 * 1024 * 1024, // 120 MB
    isShared: true,
  },
  {
    id: 'folder-003',
    name: 'Security',
    createdAt: new Date('2025-02-05T14:20:00'),
    updatedAt: new Date('2025-03-14T16:20:00'),
    parentId: 'folder-001',
    path: ['Project Documents', 'Security'],
    owner: {
      id: 'user-003',
      name: 'Mike Wilson',
    },
    permissions: 'department',
    color: '#f43f5e',
    itemCount: 4,
    size: 136 * 1024 * 1024, // 136 MB
    isShared: true,
  },
  {
    id: 'folder-004',
    name: 'Development',
    createdAt: new Date('2025-02-10T09:45:00'),
    updatedAt: new Date('2025-03-15T11:30:00'),
    parentId: null,
    path: ['Development'],
    owner: {
      id: 'user-002',
      name: 'Emily Johnson',
    },
    permissions: 'team',
    color: '#84cc16',
    itemCount: 15,
    size: 512 * 1024 * 1024, // 512 MB
    isShared: true,
  },
  {
    id: 'folder-005',
    name: 'API Documentation',
    createdAt: new Date('2025-02-15T13:15:00'),
    updatedAt: new Date('2025-03-16T10:45:00'),
    parentId: 'folder-004',
    path: ['Development', 'API Documentation'],
    owner: {
      id: 'user-002',
      name: 'Emily Johnson',
    },
    permissions: 'team',
    color: '#22c55e',
    itemCount: 6,
    size: 78 * 1024 * 1024, // 78 MB
    isShared: true,
  },
  {
    id: 'folder-006',
    name: 'Source Code',
    createdAt: new Date('2025-02-18T16:30:00'),
    updatedAt: new Date('2025-03-17T14:20:00'),
    parentId: 'folder-004',
    path: ['Development', 'Source Code'],
    owner: {
      id: 'user-002',
      name: 'Emily Johnson',
    },
    permissions: 'team',
    color: '#a855f7',
    itemCount: 9,
    size: 434 * 1024 * 1024, // 434 MB
    isShared: true,
  },
  {
    id: 'folder-007',
    name: 'Personal',
    createdAt: new Date('2025-03-01T09:00:00'),
    updatedAt: new Date('2025-03-15T15:30:00'),
    parentId: null,
    path: ['Personal'],
    owner: {
      id: 'user-001',
      name: 'John Smith',
    },
    permissions: 'private',
    color: '#ec4899',
    itemCount: 5,
    size: 128 * 1024 * 1024, // 128 MB
    isShared: false,
  },
];

// Sample data: Files
const initialFiles: FileItem[] = [
  {
    id: 'file-001',
    name: 'Infrastructure Design.docx',
    type: 'document',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: 'docx',
    size: 2.4 * 1024 * 1024, // 2.4 MB
    createdAt: new Date('2025-03-05T10:30:00'),
    updatedAt: new Date('2025-03-15T14:30:00'),
    lastAccessedAt: new Date('2025-03-16T09:15:00'),
    folderId: 'folder-002',
    path: ['Project Documents', 'Infrastructure'],
    owner: {
      id: 'user-001',
      name: 'John Smith',
    },
    permissions: 'team',
    tags: ['infrastructure', 'design', 'documentation'],
    starred: true,
    description:
      'Infrastructure design documentation for the new cloud environment',
    url: '#',
    versions: [
      {
        id: 'version-001',
        versionNumber: '1.0',
        uploadedBy: {
          id: 'user-001',
          name: 'John Smith',
        },
        uploadedAt: new Date('2025-03-05T10:30:00'),
        fileSize: 2.1 * 1024 * 1024, // 2.1 MB
        comment: 'Initial version',
      },
      {
        id: 'version-002',
        versionNumber: '1.1',
        uploadedBy: {
          id: 'user-001',
          name: 'John Smith',
        },
        uploadedAt: new Date('2025-03-15T14:30:00'),
        fileSize: 2.4 * 1024 * 1024, // 2.4 MB
        comment: 'Added network diagram and updated storage specifications',
      },
    ],
    comments: [
      {
        id: 'comment-001',
        userId: 'user-003',
        userName: 'Mike Wilson',
        content: 'Great work on the network design section.',
        timestamp: new Date('2025-03-16T11:45:00'),
      },
    ],
    metadata: {
      pageCount: 24,
      author: 'John Smith',
      company: 'Example Corp',
    },
    isShared: true,
    isLocked: false,
  },
  {
    id: 'file-002',
    name: 'Security Policy.pdf',
    type: 'pdf',
    mimeType: 'application/pdf',
    extension: 'pdf',
    size: 3.8 * 1024 * 1024, // 3.8 MB
    createdAt: new Date('2025-03-10T15:45:00'),
    updatedAt: new Date('2025-03-15T09:30:00'),
    lastAccessedAt: new Date('2025-03-17T10:20:00'),
    folderId: 'folder-003',
    path: ['Project Documents', 'Security'],
    owner: {
      id: 'user-003',
      name: 'Mike Wilson',
    },
    permissions: 'department',
    tags: ['security', 'policy', 'compliance'],
    starred: true,
    description:
      'Official security policy document for infrastructure and applications',
    url: '#',
    versions: [
      {
        id: 'version-003',
        versionNumber: '2.0',
        uploadedBy: {
          id: 'user-003',
          name: 'Mike Wilson',
        },
        uploadedAt: new Date('2025-03-10T15:45:00'),
        fileSize: 3.5 * 1024 * 1024, // 3.5 MB
        comment: 'Updated security policy with new compliance requirements',
      },
      {
        id: 'version-004',
        versionNumber: '2.1',
        uploadedBy: {
          id: 'user-003',
          name: 'Mike Wilson',
        },
        uploadedAt: new Date('2025-03-15T09:30:00'),
        fileSize: 3.8 * 1024 * 1024, // 3.8 MB
        comment: 'Added section on remote access security',
      },
    ],
    comments: [],
    metadata: {
      pageCount: 42,
      author: 'Security Team',
      company: 'Example Corp',
    },
    isShared: true,
    isLocked: false,
  },
  {
    id: 'file-003',
    name: 'Network Diagram.png',
    type: 'image',
    mimeType: 'image/png',
    extension: 'png',
    size: 1.7 * 1024 * 1024, // 1.7 MB
    createdAt: new Date('2025-03-12T11:30:00'),
    updatedAt: new Date('2025-03-12T11:30:00'),
    lastAccessedAt: new Date('2025-03-16T14:15:00'),
    folderId: 'folder-002',
    path: ['Project Documents', 'Infrastructure'],
    owner: {
      id: 'user-001',
      name: 'John Smith',
    },
    permissions: 'team',
    tags: ['network', 'diagram', 'infrastructure'],
    starred: false,
    description: 'Network architecture diagram for the cloud infrastructure',
    thumbnail: 'https://via.placeholder.com/300x200',
    url: '#',
    versions: [
      {
        id: 'version-005',
        versionNumber: '1.0',
        uploadedBy: {
          id: 'user-001',
          name: 'John Smith',
        },
        uploadedAt: new Date('2025-03-12T11:30:00'),
        fileSize: 1.7 * 1024 * 1024, // 1.7 MB
        comment: 'Initial network diagram',
      },
    ],
    comments: [],
    isShared: true,
    isLocked: false,
  },
  {
    id: 'file-004',
    name: 'API Documentation.md',
    type: 'document',
    mimeType: 'text/markdown',
    extension: 'md',
    size: 512 * 1024, // 512 KB
    createdAt: new Date('2025-03-14T09:15:00'),
    updatedAt: new Date('2025-03-16T16:45:00'),
    lastAccessedAt: new Date('2025-03-17T11:30:00'),
    folderId: 'folder-005',
    path: ['Development', 'API Documentation'],
    owner: {
      id: 'user-002',
      name: 'Emily Johnson',
    },
    permissions: 'team',
    tags: ['api', 'documentation', 'development'],
    starred: true,
    description: 'Comprehensive API documentation for developers',
    url: '#',
    versions: [
      {
        id: 'version-006',
        versionNumber: '0.9',
        uploadedBy: {
          id: 'user-002',
          name: 'Emily Johnson',
        },
        uploadedAt: new Date('2025-03-14T09:15:00'),
        fileSize: 450 * 1024, // 450 KB
        comment: 'Initial draft of API documentation',
      },
      {
        id: 'version-007',
        versionNumber: '1.0',
        uploadedBy: {
          id: 'user-002',
          name: 'Emily Johnson',
        },
        uploadedAt: new Date('2025-03-16T16:45:00'),
        fileSize: 512 * 1024, // 512 KB
        comment: 'Completed documentation with authentication endpoints',
      },
    ],
    comments: [
      {
        id: 'comment-002',
        userId: 'user-004',
        userName: 'Sarah Johnson',
        content: 'Could you add examples for the pagination parameters?',
        timestamp: new Date('2025-03-17T11:30:00'),
      },
    ],
    isShared: true,
    isLocked: false,
  },
  {
    id: 'file-005',
    name: 'Budget Report.xlsx',
    type: 'spreadsheet',
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: 'xlsx',
    size: 1.2 * 1024 * 1024, // 1.2 MB
    createdAt: new Date('2025-03-01T13:45:00'),
    updatedAt: new Date('2025-03-10T10:15:00'),
    lastAccessedAt: new Date('2025-03-15T15:30:00'),
    folderId: 'folder-007',
    path: ['Personal'],
    owner: {
      id: 'user-001',
      name: 'John Smith',
    },
    permissions: 'private',
    tags: ['budget', 'finance', 'report'],
    starred: false,
    description: 'Q1 2025 budget report and projections',
    url: '#',
    versions: [
      {
        id: 'version-008',
        versionNumber: '1.0',
        uploadedBy: {
          id: 'user-001',
          name: 'John Smith',
        },
        uploadedAt: new Date('2025-03-01T13:45:00'),
        fileSize: 1.1 * 1024 * 1024, // 1.1 MB
        comment: 'Initial budget report',
      },
      {
        id: 'version-009',
        versionNumber: '1.1',
        uploadedBy: {
          id: 'user-001',
          name: 'John Smith',
        },
        uploadedAt: new Date('2025-03-10T10:15:00'),
        fileSize: 1.2 * 1024 * 1024, // 1.2 MB
        comment: 'Updated with March projections',
      },
    ],
    comments: [],
    metadata: {
      sheets: 5,
      author: 'John Smith',
      company: 'Example Corp',
    },
    isShared: false,
    isLocked: false,
  },
  {
    id: 'file-006',
    name: 'Project Timeline.pptx',
    type: 'presentation',
    mimeType:
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extension: 'pptx',
    size: 5.8 * 1024 * 1024, // 5.8 MB
    createdAt: new Date('2025-02-28T09:30:00'),
    updatedAt: new Date('2025-03-14T11:45:00'),
    lastAccessedAt: new Date('2025-03-16T16:20:00'),
    folderId: 'folder-001',
    path: ['Project Documents'],
    owner: {
      id: 'user-001',
      name: 'John Smith',
    },
    permissions: 'organization',
    tags: ['presentation', 'timeline', 'project'],
    starred: true,
    description: 'Project timeline and milestones for stakeholder presentation',
    url: '#',
    versions: [
      {
        id: 'version-010',
        versionNumber: '1.0',
        uploadedBy: {
          id: 'user-001',
          name: 'John Smith',
        },
        uploadedAt: new Date('2025-02-28T09:30:00'),
        fileSize: 4.5 * 1024 * 1024, // 4.5 MB
        comment: 'Initial timeline presentation',
      },
      {
        id: 'version-011',
        versionNumber: '1.1',
        uploadedBy: {
          id: 'user-001',
          name: 'John Smith',
        },
        uploadedAt: new Date('2025-03-14T11:45:00'),
        fileSize: 5.8 * 1024 * 1024, // 5.8 MB
        comment: 'Updated with new milestones and executive feedback',
      },
    ],
    comments: [],
    metadata: {
      slides: 24,
      author: 'John Smith',
      company: 'Example Corp',
    },
    isShared: true,
    isLocked: false,
  },
  {
    id: 'file-007',
    name: 'requirements.txt',
    type: 'code',
    mimeType: 'text/plain',
    extension: 'txt',
    size: 4.2 * 1024, // 4.2 KB
    createdAt: new Date('2025-03-15T08:30:00'),
    updatedAt: new Date('2025-03-16T14:15:00'),
    lastAccessedAt: new Date('2025-03-17T09:45:00'),
    folderId: 'folder-006',
    path: ['Development', 'Source Code'],
    owner: {
      id: 'user-002',
      name: 'Emily Johnson',
    },
    permissions: 'team',
    tags: ['code', 'python', 'requirements'],
    starred: false,
    description: 'Python dependencies for the project',
    url: '#',
    versions: [
      {
        id: 'version-012',
        versionNumber: '1.0',
        uploadedBy: {
          id: 'user-002',
          name: 'Emily Johnson',
        },
        uploadedAt: new Date('2025-03-15T08:30:00'),
        fileSize: 3.8 * 1024, // 3.8 KB
        comment: 'Initial requirements file',
      },
      {
        id: 'version-013',
        versionNumber: '1.1',
        uploadedBy: {
          id: 'user-002',
          name: 'Emily Johnson',
        },
        uploadedAt: new Date('2025-03-16T14:15:00'),
        fileSize: 4.2 * 1024, // 4.2 KB
        comment: 'Added new dependencies for authentication',
      },
    ],
    comments: [],
    isShared: true,
    isLocked: true,
    lockedBy: {
      id: 'user-002',
      name: 'Emily Johnson',
    },
  },
  {
    id: 'file-008',
    name: 'Training Video.mp4',
    type: 'video',
    mimeType: 'video/mp4',
    extension: 'mp4',
    size: 250 * 1024 * 1024, // 250 MB
    createdAt: new Date('2025-03-08T13:00:00'),
    updatedAt: new Date('2025-03-08T13:00:00'),
    lastAccessedAt: new Date('2025-03-15T10:30:00'),
    folderId: 'folder-001',
    path: ['Project Documents'],
    owner: {
      id: 'user-004',
      name: 'Sarah Johnson',
    },
    permissions: 'organization',
    tags: ['training', 'video', 'onboarding'],
    starred: false,
    description: 'Training video for the new system',
    thumbnail: 'https://via.placeholder.com/300x200',
    url: '#',
    versions: [
      {
        id: 'version-014',
        versionNumber: '1.0',
        uploadedBy: {
          id: 'user-004',
          name: 'Sarah Johnson',
        },
        uploadedAt: new Date('2025-03-08T13:00:00'),
        fileSize: 250 * 1024 * 1024, // 250 MB
        comment: 'Training video for new employees',
      },
    ],
    comments: [],
    metadata: {
      duration: '45:12',
      resolution: '1080p',
      codec: 'H.264',
    },
    isShared: true,
    isLocked: false,
  },
];

export function FilesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState<'list' | 'grid'>('list');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<FilesSortOptions>({
    field: 'name',
    direction: 'asc',
  });
  const [fileTypeFilter, setFileTypeFilter] = useState<FileType | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [storage] = useState<FileStorage>(storageQuota);
  const [isLoading, setIsLoading] = useState(false);

  // Update breadcrumbs when navigating to a folder
  useEffect(() => {
    if (currentFolderId === null) {
      setBreadcrumbs([{ id: null, name: 'Home' }]);
    } else {
      const folder = folders.find(f => f.id === currentFolderId);
      if (folder) {
        const pathItems: BreadcrumbItem[] = [{ id: null, name: 'Home' }];
        for (let i = 0; i < folder.path.length; i++) {
          const parentId =
            i === 0
              ? null
              : (folders.find(
                  f => f.path.length === i && f.name === folder.path[i - 1]
                )?.id ?? null);
          const id = folders.find(
            f => f.path.length === i + 1 && f.name === folder.path[i]
          )?.id;
          pathItems.push({
            id: id ?? null,
            name: folder.path[i] ?? '',
          });
        }
        setBreadcrumbs(pathItems);
      }
    }
  }, [currentFolderId, folders]);

  // Filter and sort files and folders based on current state
  const filteredFolders = folders.filter(
    folder =>
      folder.parentId === currentFolderId &&
      (!searchQuery ||
        folder.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredFiles = files
    .filter(
      file =>
        file.folderId === currentFolderId &&
        (!searchQuery ||
          file.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (!fileTypeFilter || file.type === fileTypeFilter)
    )
    .sort((a, b) => {
      const modifier = sortOption.direction === 'asc' ? 1 : -1;
      switch (sortOption.field) {
        case 'name':
          return a.name.localeCompare(b.name) * modifier;
        case 'createdAt':
          return (a.createdAt.getTime() - b.createdAt.getTime()) * modifier;
        case 'updatedAt':
          return (a.updatedAt.getTime() - b.updatedAt.getTime()) * modifier;
        case 'size':
          return (a.size - b.size) * modifier;
        case 'type':
          return a.type.localeCompare(b.type) * modifier;
        default:
          return 0;
      }
    });

  // Handle file upload
  const handleFileUpload = (newFile: FileItem) => {
    setFiles([newFile, ...files]);
    setIsUploading(false);

    toast({
      title: 'File uploaded',
      description: `${newFile.name} has been uploaded successfully.`,
    });
  };

  // Handle creating a folder
  const handleCreateFolder = (folderData: Partial<Folder>) => {
    const newFolder: Folder = {
      id: `folder-${Date.now().toString(36)}`,
      name: folderData.name || 'New Folder',
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId: currentFolderId,
      path:
        folderData.path ||
        (currentFolderId
          ? [
              ...(folders.find(f => f.id === currentFolderId)?.path || []),
              folderData.name || 'New Folder',
            ]
          : [folderData.name || 'New Folder']),
      owner: {
        id: user?.id || '',
        name: user?.name || '',
      },
      permissions: folderData.permissions || 'private',
      color: folderData.color,
      itemCount: 0,
      size: 0,
      isShared: folderData.permissions !== 'private',
    };

    setFolders([...folders, newFolder]);
    setIsCreatingFolder(false);

    toast({
      title: 'Folder created',
      description: `${newFolder.name} has been created.`,
    });
  };

  // Handle navigating to a folder
  const handleNavigateToFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    setSelectedFileId(null);
  };

  // Handle deleting a file
  const handleDeleteFile = (fileId: string) => {
    const fileToDelete = files.find(f => f.id === fileId);
    if (!fileToDelete) return;

    setFiles(files.filter(f => f.id !== fileId));
    setSelectedFileId(null);

    toast({
      title: 'File deleted',
      description: `${fileToDelete.name} has been moved to trash.`,
    });
  };

  // Handle deleting a folder
  const handleDeleteFolder = (folderId: string) => {
    const folderToDelete = folders.find(f => f.id === folderId);
    if (!folderToDelete) return;

    setFolders(folders.filter(f => f.id !== folderId));

    toast({
      title: 'Folder deleted',
      description: `${folderToDelete.name} has been moved to trash.`,
    });
  };

  // Handle toggling star status
  const handleToggleStar = (fileId: string) => {
    setFiles(
      files.map(file =>
        file.id === fileId ? { ...file, starred: !file.starred } : file
      )
    );
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Files refreshed',
        description: 'Your file repository has been refreshed.',
      });
    }, 1500);
  };

  // Calculate storage usage percentage
  const storageUsagePercentage = Math.round(
    (storage.usedSpace / storage.totalSpace) * 100
  );

  // Format bytes to human-readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFileId(fileId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">File Repository</h1>
          <p className="text-muted-foreground">
            Store, manage, and share files across your organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsUploading(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
          <Button variant="outline" onClick={() => setIsCreatingFolder(true)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search files and folders..."
            className="pl-8"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <FileFilters
            fileTypeFilter={fileTypeFilter}
            onFileTypeFilterChangeAction={setFileTypeFilter}
            onClearFiltersAction={() => setFileTypeFilter(null)}
          />
          <div className="flex border rounded-md">
            <Button
              variant={selectedView === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-none rounded-l-md"
              onClick={() => setSelectedView('list')}
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedView === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="rounded-none rounded-r-md"
              onClick={() => setSelectedView('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-1 md:grid-cols-5 mb-4">
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="starred">Starred</TabsTrigger>
          <TabsTrigger value="shared">Shared with me</TabsTrigger>
          <TabsTrigger value="trash">Trash</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 space-y-4">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center text-sm">
              {breadcrumbs.map((crumb: BreadcrumbItem) => (
                <div key={crumb.id ?? crumb.name} className="flex items-center">
                  {crumb.id != null && (
                    <button
                      type="button"
                      className="text-blue-600 hover:underline focus:outline-none"
                      onClick={() => handleNavigateToFolder(crumb.id)}
                    >
                      {crumb.name}
                    </button>
                  )}
                  {crumb.id == null && <span>{crumb.name}</span>}
                </div>
              ))}
            </div>

            {/* Empty state if no files or folders */}
            {filteredFolders.length === 0 && filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No files found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-2">
                  {searchQuery || fileTypeFilter
                    ? 'No files match your search criteria. Try adjusting your filters or search term.'
                    : currentFolderId
                      ? 'This folder is empty. Upload files or create a new folder to get started.'
                      : 'Your repository is empty. Upload files or create a new folder to get started.'}
                </p>
                <div className="flex gap-2 mt-4">
                  {(searchQuery || fileTypeFilter) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setFileTypeFilter(null);
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                  <Button onClick={() => setIsUploading(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingFolder(true)}
                  >
                    <FolderPlus className="mr-2 h-4 w-4" />
                    New Folder
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFolders.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-muted-foreground">
                        Folders
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => setIsCreatingFolder(true)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        New Folder
                      </Button>
                    </div>
                    <FolderStructure
                      folders={filteredFolders}
                      onNavigateAction={handleNavigateToFolder}
                      onDeleteAction={handleDeleteFolder}
                    />
                  </div>
                )}

                {filteredFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-muted-foreground">
                        Files
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => setIsUploading(true)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Upload File
                      </Button>
                    </div>

                    {selectedView === 'list' ? (
                      <FileList
                        files={filteredFiles}
                        onViewAction={file => handleFileSelect(file.id)}
                        onToggleStarAction={file => handleToggleStar(file.id)}
                        onDeleteAction={file => handleDeleteFile(file.id)}
                        onSortAction={setSortOption}
                        sortOption={sortOption}
                      />
                    ) : (
                      <FileGrid
                        files={filteredFiles}
                        onViewAction={file => handleFileSelect(file.id)}
                        onToggleStarAction={file => handleToggleStar(file.id)}
                        onDeleteAction={file => handleDeleteFile(file.id)}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Storage</h3>
                    <span className="text-sm text-muted-foreground">
                      {storageUsagePercentage}% used
                    </span>
                  </div>

                  <Progress
                    value={storageUsagePercentage}
                    className="h-2"
                    indicatorClassName={
                      storageUsagePercentage > 90
                        ? 'bg-destructive'
                        : storageUsagePercentage > 75
                          ? 'bg-orange-500'
                          : storageUsagePercentage > 50
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                    }
                  />

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatBytes(storage.usedSpace)} used</span>
                    <span>
                      {formatBytes(storage.totalSpace - storage.usedSpace)} free
                    </span>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-xs">Available</span>
                      </div>
                      <span className="text-xs">
                        {formatBytes(storage.totalSpace - storage.usedSpace)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <span className="text-xs">Used</span>
                      </div>
                      <span className="text-xs">
                        {formatBytes(storage.usedSpace - storage.trashSpace)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-destructive" />
                        <span className="text-xs">Trash</span>
                      </div>
                      <span className="text-xs">
                        {formatBytes(storage.trashSpace)}
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    <HardDrive className="mr-2 h-4 w-4" />
                    Manage Storage
                  </Button>
                </div>
              </CardContent>
            </Card>

            <FolderStructure
              title="Quick Access"
              folders={folders.filter(folder => folder.parentId === null)}
              compact
              onNavigateAction={handleNavigateToFolder}
              onDeleteAction={handleDeleteFolder}
            />

            <Card>
              <CardContent className="pt-6 pb-4">
                <h3 className="text-sm font-medium mb-4">Recent Files</h3>
                <div className="space-y-2">
                  {files
                    .sort(
                      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
                    )
                    .slice(0, 5)
                    .map(file => (
                      <button
                        type="button"
                        key={file.id}
                        className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer w-full text-left"
                        onClick={() => handleFileSelect(file.id)}
                        aria-label={`Open ${file.name}`}
                      >
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(file.size)} • Updated{' '}
                            {new Date(file.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>

      {/* File Upload Dialog */}
      {isUploading && (
        <FileUpload
          currentFolderId={currentFolderId}
          onUploadAction={handleFileUpload}
          onCancelAction={() => setIsUploading(false)}
        />
      )}

      {/* Create Folder Dialog */}
      {isCreatingFolder && (
        <FolderCreate
          currentFolderId={currentFolderId}
          onSubmitAction={handleCreateFolder}
          onCancelAction={() => setIsCreatingFolder(false)}
        />
      )}

      {/* File Details Drawer */}
      {selectedFileId && files.some(file => file.id === selectedFileId) && (
        <FileDetails
          file={files.find(file => file.id === selectedFileId) as FileItem}
          onCloseAction={() => setSelectedFileId(null)}
          onDeleteAction={(fileId: string) => handleDeleteFile(fileId)}
          onToggleStarAction={(fileId: string) => handleToggleStar(fileId)}
        />
      )}
    </div>
  );
}
