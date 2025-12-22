# Workspace Hub - Complete API Documentation

Complete reference for all 20 API endpoints in the Workspace Hub platform. All endpoints use JSON for request and response bodies with standard HTTP status codes.

## Table of Contents
- [Authentication](#authentication)
- [Tenant Management](#tenant-management)
- [User Management](#user-management)
- [Project Management](#project-management)
- [Task Management](#task-management)
- [Response Format](#response-format)
- [Error Codes](#error-codes)

---

## Authentication

### Register Tenant

Create a new tenant account and register the first admin user.

**Endpoint**: `POST /api/auth/register-tenant`

**Authentication**: None (Public endpoint)

**Request Body**:
```json
{
  "subdomain": "acme",
  "tenantName": "ACME Corporation",
  "adminEmail": "admin@acme.com",
  "adminPassword": "SecurePass@123",
  "fullName": "John Doe"
}
```

**Field Requirements**:
- `subdomain`: 3-50 alphanumeric characters, lowercase, unique
- `tenantName`: 1-100 characters
- `adminEmail`: Valid email format, unique
- `adminPassword`: Minimum 8 characters
- `fullName`: 1-100 characters

**Success Response** (201):
```json
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenant": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "subdomain": "acme",
      "name": "ACME Corporation",
      "maxUsers": 5,
      "maxProjects": 3,
      "createdAt": "2025-12-22T09:30:00Z"
    },
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "email": "admin@acme.com",
      "fullName": "John Doe",
      "role": "tenant_admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:
- 400: Invalid input (subdomain/email already exists, password too weak)
- 409: Conflict (subdomain or email already registered)

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/auth/register-tenant \
  -H "Content-Type: application/json" \
  -d '{
    "subdomain": "acme",
    "tenantName": "ACME Corporation",
    "adminEmail": "admin@acme.com",
    "adminPassword": "SecurePass@123",
    "fullName": "John Doe"
  }'
```

---

### Login

Authenticate a user and retrieve JWT token.

**Endpoint**: `POST /api/auth/login`

**Authentication**: None (Public endpoint)

**Request Body**:
```json
{
  "email": "admin@acme.com",
  "password": "SecurePass@123"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "email": "admin@acme.com",
      "fullName": "John Doe",
      "role": "tenant_admin",
      "tenantId": "550e8400-e29b-41d4-a716-446655440000"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDEiLCJlbWFpbCI6ImFkbWluQGFjbWUuY29tIiwicm9sZSI6InRlbmFudF9hZG1pbiIsInRlbmFudElkIjoiNTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAwIiwiaWF0IjoxNjcxNzAxODAwLCJleHAiOjE2NzE3ODgyMDB9.signature"
  }
}
```

**Error Responses**:
- 400: Invalid input (missing email or password)
- 401: Invalid credentials (user not found or wrong password)

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@acme.com",
    "password": "SecurePass@123"
  }'
```

---

### Get Current User

Retrieve authenticated user's profile information.

**Endpoint**: `GET /api/auth/me`

**Authentication**: Required (Bearer Token)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "email": "admin@acme.com",
      "fullName": "John Doe",
      "role": "tenant_admin",
      "tenantId": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

**Error Responses**:
- 401: Unauthorized (missing or invalid token)

**Example cURL**:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Logout

Invalidate the current session (client-side token removal).

**Endpoint**: `POST /api/auth/logout`

**Authentication**: Required (Bearer Token)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body**: Empty or `{}`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Responses**:
- 401: Unauthorized (missing or invalid token)

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

---

## Tenant Management

### Get Tenant Details

Retrieve tenant information.

**Endpoint**: `GET /api/tenants/:tenantId`

**Authentication**: Required (Bearer Token)

**Authorization**: Authenticated users (can only access their own tenant)

**URL Parameters**:
- `tenantId`: UUID of the tenant

**Success Response** (200):
```json
{
  "success": true,
  "message": "Tenant retrieved successfully",
  "data": {
    "tenant": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "subdomain": "acme",
      "name": "ACME Corporation",
      "maxUsers": 25,
      "maxProjects": 15,
      "createdAt": "2025-12-22T09:30:00Z",
      "updatedAt": "2025-12-22T10:00:00Z"
    }
  }
}
```

**Error Responses**:
- 401: Unauthorized (missing token)
- 403: Forbidden (user doesn't belong to this tenant)
- 404: Tenant not found

**Example cURL**:
```bash
curl -X GET http://localhost:5000/api/tenants/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Update Tenant

Modify tenant subscription limits and basic information.

**Endpoint**: `PUT /api/tenants/:tenantId`

**Authentication**: Required (Bearer Token)

**Authorization**: `tenant_admin` or `super_admin` only

**URL Parameters**:
- `tenantId`: UUID of the tenant

**Request Body**:
```json
{
  "name": "ACME Corp Updated",
  "maxUsers": 50,
  "maxProjects": 25
}
```

**Field Requirements**:
- `name`: 1-100 characters (optional)
- `maxUsers`: Positive integer (optional)
- `maxProjects`: Positive integer (optional)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Tenant updated successfully",
  "data": {
    "tenant": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "subdomain": "acme",
      "name": "ACME Corp Updated",
      "maxUsers": 50,
      "maxProjects": 25,
      "updatedAt": "2025-12-22T11:00:00Z"
    }
  }
}
```

**Error Responses**:
- 400: Invalid input
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 404: Tenant not found

**Example cURL**:
```bash
curl -X PUT http://localhost:5000/api/tenants/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ACME Corp Updated",
    "maxUsers": 50,
    "maxProjects": 25
  }'
```

---

### List All Tenants

Retrieve list of all tenants (super_admin only).

**Endpoint**: `GET /api/tenants`

**Authentication**: Required (Bearer Token)

**Authorization**: `super_admin` only

**Query Parameters**:
- `limit`: Results per page (default: 10, max: 100)
- `offset`: Skip N records (default: 0)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Tenants retrieved successfully",
  "data": {
    "tenants": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "subdomain": "acme",
        "name": "ACME Corporation",
        "maxUsers": 25,
        "maxProjects": 15,
        "createdAt": "2025-12-22T09:30:00Z"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "subdomain": "techcorp",
        "name": "TechCorp",
        "maxUsers": 50,
        "maxProjects": 30,
        "createdAt": "2025-12-23T10:00:00Z"
      }
    ],
    "total": 2,
    "limit": 10,
    "offset": 0
  }
}
```

**Error Responses**:
- 401: Unauthorized
- 403: Forbidden (not super_admin)

**Example cURL**:
```bash
curl -X GET "http://localhost:5000/api/tenants?limit=10&offset=0" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## User Management

### Add User to Tenant

Create a new user in the tenant (admin only).

**Endpoint**: `POST /api/users`

**Authentication**: Required (Bearer Token)

**Authorization**: `tenant_admin` or `super_admin` only

**Request Body**:
```json
{
  "email": "newuser@acme.com",
  "password": "UserPass@123",
  "fullName": "Jane Smith",
  "role": "user"
}
```

**Field Requirements**:
- `email`: Valid email, unique per tenant
- `password`: Minimum 8 characters
- `fullName`: 1-100 characters
- `role`: "user" or "tenant_admin"

**Success Response** (201):
```json
{
  "success": true,
  "message": "User added successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "email": "newuser@acme.com",
      "fullName": "Jane Smith",
      "role": "user",
      "tenantId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2025-12-22T12:00:00Z"
    }
  }
}
```

**Error Responses**:
- 400: Invalid input
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 409: User limit exceeded (subscription limit)

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@acme.com",
    "password": "UserPass@123",
    "fullName": "Jane Smith",
    "role": "user"
  }'
```

