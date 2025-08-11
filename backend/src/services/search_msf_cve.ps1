param (
    [Parameter(Mandatory = $true)]
    [string]$CVE_ID
)

# Path to msfconsole.bat (adjust if Metasploit is installed elsewhere)
$msfPath = "C:\metasploit-framework\bin\msfconsole.bat"

# Run msfconsole search and capture output
$rawOutput = & $msfPath -q -x "search cve:$CVE_ID; exit" 2>$null

# Prepare an array to hold JSON objects
$results = @()

foreach ($line in $rawOutput) {
    if ($line -match '^exploit/') {
        $parts = $line -split '\s+'
        if ($parts.Count -ge 5) {
            $module = $parts[0]
            $rank = $parts[2]
            $description = ($parts | Select-Object -Skip 4) -join " "
            $results += [PSCustomObject]@{
                module      = $module
                rank        = $rank
                description = $description
            }
        }
    }
}

# Convert to JSON and output
$results | ConvertTo-Json -Depth 2
