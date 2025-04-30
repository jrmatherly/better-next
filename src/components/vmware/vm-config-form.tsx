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
import { Textarea } from '@/components/ui/textarea';
import type { VM } from '@/types/vmware';
import { zodResolver } from '@hookform/resolvers/zod';
import { CpuIcon, HardDrive, MemoryStick as Memory, Network } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

/**
 * Form schema for VM configuration validation
 */
const vmConfigSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  description: z.string().optional(),
  cpu: z.coerce.number().int().min(1).max(32),
  memory: z.coerce.number().int().min(1).max(256),
  storage: z.coerce.number().int().min(10).max(2048),
  network: z.string(),
  os: z.string(),
  notes: z.string().optional(),
  tags: z.string(), // Comma-separated tags that will be split
});

type VmConfigFormValues = z.infer<typeof vmConfigSchema>;

/**
 * Props for the VmConfigForm component
 */
interface VmConfigFormProps {
  /**
   * VM to edit, if not provided defaults will be used for a new VM
   */
  vm?: VM;
  
  /**
   * Callback for when the form is submitted
   */
  onSubmitAction: (updatedVm: VM) => void;
  
  /**
   * Callback for when the form is cancelled
   */
  onCancelAction: () => void;
  
  /**
   * Whether the form dialog is open
   */
  open: boolean;
}

/**
 * VM Configuration Form component
 * Allows editing existing VMs or creating new ones
 */
export function VmConfigForm({
  vm,
  onSubmitAction,
  onCancelAction,
  open,
}: VmConfigFormProps) {
  // Initialize the form with VM data or defaults
  const form = useForm<VmConfigFormValues>({
    resolver: zodResolver(vmConfigSchema),
    defaultValues: {
      name: vm?.name || '',
      description: vm?.description || '',
      cpu: vm?.cpu || 2,
      memory: vm?.memory || 4,
      storage: vm?.storage || 50,
      network: vm?.network || '1 Gbps',
      os: vm?.os || 'Ubuntu 24.04 LTS',
      notes: vm?.notes || '',
      tags: vm?.tags.join(', ') || '',
    },
  });

  /**
   * Handle form submission
   */
  function onSubmit(values: VmConfigFormValues) {
    if (!vm) {
      // This shouldn't happen as we're only using this for editing
      onCancelAction();
      return;
    }

    // Prepare the updated VM with form values
    const updatedVm: VM = {
      ...vm,
      name: values.name,
      description: values.description || '',
      cpu: values.cpu,
      memory: values.memory,
      storage: values.storage,
      network: values.network,
      os: values.os,
      notes: values.notes || '',
      tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
    };

    onSubmitAction(updatedVm);
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancelAction()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit VM Configuration</DialogTitle>
          <DialogDescription>
            Update the configuration of your virtual machine. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VM Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    A brief description of this VM's purpose
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <CpuIcon className="h-4 w-4" />
                        CPU (vCPUs)
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={32} {...field} />
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
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <Memory className="h-4 w-4" />
                        Memory (GB)
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={256} {...field} />
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
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        Storage (GB)
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min={10} max={2048} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="network"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <Network className="h-4 w-4" />
                        Network
                      </div>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select network speed" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="100 Mbps">100 Mbps</SelectItem>
                        <SelectItem value="1 Gbps">1 Gbps</SelectItem>
                        <SelectItem value="10 Gbps">10 Gbps</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      <SelectItem value="Ubuntu 24.04 LTS">Ubuntu 24.04 LTS</SelectItem>
                      <SelectItem value="Windows Server 2025">Windows Server 2025</SelectItem>
                      <SelectItem value="RedHat Enterprise Linux 9">RHEL 9</SelectItem>
                      <SelectItem value="Debian 12">Debian 12</SelectItem>
                      <SelectItem value="macOS Sonoma">macOS Sonoma</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of tags (e.g., "dev, app, testing")
                  </FormDescription>
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    Additional notes or information about this VM
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancelAction}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