---

### List Tenant Users

Retrieve all users in the tenant.

**Endpoint**: `GET /api/users`

**Authentication**: Required (Bearer Token)

**Authorization**: `tenant_admin` or `super_admin` only

**Query Parameters**:
- `limit`: Results per page (default: 10)
- `offset`: Skip N records (default: 0)
- `search`: Filter by email or fullName

**Success Response** (200):
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "email": "admin@acme.com",
        "fullName": "John Doe",
        "role": "tenant_admin",
        "createdAt": "2025-12-22T09:30:00Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "email": "jane@acme.com",
        "fullName": "Jane Smith",
        "role": "user",
        "createdAt": "2025-12-22T12:00:00Z"
      }
    ],
    "total": 2,
    "limit": 10,
    "offset": 0
  }
}
```

**Error Responses**:
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)

**Example cURL**:
```bash
curl -X GET "http://localhost:5000/api/users?limit=10&offset=0&search=john" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Update User

Modify user information.

**Endpoint**: `PUT /api/users/:userId`

**Authentication**: Required (Bearer Token)

**Authorization**: User can update own profile; `tenant_admin` can update any user in tenant

**URL Parameters**:
- `userId`: UUID of the user

**Request Body**:
```json
{
  "email": "newemail@acme.com",
  "fullName": "Jane Smith Updated",
  "role": "tenant_admin"
}
```

