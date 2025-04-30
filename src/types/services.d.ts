import type { User } from '@/types/auth';

export type RequestPriority = 'low' | 'medium' | 'high' | 'critical';
export type RequestStatus =
  | 'draft'
  | 'submitted'
  | 'pending_approval'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'cancelled';
export type RequestType =
  | 'resource_provision'
  | 'access_request'
  | 'maintenance'
  | 'software_installation'
  | 'service_change'
  | 'incident_report'
  | 'other';

export interface RequestApproval {
  id: string;
  userId: string;
  userName: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  timestamp?: Date;
}

export interface RequestStep {
  id: string;
  title: string;
  description: string;
  fields: string[];
}

export interface RequestComment {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  timestamp: Date;
}

export interface RequestAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: Date;
  url: string;
}

export interface ServiceRequest {
  id: string;
  title: string;
  requestType: RequestType;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  requestor: User;
  assignedTo?: User;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  approvals: RequestApproval[];
  relatedResources?: string[];
  comments: RequestComment[];
  attachments: RequestAttachment[];
  metadata?: Record<string, unknown>;
}
