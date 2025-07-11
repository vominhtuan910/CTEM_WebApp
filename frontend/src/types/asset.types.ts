export type AssetStatus = 'active' | 'inactive';
export type ServiceStatus = 'running' | 'stopped' | 'unknown';

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
    ipAddress: string;
    status: AssetStatus;
    lastScan: string;
    os: OperatingSystem;
    services: Service[];
    applications: Application[];
}

export interface AssetFilter {
    search: string;
    status: AssetStatus[];
    osType: string[];
} 