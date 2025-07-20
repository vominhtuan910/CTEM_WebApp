export type AssetStatus = "active" | "inactive";
export type ServiceStatus = "running" | "stopped" | "unknown";
export type AgentStatus = "installed" | "not_installed" | "error";

export interface Service {
  name: string;
  displayName: string;
  status: ServiceStatus;
  startType: string;
  pid?: number;
  port?: number;
}

export interface Application {
  name: string;
  version: string;
  publisher: string;
  installDate: string;
  size?: string;
}

export interface OperatingSystem {
  name: string;
  version: string;
  architecture: string;
  buildNumber: string;
  lastBootTime: string;
}

export interface Asset {
  id: string;
  hostname: string;
  name?: string; // Added for backward compatibility
  ipAddress: string;
  ipAddresses?: string[]; // Added for multiple IPs support
  status: AssetStatus;
  lastScan: string;
  lastUpdated?: string;
  createdAt?: string;
  os: OperatingSystem;
  operatingSystem?: string; // Added for backward compatibility
  services: Service[];
  applications: Application[];
  healthScore?: number;
  issuesCount?: number;
  labels?: string[];
  agentStatus?: AgentStatus;
  priority?: {
    confidentiality: number;
    integrity: number;
    availability: number;
  };
}

export interface AssetFormState {
  hostname: string;
  ipAddress: string;
  status: AssetStatus;
  type: string;
  operatingSystem: string;
  version: string;
  department: string;
  location: string;
  owner: string;
  labels: string[];
  ipAddresses: string[];
  priority: {
    confidentiality: number;
    integrity: number;
    availability: number;
  };
}

export interface AssetFilter {
  search: string;
  status: AssetStatus[];
  osType: string[];
}