**Field Requirements** (all optional):
- `email`: Valid email, unique per tenant
- `fullName`: 1-100 characters
- `role`: "user" or "tenant_admin" (admin only)

**Success Response** (200):
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "email": "newemail@acme.com",
      "fullName": "Jane Smith Updated",
      "role": "tenant_admin",
      "updatedAt": "2025-12-22T13:00:00Z"
    }
  }
}
```

**Error Responses**:
- 400: Invalid input
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 404: User not found

**Example cURL**:
```bash
curl -X PUT http://localhost:5000/api/users/550e8400-e29b-41d4-a716-446655440002 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@acme.com",
    "fullName": "Jane Smith Updated"
  }'
```

---

### Delete User

Remove a user from the tenant.

**Endpoint**: `DELETE /api/users/:userId`

**Authentication**: Required (Bearer Token)

**Authorization**: `tenant_admin` or `super_admin` only

**URL Parameters**:
- `userId`: UUID of the user

**Success Response** (200):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses**:
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 404: User not found

**Example cURL**:
```bash
curl -X DELETE http://localhost:5000/api/users/550e8400-e29b-41d4-a716-446655440002 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Project Management

### Create Project

Create a new project in the tenant.

**Endpoint**: `POST /api/projects`

**Authentication**: Required (Bearer Token)

**Authorization**: Authenticated users (all roles)

**Request Body**:
```json
{
  "name": "Website Redesign",
  "description": "Complete redesign of company website",
  "status": "in-progress"
}
```

**Field Requirements**:
- `name`: 1-200 characters, required
- `description`: 0-1000 characters, optional
- `status`: "not-started", "in-progress", or "completed", optional (default: "not-started")

**Success Response** (201):
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Website Redesign",
      "description": "Complete redesign of company website",
      "status": "in-progress",
      "createdBy": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "fullName": "John Doe"
      },
      "tenantId": "550e8400-e29b-41d4-a716-446655440000",
      "taskCount": 0,
      "completedTaskCount": 0,
      "createdAt": "2025-12-22T14:00:00Z"
    }
  }
}
```

**Error Responses**:
- 400: Invalid input
- 401: Unauthorized
- 409: Project limit exceeded (subscription limit)

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign",
    "description": "Complete redesign of company website",
    "status": "in-progress"
  }'
```

---

### List Projects

Retrieve all projects in the tenant.

**Endpoint**: `GET /api/projects`

**Authentication**: Required (Bearer Token)

**Authorization**: Authenticated users (all roles)

**Query Parameters**:
- `limit`: Results per page (default: 10)
- `offset`: Skip N records (default: 0)
- `status`: Filter by status ("not-started", "in-progress", "completed")
- `search`: Filter by name or description

**Success Response** (200):
```json
{
  "success": true,
  "message": "Projects retrieved successfully",
  "data": {
    "projects": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "name": "Website Redesign",
        "description": "Complete redesign of company website",
        "status": "in-progress",
        "createdBy": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "fullName": "John Doe"
        },
        "taskCount": 5,
        "completedTaskCount": 2,
        "createdAt": "2025-12-22T14:00:00Z"
      }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

**Error Responses**:
- 401: Unauthorized

**Example cURL**:
```bash
curl -X GET "http://localhost:5000/api/projects?limit=10&status=in-progress" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Update Project

Modify project information.

**Endpoint**: `PUT /api/projects/:projectId`

**Authentication**: Required (Bearer Token)

**Authorization**: Project creator or `tenant_admin`

**URL Parameters**:
- `projectId`: UUID of the project

**Request Body**:
```json
{
  "name": "Website Redesign v2",
  "description": "Updated website redesign",
  "status": "completed"
}
```

**Field Requirements** (all optional):
- `name`: 1-200 characters
- `description`: 0-1000 characters
- `status`: "not-started", "in-progress", or "completed"

