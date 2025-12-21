# Research and Architecture Rationale

## 1. Multi-Tenancy Analysis (shared DB + shared schema chosen)

### Approaches Compared

| Approach | Description | Pros | Cons | Typical Fit |
| --- | --- | --- | --- | --- |
| Shared database, shared schema (tenant_id column) | All tenants in one DB and one schema; every row carries tenant_id; super_admin rows have tenant_id = NULL. | Lowest operational overhead; cheapest to run; simplest to scale vertically; easy to pool connections; easier migrations; single place to tune indexes; fastest to spin up new tenants. | Strong need for strict row-level isolation in code; noisy-neighbor risk on heavy tenants; backup/restore is coarse (per-DB, not per-tenant) unless you add logical export; compliance stories (per-tenant data residency) are harder. | Startups/SaaS with many small/medium tenants; when rapid onboarding matters; when ops budget is limited. |
| Shared database, separate schema per tenant | One DB per environment, but each tenant gets its own schema; tables duplicated per tenant. | Better blast-radius isolation than shared schema; per-tenant migrations possible; easier per-tenant logical backup/restore; can tune indexes per heavy tenant. | Schema sprawl (hundreds of schemas); migration orchestration complexity; connection pool pressure; harder to shard later; code must choose schema dynamically; ORM tooling may be awkward. | Mid-stage with few dozen large tenants; when per-tenant restores are frequent; when compliance requires softer isolation. |
| Separate database per tenant | Each tenant has its own DB instance; identical schema. | Strongest isolation; simplest story for residency/compliance; per-tenant scaling and upgrades; clear noisy-neighbor containment; independent backup/restore. | Operationally expensive; provisioning overhead; connection management; schema drift risk; cross-tenant analytics is harder; automation burden high; more costly in managed DB fees. | Enterprise contracts with strong isolation/SLA, low tenant count, high ARPU. |

### Chosen Approach: Shared DB + Shared Schema with tenant_id
We will use a single PostgreSQL database and single schema, with tenant_id on all tenant-bound tables, and tenant_id NULL only for super_admin users. Reasons:
- Operational simplicity: single migration path, single connection pool, easy to automate in Docker and CI.
- Cost efficiency: fewer resources, fits the requirement of a single compose stack.
- Developer speed: Prisma and Express integrate cleanly when tenant scoping is handled in middleware.
- Scalability: Horizontal sharding can be added later by hashing tenant_id if needed; the schema remains consistent.
- Requirement fit: The spec explicitly calls for tenant_id per record and super_admin exceptions.

### Data Isolation Strategy
- Enforce tenant scoping in middleware: inject tenantId and role from JWT, and apply tenant_id filters in every query except when role is super_admin.
- Never trust client-provided tenant_id: derive from JWT (or project lookup for tasks) to avoid cross-tenant writes.
- Composite uniqueness: (tenant_id, email) to permit the same email in different tenants.
- Indexes: tenant_id on every multi-tenant table; composite indexes where access paths need it (e.g., tasks on tenant_id, project_id).
- Audit logging: log actor tenant_id/user_id for every create/update/delete; retain logs even if entities are removed.

### Backup and Recovery Considerations
- Whole-DB backups (pg_dump/volume snapshots) to keep ops simple; for targeted restores, use logical export of a tenant by tenant_id filter if ever required.
- Migrations kept linear and tested in Docker so restore + migrate is deterministic.

### Noisy-Neighbor Mitigations
- Use connection pooling limits and request timeouts in Express.
- Add pragmatic indexes (tenant_id, status, search fields) to reduce lock contention.
- Consider rate limiting per tenant at the API layer if needed.

## 2. Technology Stack Justification

### Backend
- Node.js + Express: Minimal, well-known, perfect fit for the REST endpoints and custom middlewares for RBAC and tenant isolation. Large ecosystem for validation, JWT, and logging.
- Prisma ORM: Type-safe database access, migration tooling (Prisma Migrate), and seed script support. Works well with Postgres and keeps schema definitions centralized. Easier than raw SQL for most operations but still lets us drop to SQL when needed (indexes, constraints).
- JSON Web Tokens: Stateless auth with 24h expiry, aligning with the spec; avoids server-side session storage.

Alternatives considered: NestJS (heavier, more ceremony), TypeORM/Sequelize (less type safety or heavier runtime). Express + Prisma is faster to implement and easier to reason about for this scope.

