# Agent Finder Development Startup Script (PowerShell)
# This script starts both the Agent Finder API and the Web App for development

Write-Host "🏠 Starting Real Estate Platform Development Environment" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Run this script from the Web-App directory" -ForegroundColor Red
    exit 1
}

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Start Agent Finder API in background
Write-Host "🧠 Starting Agent Finder ML API on port 8003..." -ForegroundColor Yellow
$originalLocation = Get-Location
Set-Location "../AI-ML-Services/agent_finder"

if (-not (Test-Path "api.py")) {
    Write-Host "❌ Error: Agent Finder API not found. Check the path." -ForegroundColor Red
    exit 1
}

# Check if Python is available
try {
    python --version | Out-Null
}
catch {
    Write-Host "❌ Error: Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Install Python dependencies if needed
if (-not (Test-Path "requirements.txt")) {
    Write-Host "❌ Error: requirements.txt not found" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing Python dependencies..." -ForegroundColor Blue
pip install -r requirements.txt

# Check if port 8003 is already in use
if (Test-Port 8003) {
    Write-Host "⚠️  Port 8003 is already in use. Agent Finder API may already be running." -ForegroundColor Yellow
}
else {
    Write-Host "🚀 Starting Agent Finder API..." -ForegroundColor Blue
    $agentFinderJob = Start-Job -ScriptBlock {
        param($workingDir)
        Set-Location $workingDir
        uvicorn api:app --host 0.0.0.0 --port 8003 --reload
    } -ArgumentList (Get-Location)
    
    Write-Host "   Agent Finder Job ID: $($agentFinderJob.Id)" -ForegroundColor Gray
}

# Wait a moment for the API to start
Start-Sleep -Seconds 5

# Check if Agent Finder API is responding
Write-Host "🔍 Checking Agent Finder API health..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8003/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Agent Finder API is running successfully" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Agent Finder API is not responding. Check the logs." -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Go back to Web-App directory
Set-Location $originalLocation

# Install Node.js dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Blue
    npm install
}

# Start the Next.js development server
Write-Host "🌐 Starting Next.js Web App on port 3000..." -ForegroundColor Blue
Write-Host ""
Write-Host "🎉 Development environment ready!" -ForegroundColor Green
Write-Host "   - Agent Finder API: http://localhost:8003" -ForegroundColor Cyan
Write-Host "   - Web App: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   - Agent Finder Dashboard: http://localhost:3000/dashboard/agent-finder" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 See docs/agent-finder-integration.md for usage instructions" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Cleanup function
function Stop-Services {
    Write-Host ""
    Write-Host "🛑 Shutting down development environment..." -ForegroundColor Yellow
    
    if ($agentFinderJob) {
        Stop-Job $agentFinderJob -ErrorAction SilentlyContinue
        Remove-Job $agentFinderJob -ErrorAction SilentlyContinue
        Write-Host "   Stopped Agent Finder API" -ForegroundColor Gray
    }
    
    # Kill any remaining uvicorn processes
    Get-Process | Where-Object {$_.ProcessName -like "*uvicorn*"} | Stop-Process -Force -ErrorAction SilentlyContinue
    
    exit 0
}

# Register cleanup function for Ctrl+C
Register-EngineEvent PowerShell.Exiting -Action { Stop-Services }

try {
    # Start Next.js (this will run in foreground)
    npm run dev
}
finally {
    Stop-Services
}