**Success Response** (200):
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "project": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Website Redesign v2",
      "description": "Updated website redesign",
      "status": "completed",
      "updatedAt": "2025-12-22T15:00:00Z"
    }
  }
}
```

**Error Responses**:
- 400: Invalid input
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 404: Project not found

**Example cURL**:
```bash
curl -X PUT http://localhost:5000/api/projects/550e8400-e29b-41d4-a716-446655440003 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign v2",
    "status": "completed"
  }'
```

---

### Delete Project

Remove a project (and all associated tasks).

**Endpoint**: `DELETE /api/projects/:projectId`

**Authentication**: Required (Bearer Token)

**Authorization**: Project creator or `tenant_admin`

**URL Parameters**:
- `projectId`: UUID of the project

**Success Response** (200):
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Error Responses**:
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 404: Project not found

**Example cURL**:
```bash
curl -X DELETE http://localhost:5000/api/projects/550e8400-e29b-41d4-a716-446655440003 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Task Management

### Create Task

Create a new task in a project.

**Endpoint**: `POST /api/projects/:projectId/tasks`

**Authentication**: Required (Bearer Token)

**Authorization**: Authenticated users; project must belong to user's tenant

**URL Parameters**:
- `projectId`: UUID of the project

**Request Body**:
```json
{
  "title": "Design homepage mockup",
  "description": "Create design mockup for new homepage",
  "assignedTo": "550e8400-e29b-41d4-a716-446655440002",
  "priority": "high",
  "dueDate": "2025-12-30T18:00:00Z"
}
```

**Field Requirements**:
- `title`: 1-200 characters, required
- `description`: 0-1000 characters, optional
- `assignedTo`: UUID of tenant user, optional
- `priority`: "low", "medium", "high", optional (default: "medium")
- `dueDate`: ISO 8601 datetime, optional

**Success Response** (201):
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "projectId": "550e8400-e29b-41d4-a716-446655440003",
      "title": "Design homepage mockup",
      "description": "Create design mockup for new homepage",
      "status": "not-started",
      "priority": "high",
      "assignedTo": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "fullName": "Jane Smith"
      },
      "dueDate": "2025-12-30T18:00:00Z",
      "createdAt": "2025-12-22T16:00:00Z"
    }
  }
}
```

**Error Responses**:
- 400: Invalid input
- 401: Unauthorized
- 404: Project not found

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/projects/550e8400-e29b-41d4-a716-446655440003/tasks \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design homepage mockup",
    "description": "Create design mockup for new homepage",
    "priority": "high",
    "dueDate": "2025-12-30T18:00:00Z"
  }'
```

---

### List Tasks

Retrieve all tasks in a project.

**Endpoint**: `GET /api/projects/:projectId/tasks`

**Authentication**: Required (Bearer Token)

**Authorization**: Authenticated users; project must belong to user's tenant

**URL Parameters**:
- `projectId`: UUID of the project

**Query Parameters**:
- `limit`: Results per page (default: 20)
- `offset`: Skip N records (default: 0)
- `status`: Filter by status ("not-started", "in-progress", "completed")
- `priority`: Filter by priority ("low", "medium", "high")
- `assignedTo`: Filter by assignee UUID

**Success Response** (200):
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440004",
        "projectId": "550e8400-e29b-41d4-a716-446655440003",
        "title": "Design homepage mockup",
        "description": "Create design mockup for new homepage",
        "status": "in-progress",
        "priority": "high",
        "assignedTo": {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "fullName": "Jane Smith"
        },
        "dueDate": "2025-12-30T18:00:00Z",
        "createdAt": "2025-12-22T16:00:00Z"
      }
    ],
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

**Error Responses**:
- 401: Unauthorized
- 404: Project not found

