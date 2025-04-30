'use client';

import { Badge } from '@/components/ui/badge';
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
  FormDescription,
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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { VM } from '@/types/vmware';
import { zodResolver } from '@hookform/resolvers/zod';
import { Server } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Form schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'VM name must be at least 2 characters' }),
  description: z.string().optional(),
  type: z.string(),
  os: z.string(),
  cpu: z.coerce.number().min(1).max(64),
  memory: z.coerce.number().min(1).max(512),
  storage: z.coerce.number().min(10).max(2048),
  network: z.string(),
  hostServer: z.string(),
  resourcePool: z.string(),
  notes: z.string().optional(),
  tags: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

interface VmProvisionFormProps {
  onSubmitAction: (data: Partial<VM>) => void;
  onCancelAction: () => void;
}

export function VmProvisionForm({
  onSubmitAction,
  onCancelAction,
}: VmProvisionFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Default values for the form
  const defaultValues: Partial<FormValues> = {
    name: '',
    description: '',
    type: 'server',
    os: 'Ubuntu 24.04 LTS',
    cpu: 2,
    memory: 4,
    storage: 50,
    network: '1 Gbps',
    hostServer: 'esx01.example.com',
    resourcePool: 'Production',
    notes: '',
    tags: [],
  };

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Handle form submission
  const handleFormSubmit = (values: FormValues) => {
    onSubmitAction(values);
  };

  // Apply template - sets form values based on selected template
  const applyTemplate = (template: string) => {
    setSelectedTemplate(template);

    let templateValues: Partial<FormValues> = {};

    switch (template) {
      case 'linux-small':
        templateValues = {
          type: 'server',
          os: 'Ubuntu 24.04 LTS',
          cpu: 1,
          memory: 2,
          storage: 20,
          tags: ['linux', 'small', 'server'],
        };
        break;
      case 'linux-medium':
        templateValues = {
          type: 'server',
          os: 'Ubuntu 24.04 LTS',
          cpu: 2,
          memory: 4,
          storage: 50,
          tags: ['linux', 'medium', 'server'],
        };
        break;
      case 'linux-large':
        templateValues = {
          type: 'server',
          os: 'Ubuntu 24.04 LTS',
          cpu: 4,
          memory: 8,
          storage: 100,
          tags: ['linux', 'large', 'server'],
        };
        break;
      case 'windows-small':
        templateValues = {
          type: 'desktop',
          os: 'Windows 11 Pro',
          cpu: 2,
          memory: 4,
          storage: 60,
          tags: ['windows', 'small', 'desktop'],
        };
        break;
      case 'windows-medium':
        templateValues = {
          type: 'desktop',
          os: 'Windows 11 Pro',
          cpu: 4,
          memory: 8,
          storage: 120,
          tags: ['windows', 'medium', 'desktop'],
        };
        break;
      case 'database':
        templateValues = {
          type: 'database',
          os: 'Ubuntu 24.04 LTS',
          cpu: 4,
          memory: 16,
          storage: 500,
          tags: ['database', 'high-performance'],
        };
        break;
      default:
        break;
    }

    // Update form with template values
    for (const [key, value] of Object.entries(templateValues)) {
      form.setValue(key as keyof FormValues, value);
    }
  };

  return (
    <Dialog open onOpenChange={open => !open && onCancelAction()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Provision New Virtual Machine</DialogTitle>
          <DialogDescription>
            Configure a new virtual machine for your VMware environment.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="templates">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="custom">Custom Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="pt-4 pb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                className={`rounded-md border border-input p-3 hover:border-primary cursor-pointer ${
                  selectedTemplate === 'linux-small' ? 'border-primary' : ''
                }`}
                onClick={() => applyTemplate('linux-small')}
              >
                <Server className="h-6 w-6 mb-2 text-blue-500" />
                <p className="text-sm font-medium">Linux Small</p>
                <p className="text-xs text-muted-foreground">1 CPU, 2GB RAM</p>
              </button>

              <button
                type="button"
                className={`rounded-md border border-input p-3 hover:border-primary cursor-pointer ${
                  selectedTemplate === 'linux-medium' ? 'border-primary' : ''
                }`}
                onClick={() => applyTemplate('linux-medium')}
              >
                <Server className="h-6 w-6 mb-2 text-blue-500" />
                <p className="text-sm font-medium">Linux Medium</p>
                <p className="text-xs text-muted-foreground">2 CPU, 4GB RAM</p>
              </button>

              <button
                type="button"
                className={`rounded-md border border-input p-3 hover:border-primary cursor-pointer ${
                  selectedTemplate === 'linux-large' ? 'border-primary' : ''
                }`}
                onClick={() => applyTemplate('linux-large')}
              >
                <Server className="h-6 w-6 mb-2 text-blue-500" />
                <p className="text-sm font-medium">Linux Large</p>
                <p className="text-xs text-muted-foreground">4 CPU, 8GB RAM</p>
              </button>

              <button
                type="button"
                className={`rounded-md border border-input p-3 hover:border-primary cursor-pointer ${
                  selectedTemplate === 'database' ? 'border-primary' : ''
                }`}
                onClick={() => applyTemplate('database')}
              >
                <Server className="h-6 w-6 mb-2 text-amber-500" />
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-muted-foreground">4 CPU, 16GB RAM</p>
              </button>
            </div>

            {selectedTemplate && (
              <div className="my-4">
                <p className="text-sm text-muted-foreground">
                  Template selected. Customize additional settings below or
                  proceed with the default configuration.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom" className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Configure your virtual machine from scratch with custom
              specifications.
            </p>
          </TabsContent>
        </Tabs>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VM Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter VM name" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique name for the virtual machine
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VM Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select VM type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="server">Server</SelectItem>
                        <SelectItem value="desktop">Desktop</SelectItem>
                        <SelectItem value="database">Database</SelectItem>
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
                      placeholder="Enter a description for this VM"
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">System Resources</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="cpu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPU (vCPUs)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={64} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="memory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Memory (GB)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={512} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="storage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage (GB)</FormLabel>
                      <FormControl>
                        <Input type="number" min={10} max={2048} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="os"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating System</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select OS" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Ubuntu 24.04 LTS">
                            Ubuntu 24.04 LTS
                          </SelectItem>
                          <SelectItem value="Red Hat Enterprise Linux 9">
                            Red Hat Enterprise Linux 9
                          </SelectItem>
                          <SelectItem value="Windows Server 2022">
                            Windows Server 2022
                          </SelectItem>
                          <SelectItem value="Windows 11 Pro">
                            Windows 11 Pro
                          </SelectItem>
                          <SelectItem value="CentOS Stream 9">
                            CentOS Stream 9
                          </SelectItem>
                          <SelectItem value="Debian 12">Debian 12</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="network"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Network</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1 Gbps">1 Gbps</SelectItem>
                          <SelectItem value="10 Gbps">10 Gbps</SelectItem>
                          <SelectItem value="25 Gbps">25 Gbps</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Placement</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="hostServer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Host Server</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select host server" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="esx01.example.com">
                            esx01.example.com
                          </SelectItem>
                          <SelectItem value="esx02.example.com">
                            esx02.example.com
                          </SelectItem>
                          <SelectItem value="esx03.example.com">
                            esx03.example.com
                          </SelectItem>
                          <SelectItem value="esx04.example.com">
                            esx04.example.com
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resourcePool"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource Pool</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select resource pool" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Production">Production</SelectItem>
                          <SelectItem value="Development">
                            Development
                          </SelectItem>
                          <SelectItem value="Testing">Testing</SelectItem>
                          <SelectItem value="DMZ">DMZ</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., web, production, linux (comma-separated)"
                      value={field.value.join(', ')}
                      onChange={e => {
                        const inputValue = e.target.value;
                        const tagsArray = inputValue
                          .split(',')
                          .map(tag => tag.trim())
                          .filter(Boolean);
                        field.onChange(tagsArray);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter tags separated by commas to categorize this VM
                  </FormDescription>
                  {field.value.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {field.value.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes about this VM"
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onCancelAction}>
                Cancel
              </Button>
              <Button type="submit">Provision VM</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
