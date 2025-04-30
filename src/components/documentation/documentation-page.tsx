'use client';

import { DocumentCategories } from '@/components/documentation/document-categories';
import { DocumentDetails } from '@/components/documentation/document-details';
import { DocumentForm } from '@/components/documentation/document-form';
import { DocumentList } from '@/components/documentation/document-list';
import { DocumentSearchFilters } from '@/components/documentation/document-search-filters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { type Document } from '@/types/documentation';
import { format } from 'date-fns';
import {
  CalendarClock,
  Eye,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Tag,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';

/**
 * Document categories with counts, icons and metadata
 */
const documentCategoriesData = [
  {
    id: 'guides',
    name: 'Guides',
    count: 5,
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: 'api',
    name: 'API Reference',
    count: 3,
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: 'tutorials',
    name: 'Tutorials',
    count: 2,
    icon: <Pencil className="h-4 w-4" />,
  },
  {
    id: 'policies',
    name: 'Policies',
    count: 2,
    icon: <FileText className="h-4 w-4" />,
  },
];

export const initialDocuments: Document[] = [
  {
    id: 'doc-001',
    title: 'Infrastructure Provisioning Guide',
    description:
      'Comprehensive guide on provisioning new infrastructure in the enterprise environment.',
    content: `# Infrastructure Provisioning Guide

## Introduction
This guide provides step-by-step instructions for provisioning new infrastructure in our enterprise environment. It covers VM creation, storage allocation, networking configuration, and security best practices.

## Prerequisites
- Administrative access to VMware environment
- Network access requirements documented
- Approved resource request from management

## Provisioning Steps

### 1. Planning
Before provisioning any infrastructure, ensure you have:
- Capacity requirements documented
- Security classification identified
- Backup requirements established
- Network requirements outlined

### 2. VM Provisioning
Follow these steps to provision a new VM:
1. Log into VMware ICP
2. Navigate to VMware > Virtual Machines
3. Click "New VM" button
4. Complete the configuration wizard
5. Assign to appropriate resource pool
6. Enable monitoring

### 3. Storage Configuration
Follow best practices for storage configuration:
- Use thin provisioning where appropriate
- Configure storage tiering based on performance needs
- Implement backup schedules according to data classification

### 4. Network Configuration
Security best practices for networking:
- Place VMs in appropriate network segments
- Configure firewall rules following least-privilege principle
- Document all open ports and services
- Configure monitoring for unusual traffic patterns

## Post-Provisioning Checklist
- Verify resource allocation
- Confirm monitoring is active
- Validate backup configuration
- Document new resources in CMDB
- Update security baseline documentation

## Troubleshooting
Common issues and their solutions:
- Provisioning failures: Check resource constraints
- Network connectivity issues: Verify firewall and security group settings
- Performance concerns: Review resource allocation and contention

## Additional Resources
- [Link to Resource Request Form]
- [Link to Security Baseline Documentation]
- [Link to Network Diagram]
    `,
    category: 'guides',
    tags: ['infrastructure', 'provisioning', 'vmware', 'best-practices'],
    authorId: 'user-001',
    createdAt: new Date('2025-02-15T14:30:00'),
    updatedAt: new Date('2025-03-10T09:15:00'),
    status: 'published',
    attachments: [
      {
        id: 'att-001',
        name: 'provisioning_checklist.pdf',
        size: 1240000,
        type: 'application/pdf',
        url: '#',
      },
      {
        id: 'att-002',
        name: 'network_diagram.png',
        size: 850000,
        type: 'image/png',
        url: '#',
      },
    ],
  },
  // ... rest of the documents ...
];

export function DocumentationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [isEditingDocument, setIsEditingDocument] = useState(false);

  // Filter documents based on category and search query
  const filteredDocuments = documents.filter(document => {
    const matchesCategory =
      !selectedCategory || document.category === selectedCategory;
    const matchesTag =
      !selectedTag || document.tags.includes(selectedTag || '');
    const matchesSearch =
      !searchQuery ||
      document.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.tags.some(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesCategory && matchesTag && matchesSearch;
  });

  // Get all unique tags from documents
  const allTags = [...new Set(documents.flatMap(doc => doc.tags))].sort();

  // Handle adding a new document
  const handleCreateDocument = (document: Partial<Document>) => {
    const newDocument: Document = {
      id: `doc-${(documents.length + 1).toString().padStart(3, '0')}`,
      title: document.title || 'Untitled Document',
      description: document.description || '',
      content: document.content || '',
      category: document.category || 'guides',
      tags: document.tags || [],
      authorId: user?.id || 'unknown',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: document.status || 'draft',
      attachments: document.attachments || [],
    };

    setDocuments([...documents, newDocument]);
    setIsCreatingDocument(false);

    toast({
      title: 'Document created',
      description: `${newDocument.title} has been created successfully.`,
    });
  };

  // Handle updating a document
  const handleUpdateDocument = (updatedDocument: Document) => {
    setDocuments(
      documents.map(doc =>
        doc.id === updatedDocument.id
          ? { ...updatedDocument, updatedAt: new Date() }
          : doc
      )
    );
    setSelectedDocument(null);
    setIsEditingDocument(false);

    toast({
      title: 'Document updated',
      description: `${updatedDocument.title} has been updated successfully.`,
    });
  };

  // Handle deleting a document
  const handleDeleteDocument = (document: Document) => {
    if (!document) return;

    setDocuments(documents.filter(doc => doc.id !== document.id));
    setSelectedDocument(null);

    toast({
      title: 'Document deleted',
      description: `${document.title} has been deleted.`,
      variant: 'destructive',
    });
  };

  // Handle viewing a document
  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedTag(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documentation</h1>
          <p className="text-muted-foreground">
            Access and manage enterprise knowledge base and documentation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreatingDocument(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Document
          </Button>
          <Button variant="outline" size="icon" title="Refresh Documents">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documentation..."
              className="pl-8"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DocumentSearchFilters
            categories={documentCategoriesData}
            tags={allTags}
            selectedCategory={selectedCategory}
            selectedTag={selectedTag}
            onSelectCategoryAction={(category: string | null) =>
              setSelectedCategory(category)
            }
            onSelectTagAction={(tag: string | null) => setSelectedTag(tag)}
            onClearFiltersAction={() => {
              setSelectedCategory(null);
              setSelectedTag(null);
            }}
          />
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-1 md:grid-cols-4 mb-4">
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="recent">Recently Updated</TabsTrigger>
          <TabsTrigger value="my-docs">My Documents</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <DocumentList
              documents={filteredDocuments}
              onViewAction={handleViewDocument}
              onEditAction={() => {
                if (selectedDocument) setIsEditingDocument(true);
              }}
              onDeleteAction={handleDeleteDocument}
              searchQuery={searchQuery || undefined}
              selectedCategory={selectedCategory || undefined}
              selectedTag={selectedTag || undefined}
              resetFilters={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setSelectedTag(null);
              }}
            />
          </div>

          <div className="space-y-6">
            <DocumentCategories
              categories={documentCategoriesData}
              selectedCategory={selectedCategory}
              onSelectCategoryAction={(category: string | null) =>
                setSelectedCategory(category)
              }
            />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 15).map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedTag(selectedTag === tag ? null : tag)
                      }
                    >
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {documents
                  .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                  .slice(0, 5)
                  .map(doc => (
                    <button
                      type="button"
                      key={doc.id}
                      className="flex items-start gap-2 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded-md w-full text-left"
                      onClick={() => handleViewDocument(doc)}
                      aria-label={`View document: ${doc.title}`}
                    >
                      <div className="mt-0.5">
                        {doc.status === 'published' ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : doc.status === 'draft' ? (
                          <Pencil className="h-4 w-4 text-amber-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1">{doc.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <CalendarClock className="inline h-3 w-3 mr-1" />
                          Updated {format(doc.updatedAt, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </button>
                  ))}
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </Tabs>

      {/* Document Details View */}
      {selectedDocument && !isEditingDocument && (
        <DocumentDetails
          document={selectedDocument}
          onCloseAction={() => setSelectedDocument(null)}
          onEditAction={() => setIsEditingDocument(true)}
          onDeleteAction={handleDeleteDocument}
        />
      )}

      {/* Document Creation Form */}
      {isCreatingDocument && (
        <DocumentForm
          onSubmitAction={handleCreateDocument}
          onCancelAction={() => setIsCreatingDocument(false)}
          categories={documentCategoriesData}
        />
      )}

      {/* Document Edit Form */}
      {selectedDocument && isEditingDocument && (
        <DocumentForm
          document={selectedDocument}
          onSubmitAction={updatedDoc => {
            // Convert Partial<Document> to Document by merging with existing document
            const completeDoc: Document = {
              ...selectedDocument,
              ...updatedDoc,
              updatedAt: new Date(),
            };
            handleUpdateDocument(completeDoc);
          }}
          onCancelAction={() => {
            setIsEditingDocument(false);
            setSelectedDocument(selectedDocument); // Revert back to view mode
          }}
          categories={documentCategoriesData}
        />
      )}
    </div>
  );
}
