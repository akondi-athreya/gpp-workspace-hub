#!/bin/bash

# Stop Script
# Stops all Docker services and optionally removes volumes

echo "🛑 Workspace Hub - Stop Services"
echo "================================="
echo ""

# Check if volumes should be removed
REMOVE_VOLUMES=false
if [ "$1" == "--clean" ] || [ "$1" == "-c" ]; then
    REMOVE_VOLUMES=true
    echo "⚠️  WARNING: This will remove all data (including database)!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
fi

# Stop services
echo "🛑 Stopping Docker services..."
if [ "$REMOVE_VOLUMES" == true ]; then
    docker-compose down -v
    echo "✅ Services stopped and volumes removed"
else
    docker-compose down
    echo "✅ Services stopped (data preserved)"
fi

echo ""
echo "💡 To start again: ./start.sh"
if [ "$REMOVE_VOLUMES" == false ]; then
    echo "💡 To clean all data: ./stop.sh --clean"
fi
