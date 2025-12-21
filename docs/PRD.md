# Product Requirements Document (PRD)

Project: Multi-Tenant SaaS Platform - Project & Task Management System

## 1. User Personas

### Super Admin
- Role: System-level administrator managing the entire platform across all tenants.
- Responsibilities: Oversee tenants; update subscription plans/status/limits; view system-wide metrics; enforce policies.
- Goals: Maintain platform health, ensure compliance, manage growth and tenant lifecycle.
- Pain Points: Prevent data isolation breaches; avoid manual per-tenant operations; need clear auditability.

### Tenant Admin
- Role: Organization administrator for a specific tenant.
- Responsibilities: Manage users (invite, activate/deactivate, assign roles), manage projects and tasks, view tenant dashboards, update tenant name.
- Goals: Efficient team onboarding, visibility into projects/tasks, enforce tenant policies, ensure subscription limits are respected.
- Pain Points: Hitting plan limits unexpectedly; preventing unauthorized changes to subscription fields; handling task/user lifecycle cleanly.

### End User
- Role: Regular team member within a tenant.
- Responsibilities: Work on assigned tasks, update task statuses, view projects, manage personal profile details (e.g., full name).
- Goals: Simple, fast access to tasks and projects; minimal friction updating work items; clear visibility of priorities and due dates.
- Pain Points: Confusing permissions; poor mobile experience; slow pages under load.

## 2. Functional Requirements (FR)
Format: "The system shall …" Organized by modules. Numbered FR-001+.

### Auth
- FR-001: The system shall allow tenant registration with a unique subdomain.
- FR-002: The system shall create the tenant admin user during registration in a single transaction.
- FR-003: The system shall authenticate users via JWT with 24-hour expiry.
- FR-004: The system shall allow login using email, password, and tenant subdomain, validating tenant status.
- FR-005: The system shall expose an endpoint to retrieve the current authenticated user and their tenant info.
- FR-006: The system shall implement logout behavior for JWT-only by acknowledging success (client removes token).

### Tenant
- FR-007: The system shall provide tenant details retrieval for users belonging to that tenant or super admin.
- FR-008: The system shall allow tenant admins to update only the tenant name.
- FR-009: The system shall allow super admins to update tenant status, subscription plan, max_users, and max_projects.
- FR-010: The system shall list all tenants with pagination and filtering (super admin only).
- FR-011: The system shall enforce data isolation so users cannot access other tenants’ data.

### User
- FR-012: The system shall allow tenant admins to add users within subscription limits.
- FR-013: The system shall ensure user email uniqueness per tenant via a composite unique constraint (tenant_id, email).
- FR-014: The system shall list users within the tenant with search, filter by role, and pagination.
- FR-015: The system shall allow users to update their own full name.
- FR-016: The system shall allow tenant admins to update user role and active status.
- FR-017: The system shall prevent tenant admins from deleting their own account.
- FR-018: The system shall unassign tasks or cascade appropriately when a user is deleted.

### Project
- FR-019: The system shall allow authenticated users to create projects within tenant project limits (uses JWT tenantId).
- FR-020: The system shall list projects filtered by tenant, with search, status filter, pagination, and creator info.
- FR-021: The system shall update project fields (name, description, status) by tenant admin or the project creator.
- FR-022: The system shall delete projects by tenant admin or the project creator, handling dependent tasks.

### Task
- FR-023: The system shall create tasks under a project, deriving tenant_id from the project (not JWT), validating assigned user belongs to same tenant.
- FR-024: The system shall list tasks by project with filters (status, assignedTo, priority), search, pagination, and sorting.
- FR-025: The system shall allow any user in the tenant to update task status.
- FR-026: The system shall allow updating task fields (title, description, status, priority, assignedTo, dueDate) with tenant checks; assignedTo may be null to unassign.

### System & Logging
- FR-027: The system shall provide a health check endpoint reporting API status and database connectivity.
- FR-028: The system shall log audit events for create, update, and delete operations, including actor user_id and tenant_id.
- FR-029: The system shall return consistent API responses in the format {success, message?, data?}.

## 3. Non-Functional Requirements (NFR)
Format: "The system shall …" Numbered NFR-001+.

### Performance
- NFR-001: The system shall achieve API response times < 200ms for 90% of requests under nominal load.
- NFR-002: The system shall index tenant_id and frequently filtered fields to optimize query performance.

### Security
- NFR-003: The system shall hash all passwords using bcrypt with appropriate salt rounds (10–12).
- NFR-004: The system shall limit JWT payload to non-sensitive fields (userId, tenantId, role) and set expiry to 24 hours.
- NFR-005: The system shall validate all inputs (body, params, query) and reject invalid data with correct status codes.

### Scalability
- NFR-006: The system shall support a minimum of 100 concurrent users with acceptable performance.
- NFR-007: The system shall be designed to scale horizontally by sharding or partitioning on tenant_id if required.

### Availability
- NFR-008: The system shall target 99% uptime in development environments and provide health checks for orchestration.

### Usability
- NFR-009: The system shall provide a responsive frontend experience for desktop and mobile devices.
- NFR-010: The system shall provide clear error messages and loading states across the UI.

## 4. Constraints and Compliance
- The system shall use Docker Compose with three services (database, backend, frontend) on fixed ports: 5432, 5000, 3000.
- The system shall automatically run migrations and seed data on startup without manual commands.
- The system shall use service names for inter-service communication (http://backend:5000, http://frontend:3000, database host "database").

## 5. Dependencies and Assumptions
- PostgreSQL as database; Prisma ORM; Express.js backend; Next.js frontend; JWT for auth; bcrypt for password hashing.
- CORS configured to allow requests from configured FRONTEND_URL.
- Audit logs retained even after entity deletion for historical integrity.