### Database
- PostgreSQL: Mature, robust FK and transaction support, good JSON capabilities, strong index support, and standard choice for multi-tenant SaaS. Docker images are first-class. Alternatives like MySQL lack some Postgres niceties (CTEs, partial indexes) and the spec already leans to Postgres via ports and examples.

### Frontend
- Next.js (React-based): Modern, production-ready routing, good DX, and can host a single-page experience with client-side routing where needed. React itself is not deprecated; Next.js builds atop React and adds routing, bundling, and optimizations. We will treat it as a SPA-style dashboard (use client components where necessary) and keep all business APIs in the Express backend to avoid duplication.

Alternatives: Pure React SPA (CRA/Vite) is fine but Next.js offers better production defaults and routing. Other frameworks (Vue/Nuxt) are not requested and would add variability.

### Deployment and Containerization
- Docker + Docker Compose: Mandatory per requirements; easy single-command spin-up with database, backend, frontend on fixed ports (5432/5000/3000). Compose service names simplify inter-service networking (backend → database, frontend → backend).

### Authentication/Authorization
- JWT with bcrypt-hashed passwords; payload limited to {userId, tenantId, role}. Super admins have tenantId null. RBAC enforced in middleware before handlers.

### Validation and Error Handling
- Request validation via a middleware library (e.g., zod/express-validator); centralized error handler to return {success, message, data?} with correct HTTP status codes.

### Logging and Auditing
- Application logs via console in JSON-ish format for simplicity; audit_logs table for critical actions with tenant_id/user_id and entity references.

### Why This Stack Fits the Requirements
- Meets fixed-port Docker triad, works with Postgres, supports JWT auth, easy to enforce tenant_id scoping, and fast to deliver the 19 endpoints plus responsive frontend pages.

## 3. Security Considerations

### Data Isolation and Access Control
- Mandatory tenant_id filters on all tenant-bound queries, derived from JWT (or project → tenant for tasks). Super admin bypasses tenant filter but still authenticated.
- Role checks per endpoint: super_admin for cross-tenant ops; tenant_admin for tenant-scoped management; users limited to their own scope.

### Authentication and Password Safety
- Passwords hashed with bcrypt (sufficient for the use case) with appropriate salt rounds (10–12). No plain text storage. JWT expiry 24h; refresh is out of scope per spec.
- Tokens signed with strong secret from environment variables; no sensitive data inside JWT payload.

### Input Validation and API Hardening
- Validate body/query/params types and enums (roles, status, priority). Reject malformed subdomains and enforce length/format rules. Uniform error responses with proper status codes (400/401/403/404/409).
- CORS restricted to configured FRONTEND_URL (http://frontend:3000 in Docker, localhost in dev). Credentials allowed only as needed.

### Least Privilege and Mutations
- Tenant admins cannot change subscriptionPlan/status/maxUsers/maxProjects; only super admins can. Users can only edit limited self fields. Prevent self-delete for tenant_admin.
- Before user/project creation, enforce subscription limits read from tenant record.

### Auditability and Monitoring
- Insert audit_logs on create/update/delete operations, including tenant_id, user_id, action, entity_type/id, timestamp. Keep logs even if entities are removed to preserve history.
- Health check /api/health returns database status; used by Compose healthcheck.

### Transport and Secrets
- In local/Docker scope, HTTP is acceptable; for production, front a TLS terminator. All secrets (DB, JWT) come from env (committed dev values only to meet evaluation). No secrets hardcoded.

### Database Integrity
- Foreign keys with ON DELETE CASCADE where appropriate (projects/tasks, tenant/users); UNIQUE(tenant_id,email); NOT NULL where required; enums for statuses/roles/plans to constrain values. Index tenant_id and frequent filters to reduce lock contention under load.

### Session Handling
- JWT-only (stateless) to reduce server-side attack surface. Logout is client-side token drop (optionally audit-log the event). Optional sessions table is skipped per spec allowance.

### Rate Limiting and DoS (pragmatic)
- Basic request size limits on Express (body-parser). Optional rate limiting middleware can be added if needed; not required for MVP but planned for resilience.

### Dependency and Build Security
- Pin node and package versions in Docker; run npm ci in containers; avoid dev secrets; keep Prisma migrations committed for reproducibility.
