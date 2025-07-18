import { exec } from 'child_process';
import fs from 'fs';

const outputFileName = 'output/kali_info.json';
let results = {};


export const executeCommand = (command, key, parseFunction = (output) => output.trim()) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error from command "${command}": ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.warn(`Warning from command "${command}": ${stderr.trim()}`);
            }
            results[key] = parseFunction(stdout);
            resolve();
        });
    });
};

export const parseIpAOutput = (output) => {
    const interfaces = {};
    const lines = output.split('\n');
    let currentInterface = null;

    lines.forEach(line => {
        line = line.trim();
        
        const interfaceMatch = line.match(/^\d+:\s+(\w+):/);
        if (interfaceMatch) {
            currentInterface = interfaceMatch[1];
            interfaces[currentInterface] = {
                state: '',
                mac_address: '',
                ipv4_addresses: [],
                ipv6_addresses: []
            };

            // Trích xuất trạng thái (UP, DOWN)
            const stateMatch = line.match(/state\s+(\w+)/);
            if (stateMatch) {
                interfaces[currentInterface].state = stateMatch[1];
            }
        } else if (currentInterface) {
            // Lấy địa chỉ MAC (link/ether)
            const macMatch = line.match(/link\/ether\s+([0-9a-f:]+)/);
            if (macMatch) {
                interfaces[currentInterface].mac_address = macMatch[1];
            }
            // Lấy địa chỉ IPv4 (inet)
            const ipv4Match = line.match(/inet\s+([\d.]+)\/(\d+)\s+brd\s+([\d.]+)/); // Bao gồm cả broadcast
            if (!ipv4Match) { // Thử pattern khác nếu không có broadcast
                 const ipv4MatchSimple = line.match(/inet\s+([\d.]+)\/(\d+)/);
                 if (ipv4MatchSimple) {
                    interfaces[currentInterface].ipv4_addresses.push({
                        address: ipv4MatchSimple[1],
                        cidr: ipv4MatchSimple[2]
                    });
                 }
            } else if (ipv4Match) {
                interfaces[currentInterface].ipv4_addresses.push({
                    address: ipv4Match[1],
                    cidr: ipv4Match[2],
                    broadcast: ipv4Match[3]
                });
            }
            // Lấy địa chỉ IPv6 (inet6)
            const ipv6Match = line.match(/inet6\s+([0-9a-f:]+)\/(\d+)/);
            if (ipv6Match) {
                interfaces[currentInterface].ipv6_addresses.push({
                    address: ipv6Match[1],
                    cidr: ipv6Match[2]
                });
            }
        }
    });
    return interfaces;
};


export function scanHostname_IPs() {
    Promise.all([
        executeCommand('hostname', 'hostname'),
        executeCommand('hostname -I', 'ip_addresses_short'), // Lấy các IP chính
        executeCommand('ip a', 'network_interfaces', parseIpAOutput) // Lấy thông tin chi tiết các interface
    ])
    .then(() => {
        
        const jsonOutput = JSON.stringify(results, null, 4); // null, 4 để định dạng JSON đẹp
        fs.writeFile(outputFileName, jsonOutput, (err) => {
            if (err) {
                console.error(`Error while writing file JSON: ${err.message}`);
                return;
            }
            
        });
    })
    .catch((err) => {
        console.error('Error');
    });
}