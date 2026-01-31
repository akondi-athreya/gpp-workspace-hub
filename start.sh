#!/bin/bash

# Quick Start Script
# Starts all services and opens the application in the browser

echo "🚀 Workspace Hub - Quick Start"
echo "=============================="
echo ""

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install Docker Desktop."
    exit 1
fi

# Start services
echo "🐳 Starting Docker services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
echo "   This may take a minute on first run (downloading images, building containers)..."

# Wait for health check
MAX_WAIT=120
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
    if curl -sf http://localhost:5000/api/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    
    printf "."
    sleep 5
    ELAPSED=$((ELAPSED + 5))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo ""
    echo "❌ Services took too long to start. Check logs with: docker-compose logs"
    exit 1
fi

echo ""
echo "✅ All services are ready!"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   Health Check: http://localhost:5000/api/health"
echo ""
echo "🔑 Login Credentials:"
echo "   ┌─────────────────────────────────────────────┐"
echo "   │ Super Admin                                 │"
echo "   │   Email: superadmin@system.com              │"
echo "   │   Password: Admin@123                       │"
echo "   │   (No subdomain required)                   │"
echo "   ├─────────────────────────────────────────────┤"
echo "   │ Demo Tenant Admin (subdomain: demo)        │"
echo "   │   Email: admin@demo.com                     │"
echo "   │   Password: Demo@123                        │"
echo "   ├─────────────────────────────────────────────┤"
echo "   │ Demo User 1 (subdomain: demo)              │"
echo "   │   Email: user1@demo.com                     │"
echo "   │   Password: User@123                        │"
echo "   └─────────────────────────────────────────────┘"
echo ""
echo "📚 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
echo ""

# Open browser (macOS)
if command -v open &> /dev/null; then
    echo "🌐 Opening frontend in browser..."
    sleep 2
    open http://localhost:3000
fi
