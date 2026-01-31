# Troubleshooting Guide

Common issues and their solutions for Workspace Hub deployment.

## Docker Issues

### Issue: "Cannot connect to Docker daemon"

**Symptoms:**
```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

**Solution:**
1. Make sure Docker Desktop is running
2. On macOS: Open Docker Desktop from Applications
3. On Linux: `sudo systemctl start docker`
4. Verify: `docker ps` should not show an error

### Issue: Port already in use

**Symptoms:**
```
Error: port is already allocated
```

**Solution:**
```bash
# Find and kill the process using the port
# For port 5000 (backend):
lsof -ti:5000 | xargs kill -9

# For port 3000 (frontend):
lsof -ti:3000 | xargs kill -9

# For port 5432 (database):
lsof -ti:5432 | xargs kill -9

# Or stop all containers:
docker-compose down
```

### Issue: Containers failing to start

**Symptoms:**
```
container exited with code 1
```

**Solution:**
```bash
# Check logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database

# Rebuild containers
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Database Issues

### Issue: "Prisma Client could not be generated"

**Symptoms:**
```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
# Rebuild backend container
docker-compose down
docker-compose build backend --no-cache
docker-compose up -d
```

### Issue: Migration failed

**Symptoms:**
```
P3009: migrate.lock file should not be committed
```

**Solution:**
```bash
# Remove lock file and rebuild
cd backend/prisma/migrations
rm -f migration_lock.toml
cd ../../..
docker-compose down -v
docker-compose up -d
```

### Issue: Database connection refused

**Symptoms:**
```
Error: Can't reach database server at `database:5432`
```

**Solution:**
1. Check if database container is running: `docker ps`
2. Check database health: `docker-compose ps`
3. Wait longer for database to be ready (first startup takes 30-60 seconds)
4. Check logs: `docker-compose logs database`

## API Issues

### Issue: CORS errors in browser console

**Symptoms:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**
1. Verify `FRONTEND_URL` in docker-compose.yml is set to `http://frontend:3000`
2. Make sure you're accessing frontend at `http://localhost:3000` (not 127.0.0.1)
3. Restart services: `docker-compose restart backend`

### Issue: 401 Unauthorized on all API calls

**Symptoms:**
```
{"success": false, "message": "No token provided"}
```

**Solution:**
1. Make sure you're logged in
2. Check if token is stored in localStorage
3. Token might be expired (24-hour expiry) - login again
4. Check browser console for errors

### Issue: 503 Service Unavailable on health check

**Symptoms:**
```
GET /api/health returns 503
```

**Solution:**
1. Database might not be connected
2. Check database status: `docker-compose ps database`
3. Check backend logs: `docker-compose logs backend`
4. Wait 30-60 seconds for database to initialize

## Frontend Issues

### Issue: Blank page or "Cannot GET /"

**Symptoms:**
- White screen
- 404 on all routes

**Solution:**
```bash
# Rebuild frontend container
docker-compose down
docker-compose build frontend --no-cache
docker-compose up -d
```

### Issue: API calls going to wrong URL

**Symptoms:**
```
GET http://backend:5000/api/auth/login net::ERR_NAME_NOT_RESOLVED
```

**Solution:**
1. Frontend is trying to call backend using Docker service name
2. Check `VITE_API_URL` in docker-compose.yml should be `http://localhost:5000/api`
3. Rebuild frontend: `docker-compose build frontend`

### Issue: Environment variables not working

**Symptoms:**
- API calls go to wrong URL
- Config values are undefined

**Solution:**
```bash
# For Vite, env vars must start with VITE_
# Rebuild frontend to rebake env vars
docker-compose build frontend --no-cache
docker-compose up -d frontend
```

## Performance Issues

### Issue: Slow first startup

**Symptoms:**
- Takes 5+ minutes to start

**Solution:**
This is normal on first startup due to:
1. Downloading Docker images (postgres:16, node:20)
2. Installing npm dependencies
3. Running migrations
4. Seeding database

Subsequent startups will be much faster (30-60 seconds).

### Issue: High memory usage

**Symptoms:**
- Docker using lots of RAM

**Solution:**
```bash
# Clean up unused Docker resources
docker system prune -a
docker volume prune
```

## Authentication Issues

### Issue: Cannot login with provided credentials

**Symptoms:**
```
{"success": false, "message": "Invalid credentials"}
```

**Solution:**
1. Verify credentials match submission.json
2. Check if database was seeded: `docker-compose logs backend | grep "Seed completed"`
3. Try super admin login (no subdomain required):
   - Email: superadmin@system.com
   - Password: Admin@123
4. If still failing, reseed database:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

### Issue: Token expired error

**Symptoms:**
```
{"success": false, "message": "Token expired"}
```

**Solution:**
1. Tokens expire after 24 hours
2. Simply login again
3. Token is stored in localStorage, clear it if needed

## Development Issues

### Issue: Changes not reflecting

**Symptoms:**
- Code changes don't appear in running app

**Solution:**

For backend:
```bash
docker-compose restart backend
```

For frontend:
```bash
docker-compose restart frontend
```

For database schema changes:
```bash
docker-compose down
docker-compose up -d
```

### Issue: node_modules issues

**Symptoms:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

## Verification Steps

After fixing any issue, verify the system works:

```bash
# 1. Check all containers are running
docker-compose ps
# All should show "Up" status

# 2. Check health endpoint
curl http://localhost:5000/api/health
# Should return: {"success":true,"data":{"status":"ok","database":"connected"}}

# 3. Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "Demo@123",
    "tenantSubdomain": "demo"
  }'
# Should return token

# 4. Open frontend
open http://localhost:3000
# Should load login page
```

## Getting Help

If you're still experiencing issues:

1. Check the logs:
   ```bash
   docker-compose logs -f
   ```

2. Verify your environment:
   ```bash
   docker --version  # Should be 20+
   docker-compose --version  # Should be 2.x
   node --version  # Should be 20+
   ```

3. Clean slate (nuclear option):
   ```bash
   docker-compose down -v
   docker system prune -a
   docker volume prune
   ./start.sh
   ```

4. Check the documentation:
   - README.md - Setup instructions
   - docs/API.md - API reference
   - docs/API_EXAMPLES.md - Usage examples
   - CHANGELOG.md - Feature list
