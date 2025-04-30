"use client"

import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Resource, ResourceCategory } from '@/lib/types';

// Form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  type: z.string().min(1, {
    message: 'Please select a resource type.',
  }),
  category: z.string().min(1, {
    message: 'Please select a category.',
  }),
  status: z.enum(['active', 'inactive', 'maintenance', 'error']),
  allocation: z.number().min(0).max(100),
  location: z.string().min(1, {
    message: 'Please enter a location.',
  }),
  description: z.string().min(1, {
    message: 'Please enter a description.',
  }),
  specs: z.record(z.string().min(1)),
  tags: z.string().transform(val => val.split(',').map(tag => tag.trim()).filter(Boolean)),
  owner: z.string().min(1, {
    message: 'Please enter an owner.',
  }),
});

type FormData = z.infer<typeof formSchema>;

interface ResourceFormProps {
  resource?: Resource;
  onSubmit: (resource: any) => void;
  onCancel: () => void;
  categories: ResourceCategory[];
  isNewResource: boolean;
}

export function ResourceForm({ resource, onSubmit, onCancel, categories, isNewResource }: ResourceFormProps) {
  // Default values for the form
  const defaultValues: Partial<FormData> = resource
    ? {
        ...resource,
        tags: resource.tags.join(', '),
        specs: { ...resource.specs },
      }
    : {
        name: '',
        type: '',
        category: '',
        status: 'active',
        allocation: 0,
        location: '',
        description: '',
        specs: {
          cpu: '',
          memory: '',
          storage: '',
        },
        tags: '',
        owner: '',
      };

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Handle form submission
  const handleSubmit = (data: FormData) => {
    if (resource) {
      onSubmit({ ...resource, ...data });
    } else {
      onSubmit(data);
    }
  };

  // Dynamic form fields for specs
  const [specFields, setSpecFields] = useState<{ key: string; value: string }[]>(
    Object.entries(defaultValues.specs || {}).map(([key, value]) => ({ key, value: value.toString() }))
  );

  // Add a new spec field
  const addSpecField = () => {
    setSpecFields([...specFields, { key: '', value: '' }]);
  };

  // Remove a spec field
  const removeSpecField = (index: number) => {
    const newSpecFields = [...specFields];
    newSpecFields.splice(index, 1);
    setSpecFields(newSpecFields);
  };

  // Update specs in form data when specFields change
  const updateSpecs = () => {
    const specs: Record<string, string> = {};
    specFields.forEach(({ key, value }) => {
      if (key && value) {
        specs[key] = value;
      }
    });
    form.setValue('specs', specs);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isNewResource ? 'Add New Resource' : 'Edit Resource'}
          </DialogTitle>
          <DialogDescription>
            {isNewResource
              ? 'Fill in the details below to add a new resource to your inventory.'
              : 'Update the resource details as needed.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Resource name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Resource type" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              {category.icon}
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this resource"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., US-East, Europe-West" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., IT Team, Development" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="allocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Allocation ({field.value}%)</FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(vals) => field.onChange(vals[0])}
                      disabled={form.watch('status') !== 'active'}
                    />
                  </FormControl>
                  <FormDescription>
                    Set the current resource utilization percentage.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., production, database, critical (comma-separated)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter tags separated by commas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Specifications</FormLabel>
              <div className="space-y-2 mt-2">
                {specFields.map((spec, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Name (e.g., CPU)"
                      value={spec.key}
                      onChange={(e) => {
                        const newSpecFields = [...specFields];
                        newSpecFields[index].key = e.target.value;
                        setSpecFields(newSpecFields);
                        updateSpecs();
                      }}
                      className="w-1/3"
                    />
                    <Input
                      placeholder="Value (e.g., 8 cores)"
                      value={spec.value}
                      onChange={(e) => {
                        const newSpecFields = [...specFields];
                        newSpecFields[index].value = e.target.value;
                        setSpecFields(newSpecFields);
                        updateSpecs();
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeSpecField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpecField}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Specification
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {isNewResource ? 'Create Resource' : 'Update Resource'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}