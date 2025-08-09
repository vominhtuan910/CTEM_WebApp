@echo off
echo Setting up SSH keys for Searchsploit VM access...

REM Create .ssh directory if it doesn't exist
if not exist "%USERPROFILE%\.ssh" mkdir "%USERPROFILE%\.ssh"

REM Generate SSH key pair
echo Generating SSH key pair...
ssh-keygen -t rsa -b 4096 -f "%USERPROFILE%\.ssh\kali_vm_key" -N ""

echo.
echo SSH key generated at: %USERPROFILE%\.ssh\kali_vm_key
echo.
echo Next steps:
echo 1. Copy the public key to your Kali VM:
echo    type "%USERPROFILE%\.ssh\kali_vm_key.pub"
echo.
echo 2. On your Kali VM, run:
echo    mkdir -p ~/.ssh
echo    echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
echo    chmod 600 ~/.ssh/authorized_keys
echo    chmod 700 ~/.ssh
echo.
echo 3. Update your environment variables:
echo    SEARCHSPLOIT_USE_SSH=true
echo    SEARCHSPLOIT_SSH_HOST=192.168.56.10
echo    SEARCHSPLOIT_SSH_USER=kali
echo    SEARCHSPLOIT_SSH_KEY=%USERPROFILE%\.ssh\kali_vm_key
echo.
pause
