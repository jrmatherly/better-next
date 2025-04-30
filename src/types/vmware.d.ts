export interface VM {
  id: string;
  name: string;
  description: string;
  status: string; // running, stopped, suspended, maintenance, error
  type: string; // server, desktop, database
  ip: string;
  cpu: number; // vCPUs
  memory: number; // GB
  storage: number; // GB
  network: string;
  os: string;
  createdAt: Date;
  lastModified: Date;
  powerState: string; // poweredOn, poweredOff, suspended
  hostServer: string;
  resourcePool: string;
  datastorePath: string;
  performanceMetrics: {
    cpuUsage: number; // percentage
    memoryUsage: number; // percentage
    diskIops: number; // IO operations per second
    networkThroughput: number; // Mbps
  };
  tags: string[];
  notes: string;
}

export interface ResourcePool {
  id: string;
  name: string;
  vms: number;
  status: string;
  cpuReservation: number;
  cpuLimit: number;
  cpuUsage: number;
  memoryReservation: number;
  memoryLimit: number;
  memoryUsage: number;
  priority: string;
  expandable: boolean;
}

export interface Host {
  id: string;
  name: string;
  status: string;
  vms: number;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  cpuCores: number;
  memorySizeGB: number;
  storageSizeGB: number;
  ipAddress: string;
  version: string;
}

export interface Cluster {
  id: string;
  name: string;
  status: string;
  hosts: number;
  vms: number;
  cpuTotal: number;
  cpuUsed: number;
  memoryTotal: number;
  memoryUsed: number;
  storageTotal: number;
  storageUsed: number;
}
