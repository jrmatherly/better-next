import type { ReactNode } from 'react';

/**
 * Document interface for documentation system
 * Represents a single document entity in the documentation feature
 */
export interface Document {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  version?: string;
  attachments: {
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
}

/**
 * Props for DocumentForm component
 */
export interface DocumentFormProps {
  document?: Document;
  onSubmitAction: (document: Partial<Document>) => void;
  onCancelAction: () => void;
  categories: {
    id: string;
    name: string;
    count: number;
    icon: ReactNode;
  }[];
}

/**
 * Props for DocumentList component
 */
export interface DocumentListProps {
  documents: Document[];
  onViewAction: (document: Document) => void;
  onEditAction: (document: Document) => void;
  onDeleteAction: (document: Document) => void;
  searchQuery?: string;
  selectedCategory?: string;
  selectedTag?: string;
  resetFilters?: () => void;
}

/**
 * Props for DocumentDetails component
 */
export interface DocumentDetailsProps {
  document: Document;
  onCloseAction: () => void;
  onEditAction: (document: Document) => void;
  onDeleteAction: (document: Document) => void;
}
