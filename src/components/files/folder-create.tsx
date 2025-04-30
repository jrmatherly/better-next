'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/providers/auth-provider';
import type { FilePermission, Folder } from '@/types/files';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building as Building1,
  Building2,
  FolderPlus,
  Lock,
  Users,
} from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Form schema for creating a folder
const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Folder name is required',
  }),
  permissions: z.enum(['private', 'team', 'department', 'organization']),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FolderCreateProps {
  currentFolderId: string | null;
  onSubmitAction: (folderData: Partial<Folder>) => void;
  onCancelAction: () => void;
}

// Sample folder colors to choose from
const folderColors = [
  { name: 'Blue', value: '#4f46e5' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Red', value: '#f43f5e' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#0ea5e9' },
];

export function FolderCreate({
  currentFolderId,
  onSubmitAction,
  onCancelAction,
}: FolderCreateProps) {
  const { user } = useAuth();

  // Form definition
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      permissions: 'private',
      color: '#4f46e5', // Default blue color
    },
  });

  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    onSubmitAction({
      name: values.name,
      permissions: values.permissions as FilePermission,
      color: values.color,
      parentId: currentFolderId,
      // In a real app, would need to derive the path based on the current folder
      path: currentFolderId ? undefined : [values.name],
    });
  };

  return (
    <Dialog open={true} onOpenChange={open => !open && onCancelAction()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Create a new folder to organize your files
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter folder name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select permissions" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          <span>Private</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="team">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Team</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="department">
                        <div className="flex items-center gap-2">
                          <Building1 className="h-4 w-4" />
                          <span>Department</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="organization">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>Organization</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder Color</FormLabel>
                  <div className="flex gap-2 flex-wrap">
                    {folderColors.map(color => (
                      <button
                        type="button"
                        key={color.value}
                        className={`h-8 w-8 rounded-full cursor-pointer flex items-center justify-center transition-all ${
                          field.value === color.value
                            ? 'ring-2 ring-primary ring-offset-2'
                            : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => form.setValue('color', color.value)}
                        title={color.name}
                        aria-label={color.name}
                        aria-pressed={field.value === color.value}
                      >
                        {field.value === color.value && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-label="Checkmark"
                            aria-hidden="true"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancelAction}>
                Cancel
              </Button>
              <Button type="submit">
                <FolderPlus className="mr-2 h-4 w-4" />
                Create Folder
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Custom Building icon
function Building(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-label="Building"
      aria-hidden="true"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}
