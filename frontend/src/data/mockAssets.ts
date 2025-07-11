import { Asset } from '../types/asset.types';

const now = new Date().toISOString();

export const mockAssets: Asset[] = [
    {
        id: '1',
        hostname: 'DESKTOP-WS001',
        ipAddress: '192.168.1.100',
        status: 'active',
        lastScan: now,
        os: {
            name: 'Windows',
            version: '11 Pro',
            architecture: 'x64',
            buildNumber: '22621.2715',
            lastBootTime: now
        },
        services: [
            {
                name: 'wuauserv',
                displayName: 'Windows Update',
                status: 'running',
                startType: 'automatic',
                pid: 1234
            },
            {
                name: 'RpcSs',
                displayName: 'Remote Procedure Call (RPC)',
                status: 'running',
                startType: 'automatic',
                pid: 2345
            },
            {
                name: 'EventLog',
                displayName: 'Windows Event Log',
                status: 'running',
                startType: 'automatic',
                pid: 3456
            },
            {
                name: 'W3SVC',
                displayName: 'World Wide Web Publishing Service',
                status: 'running',
                startType: 'automatic',
                pid: 4567,
                port: 80
            }
        ],
        applications: [
            {
                name: 'Mozilla Firefox',
                version: '123.0',
                publisher: 'Mozilla Corporation',
                installDate: '2024-01-15',
                size: '200 MB'
            },
            {
                name: 'Microsoft Office',
                version: '2021',
                publisher: 'Microsoft Corporation',
                installDate: '2023-12-01',
                size: '4.2 GB'
            },
            {
                name: 'Visual Studio Code',
                version: '1.86.0',
                publisher: 'Microsoft Corporation',
                installDate: '2024-02-01',
                size: '350 MB'
            }
        ]
    },
    {
        id: '2',
        hostname: 'UBUNTU-SRV01',
        ipAddress: '192.168.1.101',
        status: 'active',
        lastScan: now,
        os: {
            name: 'Ubuntu',
            version: '22.04 LTS',
            architecture: 'x64',
            buildNumber: '22.04.3',
            lastBootTime: now
        },
        services: [
            {
                name: 'ssh',
                displayName: 'OpenSSH Server',
                status: 'running',
                startType: 'enabled',
                pid: 1122,
                port: 22
            },
            {
                name: 'apache2',
                displayName: 'Apache HTTP Server',
                status: 'running',
                startType: 'enabled',
                pid: 2233,
                port: 80
            },
            {
                name: 'mysql',
                displayName: 'MySQL Database Server',
                status: 'running',
                startType: 'enabled',
                pid: 3344,
                port: 3306
            }
        ],
        applications: [
            {
                name: 'Docker',
                version: '24.0.7',
                publisher: 'Docker Inc.',
                installDate: '2024-01-20',
                size: '500 MB'
            },
            {
                name: 'Node.js',
                version: '20.11.0',
                publisher: 'OpenJS Foundation',
                installDate: '2024-01-15'
            },
            {
                name: 'Python',
                version: '3.10.12',
                publisher: 'Python Software Foundation',
                installDate: '2023-12-25'
            }
        ]
    },
    {
        id: '3',
        hostname: 'MACOS-DEV01',
        ipAddress: '192.168.1.102',
        status: 'inactive',
        lastScan: now,
        os: {
            name: 'macOS',
            version: 'Sonoma',
            architecture: 'arm64',
            buildNumber: '14.3',
            lastBootTime: now
        },
        services: [
            {
                name: 'com.apple.WindowServer',
                displayName: 'Window Server',
                status: 'running',
                startType: 'system',
                pid: 88
            },
            {
                name: 'com.docker.docker',
                displayName: 'Docker Desktop',
                status: 'stopped',
                startType: 'user',
            },
            {
                name: 'org.nginx.nginx',
                displayName: 'Nginx Web Server',
                status: 'running',
                startType: 'user',
                pid: 456,
                port: 8080
            }
        ],
        applications: [
            {
                name: 'Xcode',
                version: '15.2',
                publisher: 'Apple Inc.',
                installDate: '2024-01-30',
                size: '30.5 GB'
            },
            {
                name: 'Adobe Creative Cloud',
                version: '24.1.1',
                publisher: 'Adobe Inc.',
                installDate: '2024-01-15',
                size: '2.3 GB'
            },
            {
                name: 'Homebrew',
                version: '4.2.4',
                publisher: 'Homebrew Contributors',
                installDate: '2023-12-20'
            }
        ]
    }
]; 