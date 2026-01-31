#!/bin/bash

# Deployment Test Script
# Tests that all Docker services start correctly and APIs are accessible

set -e

echo "🧪 Workspace Hub - Deployment Test Script"
echo "=========================================="
echo ""

# Clean up existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down -v 2>/dev/null || true
echo "✅ Cleanup complete"
echo ""

# Start services
echo "🚀 Starting Docker services..."
docker-compose up -d
echo "✅ Services started"
echo ""

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
MAX_WAIT=120
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
    # Check if backend health endpoint responds
    if curl -sf http://localhost:5000/api/health > /dev/null 2>&1; then
        echo "✅ Backend is healthy!"
        break
    fi
    
    echo "   ...waiting (${ELAPSED}s/${MAX_WAIT}s)"
    sleep 5
    ELAPSED=$((ELAPSED + 5))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo "❌ Services failed to become healthy within ${MAX_WAIT} seconds"
    docker-compose logs
    exit 1
fi

echo ""
echo "🧪 Testing API endpoints..."

# Test health endpoint
echo "Testing: GET /api/health"
HEALTH=$(curl -s http://localhost:5000/api/health)
echo "Response: $HEALTH"

# Test login with demo credentials
echo ""
echo "Testing: POST /api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "Demo@123",
    "tenantSubdomain": "demo"
  }')
echo "Response: $LOGIN_RESPONSE"

# Extract token (requires jq, but we'll skip if not available)
if command -v jq &> /dev/null; then
    TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
    echo "Token: ${TOKEN:0:50}..."
    
    # Test authenticated endpoint
    echo ""
    echo "Testing: GET /api/auth/me"
    ME_RESPONSE=$(curl -s http://localhost:5000/api/auth/me \
      -H "Authorization: Bearer $TOKEN")
    echo "Response: $ME_RESPONSE"
else
    echo "⚠️  jq not installed, skipping token extraction"
fi

echo ""
echo "✅ Basic API tests complete!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   Health:   http://localhost:5000/api/health"
echo ""
echo "🔑 Login credentials:"
echo "   Super Admin:  superadmin@system.com / Admin@123"
echo "   Tenant Admin: admin@demo.com / Demo@123 (subdomain: demo)"
echo "   User 1:       user1@demo.com / User@123 (subdomain: demo)"
echo ""
