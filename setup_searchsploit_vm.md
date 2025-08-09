# Searchsploit VM Setup for VirtualBox

## Option 1: Lightweight Kali VM

1. Download Kali Linux VirtualBox image from: https://www.kali.org/get-kali/#kali-virtual-machines
2. Import the VM with minimal resources:
   - RAM: 1GB (minimum)
   - CPU: 1 core
   - Disk: 20GB
3. Start VM and install searchsploit:
   ```bash
   sudo apt update
   sudo apt install exploitdb
   ```

## Option 2: Ubuntu Server VM (Lighter)

1. Download Ubuntu Server 22.04 LTS
2. Create VM with minimal resources:
   - RAM: 512MB
   - CPU: 1 core
   - Disk: 10GB
3. Install searchsploit:
   ```bash
   sudo apt update
   sudo apt install git
   git clone https://gitlab.com/exploit-database/exploitdb.git /opt/exploitdb
   sudo ln -sf /opt/exploitdb/searchsploit /usr/local/bin/searchsploit
   ```

## Network Configuration

- Set VM network to "Host-only" or "NAT"
- Configure static IP (e.g., 192.168.56.10)
- Enable SSH for remote access:
  ```bash
  sudo systemctl enable ssh
  sudo systemctl start ssh
  ```

## Access from Windows

Use SSH to execute searchsploit commands:

```bash
ssh user@192.168.56.10 "searchsploit --json CVE-2023-12345"
```