**Example cURL**:
```bash
curl -X GET "http://localhost:5000/api/projects/550e8400-e29b-41d4-a716-446655440003/tasks?status=in-progress" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Update Task

Modify task information.

**Endpoint**: `PUT /api/tasks/:taskId`

**Authentication**: Required (Bearer Token)

**Authorization**: Task assignee, project creator, or `tenant_admin`

**URL Parameters**:
- `taskId`: UUID of the task

**Request Body**:
```json
{
  "title": "Design homepage mockup - Updated",
  "description": "Updated description",
  "assignedTo": "550e8400-e29b-41d4-a716-446655440001",
  "priority": "medium",
  "dueDate": "2025-12-31T18:00:00Z"
}
```

**Field Requirements** (all optional):
- `title`: 1-200 characters
- `description`: 0-1000 characters
- `assignedTo`: UUID of tenant user
- `priority`: "low", "medium", "high"
- `dueDate`: ISO 8601 datetime

**Success Response** (200):
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "task": {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "title": "Design homepage mockup - Updated",
      "priority": "medium",
      "updatedAt": "2025-12-22T17:00:00Z"
    }
  }
}
```

**Error Responses**:
- 400: Invalid input
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 404: Task not found

**Example cURL**:
```bash
curl -X PUT http://localhost:5000/api/tasks/550e8400-e29b-41d4-a716-446655440004 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design homepage mockup - Updated",
    "priority": "medium"
  }'
```

---

### Update Task Status

Update only the status of a task.

**Endpoint**: `PATCH /api/tasks/:taskId/status`

**Authentication**: Required (Bearer Token)

**Authorization**: Task assignee, project creator, or `tenant_admin`

**URL Parameters**:
- `taskId`: UUID of the task

**Request Body**:
```json
{
  "status": "completed"
}
```

**Field Requirements**:
- `status`: "not-started", "in-progress", or "completed", required

**Success Response** (200):
```json
{
  "success": true,
  "message": "Task status updated successfully",
  "data": {
    "task": {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "status": "completed",
      "updatedAt": "2025-12-22T18:00:00Z"
    }
  }
}
```

**Error Responses**:
- 400: Invalid input (invalid status value)
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 404: Task not found

**Example cURL**:
```bash
curl -X PATCH http://localhost:5000/api/tasks/550e8400-e29b-41d4-a716-446655440004/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

---

### Delete Task

Remove a task from a project.

**Endpoint**: `DELETE /api/tasks/:taskId`

**Authentication**: Required (Bearer Token)

**Authorization**: Task creator (via project), project creator, or `tenant_admin`

**URL Parameters**:
- `taskId`: UUID of the task

**Success Response** (200):
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Error Responses**:
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 404: Task not found

**Example cURL**:
```bash
curl -X DELETE http://localhost:5000/api/tasks/550e8400-e29b-41d4-a716-446655440004 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Response Format

All API responses follow a consistent JSON format:

### Success Response (2xx)
```json
{
  "success": true,
  "message": "Description of what was successful",
  "data": {
    "field": "value",
    // Response data specific to the endpoint
  }
}
```

### Error Response (4xx/5xx)
```json
{
  "success": false,
  "message": "Error description"
  // Note: No 'data' field in error responses
}
```

---

## Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid input, missing required fields, invalid format |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Valid token but insufficient permissions (authorization failure) |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Constraint violation (duplicate email, subscription limit exceeded) |
| 500 | Server Error | Internal server error |

### Common Error Messages

| Message | Cause |
|---------|-------|
| "Invalid credentials" | User not found or wrong password |
| "Subdomain already registered" | Subdomain taken by another tenant |
| "Email already exists" | Email already in use in this tenant |
| "Password must be at least 8 characters" | Password too short |
| "Subscription limit exceeded" | User or project limit reached |
| "Unauthorized access" | Missing JWT token |
| "Access denied" | Token valid but user lacks permissions |
| "Resource not found" | Record doesn't exist |

---

## JWT Token Format

All authenticated requests require a Bearer token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Token Payload
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "email": "user@example.com",
  "role": "tenant_admin",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "iat": 1703255400,
  "exp": 1703341800
}
```

- **iat** (issued at): Token creation timestamp
- **exp** (expiration): Token expiry timestamp (24 hours after creation)
- Tokens cannot be revoked; logout is client-side (remove token from storage)

---

## Rate Limiting

Currently, the API does not enforce rate limiting. In production, consider implementing:
- 100 requests per minute per IP
- 1000 requests per hour per user
- 500 requests per minute for authentication endpoints

---

## API Versioning

Current version: **v1**

All endpoints are under `/api/` path. Future versions (v2, v3) will be `/api/v2/`, `/api/v3/`, etc.

---

**Last Updated**: December 2025
**API Version**: 1.0
**Status**: Production Ready
