# Architecture

## 1. System Architecture Diagram
High-level components and flows:
- Client (Browser)
- Frontend (Next.js)
- Backend API (Express.js)
- Database (PostgreSQL)
- Authentication (JWT)

See diagram: [docs/images/system-architecture.png](docs/images/system-architecture.png)

Flow summary:
- Frontend calls Backend over HTTP with Bearer JWT.
- Backend validates JWT, applies RBAC and tenant isolation.
- Backend queries Postgres, always filtering by tenant_id (except super_admin).
- Audit logs recorded on create/update/delete.

## 2. Database Schema Design (ERD)
Core tables and relationships:
- tenants (1) —< users, projects, tasks, audit_logs
- users (many) linked to tenants; super_admin users have tenant_id = NULL
- projects (many) linked to tenants and created_by users
- tasks (many) linked to projects and tenants; assigned_to optional users
- audit_logs linked to tenants and optionally users

See ERD: [docs/images/database-erd.png](docs/images/database-erd.png)

Key constraints and indexes:
- Composite unique: users(tenant_id, email)
- Foreign keys with ON DELETE CASCADE where appropriate
- Indexes on tenant_id for users, projects, tasks; composite index on tasks(tenant_id, project_id)

## 3. API Architecture (Endpoints, Auth & Roles)
All responses use {success, message?, data?}. Proper HTTP codes per spec.

### Auth
- POST /api/auth/register-tenant — Public, creates tenant + admin in a transaction
- POST /api/auth/login — Public; returns JWT (24h)
- GET /api/auth/me — Auth required; returns user + tenant info
- POST /api/auth/logout — Auth required; JWT-only acknowledgment

### Tenants
- GET /api/tenants/:tenantId — Auth; user must belong or super_admin
- PUT /api/tenants/:tenantId — Auth; tenant_admin (name only) or super_admin (status/plan/limits)
- GET /api/tenants — Auth; super_admin only, with pagination and filters

### Users
- POST /api/tenants/:tenantId/users — Auth; tenant_admin only; enforces max_users
- GET /api/tenants/:tenantId/users — Auth; same-tenant access; search/filter/paginate
- PUT /api/users/:userId — Auth; self (fullName) or tenant_admin (role, isActive)
- DELETE /api/users/:userId — Auth; tenant_admin only; cannot delete self; handle tasks assignment

### Projects
- POST /api/projects — Auth; create within max_projects
- GET /api/projects — Auth; same-tenant; search/status/paginate; include creator and task stats
- PUT /api/projects/:projectId — Auth; tenant_admin or creator
- DELETE /api/projects/:projectId — Auth; tenant_admin or creator; cascade tasks or handle FK

### Tasks
- POST /api/projects/:projectId/tasks — Auth; derive tenant from project; validate assigned user
- GET /api/projects/:projectId/tasks — Auth; filters: status, assignedTo, priority, search; sort; paginate
- PATCH /api/tasks/:taskId/status — Auth; any same-tenant user can update
- PUT /api/tasks/:taskId — Auth; update fields with tenant checks; allow unassign

### Health
- GET /api/health — Public; returns {status, database}

### Authorization and Isolation Notes
- Super Admin: role 'super_admin', tenantId null; can access across tenants.
- Tenant Admin: scoped to their tenant; can manage users/projects/tasks; limited tenant updates (name only).
- User: scoped to their tenant; can manage own profile and tasks.
- Isolation: Always filter queries by tenant_id from JWT; for tasks, derive tenant_id from the project record.
