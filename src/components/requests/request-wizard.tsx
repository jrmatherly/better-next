'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import type { ServiceRequest } from '@/types/services';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

interface RequestWizardProps {
  onSubmitAction: (request: Partial<ServiceRequest>) => void;
  onCancelAction: () => void;
}

export function RequestWizard({ onSubmitAction, onCancelAction }: RequestWizardProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [requestData, setRequestData] = useState<Partial<ServiceRequest>>({});

  // Define form schemas for each step
  const stepOneSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    requestType: z.enum(
      [
        'resource_provision',
        'access_request',
        'maintenance',
        'software_installation',
        'service_change',
        'incident_report',
        'other',
      ],
      {
        required_error: 'Please select a request type',
      }
    ),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters'),
    priority: z.enum(['low', 'medium', 'high', 'critical'], {
      required_error: 'Please select a priority level',
    }),
  });

  const stepTwoSchema = z.object({
    dueDate: z.date().optional(),
    requiredResources: z.string().optional(),
    additionalInfo: z.string().optional(),
  });

  // Type for form values
  type StepOneValues = z.infer<typeof stepOneSchema>;
  type StepTwoValues = z.infer<typeof stepTwoSchema>;

  // Initialize form for step one
  const stepOneForm = useForm<StepOneValues>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      title: '',
      requestType: undefined,
      description: '',
      priority: undefined,
    },
  });

  // Initialize form for step two
  const stepTwoForm = useForm<StepTwoValues>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      dueDate: undefined,
      requiredResources: '',
      additionalInfo: '',
    },
  });

  // Handle submission for step one
  const onStepOneSubmit = (data: StepOneValues) => {
    setRequestData({ ...requestData, ...data });
    setStep(1);
  };

  // Handle submission for step two
  const onStepTwoSubmit = (data: StepTwoValues) => {
    // Combine data from both steps
    const combinedData: Partial<ServiceRequest> = {
      ...requestData,
      ...data,
      metadata: {
        requiredResources: data.requiredResources ?? '',
        additionalInfo: data.additionalInfo ?? '',
      },
    };

    // Submit the combined data
    onSubmitAction(combinedData);
  };

  // Handle going back to the previous step
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      onCancelAction();
    }
  };

  return (
    <Dialog open onOpenChange={open => !open && onCancelAction()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Service Request</DialogTitle>
          <DialogDescription>
            Create a new service request to get the resources or services you
            need.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          <div className="flex items-center space-x-1">
            <div
              className={`w-2.5 h-2.5 rounded-full ${step === 0 ? 'bg-primary' : 'bg-muted'}`}
            />
            <div
              className={`w-2.5 h-2.5 rounded-full ${step === 1 ? 'bg-primary' : 'bg-muted'}`}
            />
          </div>
        </div>

        {step === 0 && (
          <Form {...stepOneForm}>
            <form
              onSubmit={stepOneForm.handleSubmit(onStepOneSubmit)}
              className="space-y-4"
            >
              <FormField
                control={stepOneForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a clear title for your request"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={stepOneForm.control}
                name="requestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Type</FormLabel>
                    <Controller
                      name="requestType"
                      control={stepOneForm.control}
                      render={({ field }) => (
                        <Select
                          value={field.value ?? undefined}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select request type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="resource_provision">
                              Resource Provisioning
                            </SelectItem>
                            <SelectItem value="access_request">
                              Access Request
                            </SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="software_installation">
                              Software Installation
                            </SelectItem>
                            <SelectItem value="service_change">
                              Service Change
                            </SelectItem>
                            <SelectItem value="incident_report">
                              Incident Report
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={stepOneForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your request in detail"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={stepOneForm.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Controller
                      name="priority"
                      control={stepOneForm.control}
                      render={({ field }) => (
                        <Select
                          value={field.value ?? undefined}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FormDescription>
                      Select the priority level based on urgency and business
                      impact.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <Button type="submit">
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {step === 1 && (
          <Form {...stepTwoForm}>
            <form
              onSubmit={stepTwoForm.handleSubmit(onStepTwoSubmit)}
              className="space-y-4"
            >
              <FormField
                control={stepTwoForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <Controller
                      name="dueDate"
                      control={stepTwoForm.control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Select a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={date => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                    <FormDescription>
                      When do you need this request completed?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={stepTwoForm.control}
                name="requiredResources"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Resources (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List any specific resources needed"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Specify any resources, equipment, or systems needed for
                      this request.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={stepTwoForm.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide any additional details that might help"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <Button type="submit">
                  Submit Request
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
