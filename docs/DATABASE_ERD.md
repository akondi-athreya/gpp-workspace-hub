# Database Entity Relationship Diagram (ERD)

Complete database schema documentation for Workspace Hub with all tables, relationships, constraints, and data isolation strategies.

## Table of Contents
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Table Definitions](#table-definitions)
- [Relationships](#relationships)
- [Indices](#indices)
- [Constraints](#constraints)
- [Data Isolation Strategy](#data-isolation-strategy)
- [Query Patterns](#query-patterns)
- [Backup & Recovery](#backup--recovery)
- [Scaling Considerations](#scaling-considerations)

---

## Entity Relationship Diagram

```
┌──────────────────────┐
│      TENANTS         │
├──────────────────────┤
│ id (PK, UUID)        │
│ subdomain (UNIQUE)   │
│ name                 │
│ maxUsers             │◄────────────────────┐
│ maxProjects          │◄─────────┐          │
│ createdAt            │          │          │
│ updatedAt            │          │          │
└──────────────────────┘          │          │
         │                        │          │
         │1:N                      │          │
         │                        │          │
         ▼                        │          │
┌──────────────────────┐          │          │
│       USERS          │          │          │
├──────────────────────┤          │          │
│ id (PK, UUID)        │          │          │
│ tenantId (FK)────────┼──────────┘          │
│ email (UNIQUE*)      │                     │
│ fullName             │                     │
│ passwordHash         │                     │
│ role (ENUM)          │                     │
│ createdAt            │                     │
│ updatedAt            │                     │
└──────────────────────┘                     │
         │◄──────────────────────────────────┘
         │1:N (Assignee)
         │
         │
┌────────┴──────────────────┐
│                           │
│  (Task.assignedTo FK)     │
│
├──────────────────────┐
│     PROJECTS         │
├──────────────────────┤
│ id (PK, UUID)        │
│ tenantId (FK)────────┼────────────┐
│ name                 │            │
│ description          │            │
│ status (ENUM)        │            │
│ createdBy (FK)───────┼─────┐      │
│ createdAt            │     │      │
│ updatedAt            │     │      │
└──────────────────────┘     │      │
         │                   │      │
         │1:N                │      │
         │                   │      │
         ▼                   │      │
┌──────────────────────┐     │      │
│       TASKS          │     │      │
├──────────────────────┤     │      │
│ id (PK, UUID)        │     │      │
│ projectId (FK)───────┼─────┘      │
│ tenantId (FK)────────┼────────────┘
│ title                │
│ description          │
│ status (ENUM)        │
│ priority (ENUM)      │
│ assignedTo (FK)◄─────┼────────┐
│ dueDate              │        │
│ createdAt            │        │
│ updatedAt            │        │
└──────────────────────┘        │
         │                      │
         │1:N                   │
         │                 (From USERS)
         │
         ▼
┌──────────────────────┐
│   AUDIT_LOGS         │
├──────────────────────┤
│ id (PK, UUID)        │
│ tenantId (FK)        │
│ userId (FK)          │
│ action               │
│ entityType           │
│ entityId             │
│ changes (JSON)       │
│ timestamp            │
│ ipAddress            │
└──────────────────────┘

Legend:
───── One-to-One (1:1)
────► One-to-Many (1:N)
◄──── Many-to-One (N:1)
PK   Primary Key (Unique identifier)
FK   Foreign Key (Reference to another table)
*    Composite constraint with tenant_id
```

---

## Table Definitions

### TENANTS Table

Represents organization accounts in the system.

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subdomain VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  maxUsers INTEGER NOT NULL DEFAULT 5,
  maxProjects INTEGER NOT NULL DEFAULT 3,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Column Descriptions**:

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique tenant identifier |
| subdomain | VARCHAR(50) | UNIQUE, NOT NULL | Unique subdomain for tenant (e.g., "acme") |
| name | VARCHAR(100) | NOT NULL | Tenant display name (e.g., "ACME Corporation") |
| maxUsers | INTEGER | NOT NULL, Default: 5 | Maximum users allowed (subscription limit) |
| maxProjects | INTEGER | NOT NULL, Default: 3 | Maximum projects allowed (subscription limit) |
| createdAt | TIMESTAMP | Default: NOW() | Account creation timestamp |
| updatedAt | TIMESTAMP | Default: NOW() | Last modification timestamp |

**Purpose**: Stores subscription information and multi-tenancy boundaries.

---

### USERS Table

Represents user accounts within tenants.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenantId UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  fullName VARCHAR(100) NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenantId, email)
);
```

**Column Descriptions**:

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| tenantId | UUID | FK → tenants, NULL for super_admin | Tenant this user belongs to |
| email | VARCHAR(255) | NOT NULL | User's email address |
| fullName | VARCHAR(100) | NOT NULL | User's display name |
| passwordHash | VARCHAR(255) | NOT NULL | bcrypt hashed password (not plain text) |
| role | VARCHAR(50) | NOT NULL, Enum | Role: 'super_admin', 'tenant_admin', 'user' |
| createdAt | TIMESTAMP | Default: NOW() | Account creation time |
| updatedAt | TIMESTAMP | Default: NOW() | Last update time |
| **Composite Constraint** | | UNIQUE(tenantId, email) | Email unique per tenant (allows same email across tenants) |

**Special Cases**:
- Super Admin: `tenantId = NULL`, `role = 'super_admin'`
- Tenant Admin: `tenantId = <uuid>`, `role = 'tenant_admin'`
- Regular User: `tenantId = <uuid>`, `role = 'user'`

**Purpose**: User authentication and authorization.

---

### PROJECTS Table

Represents team projects within a tenant.

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenantId UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'not-started',
  createdBy UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
);
```

**Column Descriptions**:

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique project identifier |
| tenantId | UUID | FK → tenants, NOT NULL | Tenant this project belongs to |
| name | VARCHAR(200) | NOT NULL | Project display name |
| description | TEXT | Optional | Detailed project description |
| status | VARCHAR(50) | Enum: 'not-started', 'in-progress', 'completed' | Current project status |
| createdBy | UUID | FK → users, SET NULL on delete | User who created the project |
| createdAt | TIMESTAMP | Default: NOW() | Project creation time |
| updatedAt | TIMESTAMP | Default: NOW() | Last modification time |

**Purpose**: Organize tasks into projects for team collaboration.

---

### TASKS Table

Represents individual tasks within projects.

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projectId UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tenantId UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'not-started',
  priority VARCHAR(50) NOT NULL DEFAULT 'medium',
  assignedTo UUID REFERENCES users(id) ON DELETE SET NULL,
  dueDate TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Column Descriptions**:

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique task identifier |
| projectId | UUID | FK → projects, CASCADE | Project this task belongs to |
| tenantId | UUID | FK → tenants, CASCADE | Tenant (denormalized for query performance) |
| title | VARCHAR(200) | NOT NULL | Task title |
| description | TEXT | Optional | Detailed task description |
| status | VARCHAR(50) | Enum: 'not-started', 'in-progress', 'completed' | Task status |
| priority | VARCHAR(50) | Enum: 'low', 'medium', 'high' | Task priority level |
| assignedTo | UUID | FK → users, SET NULL on delete | User assigned to task (optional) |
| dueDate | TIMESTAMP | Optional | Task deadline |
| createdAt | TIMESTAMP | Default: NOW() | Task creation time |
| updatedAt | TIMESTAMP | Default: NOW() | Last modification time |

**Purpose**: Track individual work items and assignments.

---

### AUDIT_LOGS Table

Immutable record of all mutations for compliance and auditing.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenantId UUID REFERENCES tenants(id) ON DELETE CASCADE,
  userId UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entityType VARCHAR(100) NOT NULL,
  entityId UUID,
  changes JSONB,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ipAddress VARCHAR(45)
);
```

**Column Descriptions**:

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique log entry identifier |
| tenantId | UUID | FK → tenants | Which tenant made the change |
| userId | UUID | FK → users, SET NULL | Which user made the change |
| action | VARCHAR(255) | NOT NULL | Action type: 'CREATE_USER', 'UPDATE_PROJECT', 'DELETE_TASK', etc |
| entityType | VARCHAR(100) | NOT NULL | Type of entity: 'user', 'project', 'task' |
| entityId | UUID | Optional | ID of the changed entity |
| changes | JSONB | Optional | Before/after values for audit trail |
| timestamp | TIMESTAMP | NOT NULL, Default: NOW() | When the change occurred |
| ipAddress | VARCHAR(45) | Optional | IP address of user making change |

**Example Entries**:

```json
{
  "id": "550e8400-...",
  "tenantId": "660e8400-...",
  "userId": "770e8400-...",
  "action": "CREATE_TASK",
  "entityType": "task",
  "entityId": "880e8400-...",
  "changes": {
    "title": "New task",
    "priority": "high"
  },
  "timestamp": "2025-12-22T14:30:00Z",
  "ipAddress": "192.168.1.100"
}
```

**Purpose**: Compliance auditing, debugging, and data recovery.

---

## Relationships

### Relationship Summary

| Relationship | Source | Target | Type | Cascade |
|-------------|--------|--------|------|---------|
| **TENANTS ← USERS** | users.tenantId | tenants.id | N:1 | DELETE CASCADE |
| **USERS ← PROJECTS** | projects.createdBy | users.id | N:1 | SET NULL |
| **TENANTS ← PROJECTS** | projects.tenantId | tenants.id | N:1 | DELETE CASCADE |
| **PROJECTS ← TASKS** | tasks.projectId | projects.id | N:1 | DELETE CASCADE |
| **TENANTS ← TASKS** | tasks.tenantId | tenants.id | N:1 | DELETE CASCADE |
| **USERS ← TASKS** | tasks.assignedTo | users.id | N:1 | SET NULL |
| **USERS ← AUDIT_LOGS** | audit_logs.userId | users.id | N:1 | SET NULL |
| **TENANTS ← AUDIT_LOGS** | audit_logs.tenantId | tenants.id | N:1 | DELETE CASCADE |

### Cascade Delete Behavior

```
SCENARIO 1: Tenant Deleted
┌─────────────────────────────────────────┐
│ DELETE FROM tenants WHERE id = $1       │
└─────────────────────────────────────────┘
         │
         ▼ CASCADE DELETE
┌─────────────────────────────────────────┐
│ Automatically deletes:                   │
│ • All users in tenant                   │
│ • All projects in tenant                │
│ • All tasks in all projects (via FK)    │
│ • All audit logs for tenant             │
└─────────────────────────────────────────┘

Result: Complete tenant data removal (GDPR compliance)

SCENARIO 2: Project Deleted
┌─────────────────────────────────────────┐
│ DELETE FROM projects WHERE id = $1      │
└─────────────────────────────────────────┘
         │
         ▼ CASCADE DELETE
┌─────────────────────────────────────────┐
│ Automatically deletes:                   │
│ • All tasks in project                  │
│                                          │
│ Does NOT delete:                        │
│ • Project creator (users.createdBy)     │
│ • Tenant data                           │
└─────────────────────────────────────────┘

Result: Clean project removal without orphaned tasks

SCENARIO 3: User Deleted
┌─────────────────────────────────────────┐
│ DELETE FROM users WHERE id = $1         │
└─────────────────────────────────────────┘
         │
         ▼ SET NULL (not CASCADE)
┌─────────────────────────────────────────┐
│ Automatically updates:                   │
│ • projects.createdBy = NULL (if creator)│
│ • tasks.assignedTo = NULL (if assigned) │
│ • audit_logs.userId = NULL (if creator) │
│                                          │
│ Result: Task remains but shows          │
│ "Created by: [deleted user]"            │
└─────────────────────────────────────────┘

Result: Data integrity maintained, history preserved
```

---

## Indices

Performance optimization indices on frequently queried columns.

```sql
-- Fast user lookup by email within tenant
CREATE UNIQUE INDEX idx_users_tenantid_email 
ON users(tenantId, email);

-- Fast queries filtering by tenant
CREATE INDEX idx_projects_tenantid 
ON projects(tenantId);

CREATE INDEX idx_tasks_tenantid 
ON tasks(tenantId);

CREATE INDEX idx_tasks_projectid 
ON tasks(projectId);

CREATE INDEX idx_audit_logs_tenantid 
ON audit_logs(tenantId);

-- Fast user lookups for assignments
CREATE INDEX idx_tasks_assignedto 
ON tasks(assignedTo);

-- Time-based queries for audit trail
CREATE INDEX idx_audit_logs_timestamp 
ON audit_logs(timestamp);

-- Created by lookups
CREATE INDEX idx_projects_createdby 
ON projects(createdBy);
```

**Why These Indices Matter**:

1. **users(tenantId, email)** - Every login query
   - Composite index speeds: WHERE tenantId = ? AND email = ?
   - Used by: `authModel.login(email, password)`

2. **projects(tenantId)** - List projects for tenant
   - Used by: `GET /api/projects`
   - Typical result: 5-100 projects per query

3. **tasks(tenantId)** - Audit trail filtering
   - Used by: Compliance reporting
   - Can return thousands of rows

4. **tasks(projectId)** - List tasks in project
   - Used by: `GET /api/projects/:id/tasks`
   - Typical result: 5-50 tasks per project

5. **tasks(assignedTo)** - Find tasks for user
   - Used by: User dashboard features
   - Shows workload distribution

---

## Constraints

Data integrity constraints enforced by database.

```sql
-- Primary Key Constraints
ALTER TABLE tenants ADD CONSTRAINT pk_tenants 
  PRIMARY KEY (id);
ALTER TABLE users ADD CONSTRAINT pk_users 
  PRIMARY KEY (id);
-- ... (all primary keys auto-created with PRIMARY KEY keyword)

-- Unique Constraints
ALTER TABLE tenants ADD CONSTRAINT uq_tenants_subdomain 
  UNIQUE (subdomain);
ALTER TABLE users ADD CONSTRAINT uq_users_tenantid_email 
  UNIQUE (tenantId, email);

-- Foreign Key Constraints
ALTER TABLE users ADD CONSTRAINT fk_users_tenantid
  FOREIGN KEY (tenantId) 
  REFERENCES tenants(id) 
  ON DELETE CASCADE;

ALTER TABLE projects ADD CONSTRAINT fk_projects_tenantid
  FOREIGN KEY (tenantId) 
  REFERENCES tenants(id) 
  ON DELETE CASCADE;

ALTER TABLE projects ADD CONSTRAINT fk_projects_createdby
  FOREIGN KEY (createdBy) 
  REFERENCES users(id) 
  ON DELETE SET NULL;

ALTER TABLE tasks ADD CONSTRAINT fk_tasks_projectid
  FOREIGN KEY (projectId) 
  REFERENCES projects(id) 
  ON DELETE CASCADE;

ALTER TABLE tasks ADD CONSTRAINT fk_tasks_tenantid
  FOREIGN KEY (tenantId) 
  REFERENCES tenants(id) 
  ON DELETE CASCADE;

ALTER TABLE tasks ADD CONSTRAINT fk_tasks_assignedto
  FOREIGN KEY (assignedTo) 
  REFERENCES users(id) 
  ON DELETE SET NULL;

-- NOT NULL Constraints
-- Enforced via column definitions in CREATE TABLE

-- CHECK Constraints (if enum validation needed)
ALTER TABLE users ADD CONSTRAINT ck_users_role
  CHECK (role IN ('super_admin', 'tenant_admin', 'user'));

ALTER TABLE projects ADD CONSTRAINT ck_projects_status
  CHECK (status IN ('not-started', 'in-progress', 'completed'));

ALTER TABLE tasks ADD CONSTRAINT ck_tasks_status
  CHECK (status IN ('not-started', 'in-progress', 'completed'));

ALTER TABLE tasks ADD CONSTRAINT ck_tasks_priority
  CHECK (priority IN ('low', 'medium', 'high'));
```

---

## Data Isolation Strategy

### Row-Level Security

All tenant data is filtered by `tenantId` at the application layer:

```sql
-- GOOD: Always filter by tenant
SELECT * FROM projects 
WHERE tenantId = $1;  -- $1 comes from authenticated user token

SELECT * FROM tasks 
WHERE projectId = $2 AND tenantId = $1;  -- Double-check

-- BAD: Never do this (leaks cross-tenant data)
SELECT * FROM projects;  -- No tenant filter!

SELECT * FROM tasks WHERE projectId = $2;  -- Can get other tenant's tasks
```

### Authentication Isolation

Email must match both email AND tenant for login:

```sql
-- CORRECT: Match email within tenant context
SELECT * FROM users 
WHERE email = $1 AND tenantId = $2
LIMIT 1;

-- WRONG: Email-only match (allows cross-tenant login)
SELECT * FROM users 
WHERE email = $1
LIMIT 1;  -- Could return wrong tenant's user!
```

### Super Admin Exception

Super admin users have `tenantId = NULL`:

```sql
-- Super admin can query across all tenants
SELECT * FROM tenants;  -- See all organizations
SELECT * FROM users WHERE tenantId IS NULL;  -- See all super admins

-- But within a tenant, normal isolation still applies
SELECT * FROM projects 
WHERE tenantId = $1;  -- If super admin impersonates tenant, still isolated
```

### Assignment Isolation

When assigning a task to a user, must verify they belong to same tenant:

```sql
-- Before assigning task to user:
SELECT * FROM users 
WHERE id = $assignedToUserId 
AND tenantId = $userTenantId;  -- Verify same tenant

-- If no result: can't assign (user from different tenant)
-- If result found: safe to assign
```

---

## Query Patterns

### Common Query Examples

```sql
-- 1. USER LOGIN (auth.js)
SELECT id, email, fullName, passwordHash, role, tenantId
FROM users 
WHERE email = 'john@acme.com' AND tenantId = '550e8400-...'
LIMIT 1;

-- 2. LIST PROJECTS FOR TENANT
SELECT id, name, description, status, createdBy, createdAt
FROM projects
WHERE tenantId = '550e8400-...'
ORDER BY createdAt DESC
LIMIT 10 OFFSET 0;

-- 3. LIST TASKS IN PROJECT
SELECT t.id, t.title, t.status, t.priority, t.assignedTo, t.dueDate,
       u.fullName as assignedToName
FROM tasks t
LEFT JOIN users u ON t.assignedTo = u.id
WHERE t.projectId = '660e8400-...' 
  AND t.tenantId = '550e8400-...'
ORDER BY t.createdAt DESC;

-- 4. COUNT USERS FOR SUBSCRIPTION CHECK
SELECT COUNT(*) as userCount
FROM users
WHERE tenantId = '550e8400-...';

-- 5. GET AUDIT TRAIL FOR USER
SELECT id, action, entityType, entityId, changes, timestamp
FROM audit_logs
WHERE tenantId = '550e8400-...'
  AND userId = '770e8400-...'
ORDER BY timestamp DESC;

-- 6. FIND TASKS ASSIGNED TO USER
SELECT id, title, status, projectId, dueDate
FROM tasks
WHERE assignedTo = '770e8400-...'
  AND tenantId = '550e8400-...'
ORDER BY dueDate ASC;

-- 7. CHECK IF TENANT EXISTS BY SUBDOMAIN
SELECT id, name, maxUsers, maxProjects
FROM tenants
WHERE subdomain = 'acme'
LIMIT 1;

-- 8. GET PROJECTS CREATED BY USER
SELECT id, name, status
FROM projects
WHERE createdBy = '770e8400-...'
  AND tenantId = '550e8400-...'
ORDER BY createdAt DESC;
```

---

## Backup & Recovery

### Backup Strategy

```bash
# Daily backup to external storage
docker exec workspace_hub_database pg_dump \
  -U postgres workspace_hub_db \
  > backup_$(date +%Y%m%d).sql

# Compress for storage efficiency
gzip backup_20251222.sql

# Upload to cloud storage
aws s3 cp backup_20251222.sql.gz \
  s3://backups/workspace-hub/

# Verify backup integrity
pg_restore --list backup_20251222.sql | head -20
```

### Recovery Process

```bash
# 1. Stop application to prevent data modification
docker-compose stop backend frontend

# 2. Reset database
docker exec workspace_hub_database dropdb workspace_hub_db -U postgres
docker exec workspace_hub_database createdb workspace_hub_db -U postgres

# 3. Restore from backup
docker exec -i workspace_hub_database psql -U postgres workspace_hub_db \
  < backup_20251222.sql

# 4. Verify restoration
docker exec workspace_hub_database psql -U postgres workspace_hub_db \
  -c "SELECT COUNT(*) FROM users;"

# 5. Restart application
docker-compose up -d

# 6. Verify data integrity
curl http://localhost:5000/health
```

### Point-in-Time Recovery (PITR)

PostgreSQL WAL (Write-Ahead Logs) enable recovery to specific timestamps:

```sql
-- Recover to specific point in time
-- Requires continuous archiving enabled
-- Recovery done at database level with special recovery config
```

---

## Scaling Considerations

### Current Setup (Single Database)

```
Scale: < 10,000 users, < 100 tenants
Performance: Excellent
Cost: Low

Bottlenecks:
├─ Single database server
├─ No read replicas
├─ No caching layer
└─ No query optimization beyond indices
```

### Horizontal Scaling Options

#### Option 1: Read Replicas

```
┌─────────────────────┐
│   Primary DB        │ (Writes)
│   (Master)          │
└──────────┬──────────┘
           │ Replication
           │
    ┌──────┴──────┬──────────────┐
    ▼             ▼              ▼
 ┌─────────┐  ┌─────────┐  ┌─────────┐
 │ Replica │  │ Replica │  │ Replica │
 │   1     │  │   2     │  │   3     │
 └─────────┘  └─────────┘  └─────────┘
 (Read-only) (Read-only) (Read-only)

Backend Load Balancer:
├─ Write queries → Primary DB
├─ Read queries → Round-robin to Replicas
└─ Benefit: 3-5x read performance improvement
```

#### Option 2: Vertical Partitioning (Sharding by Tenant)

```
Tenant 1, 2, 3 → DB Shard 1 (USA)
Tenant 4, 5, 6 → DB Shard 2 (EU)
Tenant 7, 8, 9 → DB Shard 3 (APAC)

Benefits:
├─ Geographic data locality
├─ Compliance (data residency)
├─ Independent scaling per region
└─ Disaster isolation

Challenges:
├─ Cross-shard queries complex
├─ Cross-tenant reporting difficult
└─ Database failover becomes complex
```

#### Option 3: Caching Layer (Redis)

```
Application
     │
     ├─ Query Cache (Redis)
     │   ├─ Cache: Project lists
     │   ├─ Cache: User data
     │   └─ Cache: Tenant settings
     │
     └─ Database (PostgreSQL)
         (Cache miss handler)

Benefits:
├─ 10-100x faster reads
├─ Reduced database load
├─ Real-time data freshness
└─ Scaling without schema changes

Invalidation Strategy:
├─ On CREATE: Invalidate list cache
├─ On UPDATE: Invalidate specific record + list
├─ On DELETE: Invalidate specific record + list
└─ TTL: Auto-expire after 1 hour
```

#### Option 4: Time-Series Data Separation

```
Operational Database         Time-Series Database
├─ Projects                  ├─ Audit Logs
├─ Tasks                     ├─ Activity Streams
├─ Users                     └─ Metrics
└─ Tenants                   

Benefits:
├─ Audit logs don't slow OLTP queries
├─ Optimized for different query patterns
├─ Easy data archival
└─ Can use specialized DB (InfluxDB, TimescaleDB)
```

### Scaling Timeline

```
0-1,000 users:
├─ Single database
├─ No caching
└─ Single app server

1,000-10,000 users:
├─ Add read replicas
├─ Implement Redis caching
├─ Multi-app server load balancing

10,000+ users:
├─ Vertical partitioning (sharding)
├─ Advanced caching strategy
├─ Separate audit log database
├─ Query optimization & profiling
└─ DBA support for complex tuning
```

---

**Last Updated**: December 2025
**Schema Version**: 1.0
**Status**: Production Ready
