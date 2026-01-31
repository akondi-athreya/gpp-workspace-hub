# API Usage Examples

This document provides practical examples for using the Workspace Hub API.

## Authentication

### Register a New Tenant

```bash
curl -X POST http://localhost:5000/api/auth/register-tenant \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Acme Corporation",
    "subdomain": "acme",
    "adminEmail": "admin@acme.com",
    "adminPassword": "SecurePass@123",
    "adminFullName": "John Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "subdomain": "acme",
    "adminUser": {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "email": "admin@acme.com",
      "fullName": "John Doe",
      "role": "tenant_admin"
    }
  }
}
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "Demo@123",
    "tenantSubdomain": "demo"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "admin@demo.com",
      "fullName": "Demo Admin",
      "role": "tenant_admin",
      "tenantId": "tenant-id"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

### Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Management

### Create Project

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign",
    "description": "Complete redesign of company website"
  }'
```

### List Projects

```bash
# List all projects
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/projects?status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search by name
curl -X GET "http://localhost:5000/api/projects?search=website" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Project

```bash
curl -X PUT http://localhost:5000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Project Name",
    "status": "archived"
  }'
```

### Delete Project

```bash
curl -X DELETE http://localhost:5000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Task Management

### Create Task

```bash
curl -X POST http://localhost:5000/api/projects/PROJECT_ID/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design homepage mockup",
    "description": "Create high-fidelity mockup",
    "priority": "high",
    "assignedTo": "USER_ID",
    "dueDate": "2024-07-15"
  }'
```

### List Tasks for Project

```bash
# List all tasks
curl -X GET http://localhost:5000/api/projects/PROJECT_ID/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/projects/PROJECT_ID/tasks?status=in_progress" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by assigned user
curl -X GET "http://localhost:5000/api/projects/PROJECT_ID/tasks?assignedTo=USER_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Task Status

```bash
curl -X PATCH http://localhost:5000/api/tasks/TASK_ID/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

### Update Task

```bash
curl -X PUT http://localhost:5000/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated task title",
    "priority": "high",
    "dueDate": "2024-08-01"
  }'
```

## User Management

### Add User to Tenant

```bash
curl -X POST http://localhost:5000/api/tenants/TENANT_ID/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@demo.com",
    "password": "NewUser@123",
    "fullName": "New User",
    "role": "user"
  }'
```

### List Tenant Users

```bash
# List all users
curl -X GET http://localhost:5000/api/tenants/TENANT_ID/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search users
curl -X GET "http://localhost:5000/api/tenants/TENANT_ID/users?search=john" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by role
curl -X GET "http://localhost:5000/api/tenants/TENANT_ID/users?role=user" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update User

```bash
curl -X PUT http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Name",
    "role": "tenant_admin"
  }'
```

### Delete User

```bash
curl -X DELETE http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Tenant Management

### Get Tenant Details

```bash
curl -X GET http://localhost:5000/api/tenants/TENANT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Tenant

```bash
# Tenant admin (can only update name)
curl -X PUT http://localhost:5000/api/tenants/TENANT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Company Name"
  }'

# Super admin (can update all fields)
curl -X PUT http://localhost:5000/api/tenants/TENANT_ID \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Company Name",
    "status": "active",
    "subscriptionPlan": "enterprise",
    "maxUsers": 100,
    "maxProjects": 50
  }'
```

### List All Tenants (Super Admin Only)

```bash
# List all tenants
curl -X GET http://localhost:5000/api/tenants \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN"

# With pagination
curl -X GET "http://localhost:5000/api/tenants?page=1&limit=10" \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/tenants?status=active" \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN"

# Filter by plan
curl -X GET "http://localhost:5000/api/tenants?subscriptionPlan=pro" \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN"
```

## Health Check

```bash
curl -X GET http://localhost:5000/api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected"
  }
}
```

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## Using Environment Variables

For convenience, set your token as an environment variable:

```bash
export TOKEN="your_jwt_token_here"

# Then use it in requests
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```
