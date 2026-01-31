# 🚀 Workspace Hub - Multi-Tenant SaaS Platform

> **A comprehensive multi-tenant SaaS application** for project and task management with role-based access control, built with **Node.js**, **React**, and **PostgreSQL**.

<div align="center">
  <p>
    <a href="#-quick-start"><strong>Quick Start</strong></a> •
    <a href="#-features"><strong>Features</strong></a> •
    <a href="#-technology-stack"><strong>Tech Stack</strong></a> •
    <a href="#-installation"><strong>Installation</strong></a> •
    <a href="#-documentation"><strong>Documentation</strong></a> •
    <a href="#-api-endpoints"><strong>API Reference</strong></a>
  </p>
</div>

---

## 🚀 Quick Start

**Get started in 2 minutes:**

```bash
# 1. Clone the repository
git clone <repository-url>
cd workspace-hub

# 2. Start all services with Docker
docker-compose up -d

# 3. Wait for services to initialize (30-60 seconds first time)
# Check status: docker-compose ps

# 4. Open your browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# Health Check: http://localhost:5000/api/health
```

**Default Login Credentials:**
- **Super Admin:** `superadmin@system.com` / `Admin@123`
- **Tenant Admin:** `admin@demo.com` / `Demo@123` (subdomain: `demo`)
- **User:** `user1@demo.com` / `User@123` (subdomain: `demo`)

**Helper Scripts:**
- `./start.sh` - Quick start with automatic browser opening
- `./stop.sh` - Stop all services
- `./test-deployment.sh` - Run automated deployment tests

**Need help?** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## ✨ Features

| 🎯 | Feature | Description |
|:---|:--------|:------------|
| 🏢 | **Multi-Tenancy Support** | Isolated workspaces for different organizations with complete data segregation |
| 🔐 | **Role-Based Access Control** | Three user roles with granular permissions (Super Admin, Tenant Admin, User) |
| 🔑 | **JWT Authentication** | Secure stateless authentication with 24-hour token expiry |
| 📊 | **Project Management** | Create, organize, and manage projects with team collaboration |
| ✅ | **Task Management** | Comprehensive task tracking with priority levels, assignments, and status |
| 💳 | **Subscription Management** | Flexible subscription tiers with configurable user and project limits |
| 📝 | **Audit Logging** | Complete audit trail for compliance and security monitoring |
| 🐳 | **Docker Containerization** | Production-ready Docker setup with PostgreSQL and hot-reload support |
| 🔌 | **RESTful API** | 20 well-documented API endpoints with comprehensive error handling |
| 📱 | **Responsive UI** | Modern React-based frontend with intuitive navigation and role-based pages |

---

## 🛠 Technology Stack

### 🔙 Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| 🏃 Runtime | Node.js | 20 |
| 🌐 Framework | Express.js | 4.21 |
| 🗄️ ORM | Prisma | 5.22 |
| 📦 Database | PostgreSQL | 16 |
| 🔒 Hashing | bcrypt | 5.1 |
| 🎫 JWT | jsonwebtoken | 9.0 |
| ✔️ Validation | Zod | 3.23 |
| 🌍 CORS | CORS | 2.8 |
| 🆔 UUID | uuid | 9.0 |

### 🎨 Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| ⚛️ Library | React | 18.x |
| ⚡ Build Tool | Vite | 5.x |
| 🗺️ Routing | React Router | 6.x |
| 🌐 HTTP Client | Axios | - |
| 📦 State Management | Context API | - |

### 🐳 DevOps
| Component | Technology | Version |
|-----------|-----------|---------|
| 📦 Container Platform | Docker | 20+ |
| 🎯 Orchestration | Docker Compose | 2.x |
| 🗄️ Database Container | PostgreSQL Docker Image | - |

---

## 🏗️ System Architecture

### Architecture Overview

The system follows a **layered architecture pattern** with clear separation of concerns:

<div align="center">
  <img src="docs/images/system-architecture.svg" alt="System Architecture" width="800">
</div>

```
┌────────────────────────────────────────────────────────────────┐
│              💻 Presentation Layer                             │
│        React SPA: 🔐 Login | 📊 Dashboard | 📁 Projects | ✅    │
└────────────────────┬───────────────────────────────────────────┘
                     │ HTTP/REST + 🔑 JWT
┌────────────────────▼───────────────────────────────────────────┐
│                    🔌 API Layer                                │
│     ┌──────────┬───────────────┬────────────┬──────────────┐   │
│     │ 🔑 Auth  │ 📁 Projects   │ ✅ Tasks   │ 👥 Users      │   │
│     │ 🏢 Tenant│ All with RBAC & Tenant Filtering          │   │
│     └──────────┴───────────────┴────────────┴──────────────┘   │
└────────────────────┬───────────────────────────────────────────┘
                     │ Middleware Stack
┌────────────────────▼───────────────────────────────────────────┐
│                 🔗 Middleware Layer                            │
│   CORS → ✅ Body Parser → 🔐 Auth → 🛡️ RBAC → ❌ Error Handler  │
└────────────────────┬───────────────────────────────────────────┘
                     │ Database Queries
┌────────────────────▼──────────────────────────────────────────┐
│                    🗄️ Data Layer                              │
│     ┌────────────────────────────────────────────────────┐    │
│     │ 🔗 Prisma ORM                                      │    │
│     │   ├─ 🏢 Tenants (subscription limits)              │    │
│     │   ├─ 👥 Users (role-based access)                  │    │
│     │   ├─ 📁 Projects (ownership tracking)              │    │
│     │   ├─ ✅ Tasks (assignments & priority)             │    │
│     │   └─ 📝 Audit Logs (immutable trail)               │    │
│     └────────────────────────────────────────────────────┘    │
│                                                               │
│                🐘 PostgreSQL 16 Database                      │
└───────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

The database uses **5 main tables** with carefully designed relationships and constraints for multi-tenant isolation and role-based access control.

<div align="center">
  <img src="docs/images/database-erd.svg" alt="Database ERD" width="800">
</div>

### Tables Overview

#### 🏢 **Tenants Table**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary Key |
| `subdomain` | String (Unique) | Tenant identifier |
| `name` | String | Organization name |
| `maxUsers` | Integer | User limit |
| `maxProjects` | Integer | Project limit |
| `createdAt` | Timestamp | Creation date |
| `updatedAt` | Timestamp | Last update |

#### 👥 **Users Table**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary Key |
| `tenantId` | UUID (FK) | Tenant reference |
| `email` | String | Unique per tenant |
| `fullName` | String | User name |
| `passwordHash` | String | Hashed password |
| `role` | ENUM | super_admin, tenant_admin, user |
| `createdAt` | Timestamp | Creation date |
| `updatedAt` | Timestamp | Last update |

#### 📁 **Projects Table**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary Key |
| `tenantId` | UUID (FK) | Tenant reference |
| `name` | String | Project name |
| `description` | String | Project details |
| `status` | ENUM | active, archived, deleted |
| `createdBy` | UUID (FK) | User reference |
| `createdAt` | Timestamp | Creation date |
| `updatedAt` | Timestamp | Last update |

#### ✅ **Tasks Table**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary Key |
| `projectId` | UUID (FK) | Project reference |
| `tenantId` | UUID (FK) | Tenant reference |
| `title` | String | Task title |
| `description` | String | Task details |
| `status` | ENUM | todo, in_progress, done |
| `priority` | ENUM | low, medium, high |
| `assignedTo` | UUID (FK) | User reference |
| `dueDate` | Date | Due date |
| `createdAt` | Timestamp | Creation date |
| `updatedAt` | Timestamp | Last update |

#### 📝 **Audit Logs Table**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Primary Key |
| `tenantId` | UUID (FK) | Tenant reference |
| `userId` | UUID (FK) | User reference |
| `action` | String | Action performed |
| `entityType` | String | Entity affected |
| `entityId` | UUID | Entity ID |
| `changes` | JSON | Change details |
| `timestamp` | Timestamp | When it happened |
| `ipAddress` | String | Source IP |

---

## 🚀 Installation

### 📋 Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| 🐳 Docker & Docker Compose | Latest | Containerization & Orchestration |
| 📦 Node.js | 20+ | Backend runtime (local development) |
| 🗄️ PostgreSQL | 16+ | Database (local development) |

### ⚡ Quick Start with Docker

```bash
# 🎯 Navigate to project directory
cd workspace-hub

# 🚀 Start all services
docker-compose up -d

# ✅ Services will be available at:
# 🎨 Frontend: http://localhost:3000
# 🔌 Backend API: http://localhost:5000
# 🗄️ Database: localhost:5432
```

> **✨ The database will automatically initialize** with migrations and seed data on first run.

### 💻 Local Development Setup

#### 🔙 Backend Setup
```bash
cd backend

# 📦 Install dependencies
npm install

# ⚙️ Create environment file
cp .env.example .env

# 🗄️ Setup database
npm run prisma:push
npm run seed

# 🚀 Start development server
npm run dev
```

#### 🎨 Frontend Setup
```bash
cd frontend

# 📦 Install dependencies
npm install

# 🚀 Start development server
npm run dev
```

### ⚙️ Environment Variables

#### 🔙 Backend (.env)

```bash
# 🌐 Server Configuration
PORT=5000
NODE_ENV=development

# 🎨 Frontend CORS
FRONTEND_URL=http://localhost:3000

# 🔐 JWT Authentication
JWT_SECRET=your_jwt_secret_key_at_least_32_characters_long
JWT_EXPIRES_IN=24h

# 🗄️ Database Connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/workspace_hub_db
```

---

## 📹 Demo & Documentation
<!-- 
### 🎬 Video Demo
**[📹 Watch Full Demo on YouTube](#)** ← *Update with actual YouTube link after recording*

See detailed guide: [VIDEO_RECORDING_GUIDE.md](VIDEO_RECORDING_GUIDE.md) -->

**The demo covers:**
- ✅ System startup with docker-compose
- ✅ Tenant registration and multi-tenancy
- ✅ User authentication and role-based access
- ✅ Project and task management
- ✅ Multi-tenant data isolation verification
- ✅ Code walkthrough of key components

### 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| 📋 [API.md](docs/API.md) | Complete API reference with all endpoints |
| 🏗️ [SYSTEM_ARCHITECTURE_DETAILED.md](docs/SYSTEM_ARCHITECTURE_DETAILED.md) | Detailed architecture overview |
| 📊 [DATABASE_ERD.md](docs/DATABASE_ERD.md) | Database relationships & schema |
| 📝 [PRD.md](docs/PRD.md) | Product requirements document |
| 🔍 [research.md](docs/research.md) | Multi-tenancy analysis & tech stack |
| 🛠️ [technical-spec.md](docs/technical-spec.md) | Technical specifications |
<!-- | 📹 [VIDEO_RECORDING_GUIDE.md](VIDEO_RECORDING_GUIDE.md) | Video recording checklist | -->

---

## 🔌 API Endpoints

### 🔑 Authentication (4 endpoints)
```
POST   /api/auth/register-tenant     → Register new tenant
POST   /api/auth/login               → User login
GET    /api/auth/me                  → Get current user profile
POST   /api/auth/logout              → User logout
```

### 🏢 Tenants (3 endpoints)
```
GET    /api/tenants/:tenantId        → Get tenant details
PUT    /api/tenants/:tenantId        → Update tenant
GET    /api/tenants                  → List all tenants (super_admin only)
```

### 👥 Users (4 endpoints)
```
POST   /api/users                    → Add user to tenant
GET    /api/users                    → List tenant users
PUT    /api/users/:userId            → Update user
DELETE /api/users/:userId            → Delete user
```

### 📁 Projects (4 endpoints)
```
POST   /api/projects                 → Create project
GET    /api/projects                 → List projects
PUT    /api/projects/:projectId      → Update project
DELETE /api/projects/:projectId      → Delete project
```

### ✅ Tasks (5 endpoints)
```
POST   /api/projects/:projectId/tasks        → Create task
GET    /api/projects/:projectId/tasks        → List tasks
PUT    /api/tasks/:taskId                    → Update task
PATCH  /api/tasks/:taskId/status             → Update task status
DELETE /api/tasks/:taskId                    → Delete task
```

---

## 🔒 Data Isolation & Security

### 🏢 Multi-Tenancy Isolation
✅ Every database query filters by `tenant_id`  
✅ Row-level security through explicit WHERE clauses  
✅ Composite unique constraints: `(tenant_id, email)`  
✅ Super admin exception: `tenant_id = NULL` for system users  
✅ Foreign key constraints with CASCADE delete for data integrity

### 🔐 Authentication & Authorization
✅ JWT tokens with 24-hour expiry  
✅ Password hashing with bcrypt (10 salt rounds)  
✅ Role-based access control (RBAC) middleware  
✅ Protected routes requiring authentication  
✅ Request validation using Zod schemas

### 📝 Audit Trail
✅ Immutable audit log for compliance  
✅ All mutations logged with user, action, and timestamp  
✅ IP address tracking for security  
✅ Complete change history for data recovery

---

## 💳 Subscription Plans

| 🎯 Plan | 👥 Max Users | 📁 Max Projects | ✨ Features |
|---------|:----------:|:---------------:|-----------|
| **🆓 Free** | 5 | 3 | Basic project management |
| **⭐ Pro** | 25 | 15 | Advanced features, 50GB storage |
| **🏢 Enterprise** | 100 | 50 | Dedicated support, custom limits |

---

## 🧪 Testing with Seed Data

After running `docker-compose up` or seed script, use these credentials:

### 🌟 Super Admin
```
📧 Email:    superadmin@system.com
🔐 Password: Admin@123
👤 Role:     super_admin
```

### 🎯 Demo Tenant (subdomain: demo)

**🔑 Tenant Admin**
```
📧 Email:    admin@demo.com
🔐 Password: Demo@123
👤 Role:     tenant_admin
```

**👥 Regular Users**
```
📧 Email:    user1@demo.com    🔐 Password: User@123
📧 Email:    user2@demo.com    🔐 Password: User@123
👤 Role:     user
```

---

## 📁 File Structure

```
workspace-hub/
│
├── 🔙 backend/
│   ├── 📂 src/
│   │   ├── 🎮 controllers/          ← Request handlers
│   │   ├── 🗄️ models/               ← Database access layer
│   │   ├── 🛣️ routes/               ← Route definitions
│   │   ├── 🔐 middleware/           ← Auth, RBAC, error handling
│   │   ├── 🛠️ utils/                ← JWT, crypto, audit, responses
│   │   ├── ⚙️ config/               ← Environment configuration
│   │   ├── 💾 db/                   ← Prisma client
│   │   ├── 📌 app.js                ← Express app setup
│   │   └── 🚀 server.js             ← Server initialization
│   ├── 🗄️ prisma/
│   │   ├── 📋 schema.prisma         ← Database schema definition
│   │   ├── 🌱 seed.js               ← Seed data script
│   │   └── 🔄 migrations/           ← Database migrations
│   ├── 🐳 Dockerfile
│   ├── 📜 docker-entrypoint.sh
│   └── 📦 package.json
│
├── 🎨 frontend/
│   ├── 📂 src/
│   │   ├── 📄 pages/                ← Page components
│   │   ├── 🧩 components/           ← Reusable components
│   │   ├── 📦 context/              ← Auth context for state
│   │   ├── 🌐 api/                  ← Axios client configuration
│   │   ├── 🎯 App.jsx               ← Main app with routes
│   │   ├── 📍 main.jsx              ← Entry point
│   │   └── 🎨 styles.css            ← Global styles
│   ├── 🐳 Dockerfile
│   ├── ⚙️ vite.config.js
│   └── 📦 package.json
│
├── 📚 docs/
│   ├── 📋 API.md                    ← Complete API documentation
│   ├── 🏗️ SYSTEM_ARCHITECTURE_DETAILED.md
│   ├── 📊 DATABASE_ERD.md
│   ├── 📝 PRD.md
│   ├── 🔍 architecture.md
│   ├── 🛠️ technical-spec.md
│   └── 📸 images/                   ← Architecture & ERD diagrams
│
├── 🐳 docker-compose.yml            ← Multi-container setup
├── 📖 README.md                     ← This file
└── 📋 requirements.txt              ← Project requirements
```

---

## 🐳 Docker Deployment

### 📦 Docker Compose Services

| Service | Technology | Port | Purpose |
|---------|-----------|------|---------|
| 🗄️ **database** | PostgreSQL 16 | 5432 | Data persistence with health checks |
| 🔙 **backend** | Node.js + Express | 5000 | API server with auto-migrations |
| 🎨 **frontend** | React + Vite | 3000 | Web UI with hot-reload |

**Service Details:**
- 🗄️ **PostgreSQL (database)**
  - Image: `postgres:16-alpine`
  - Volume: `db_data` for persistence
  - Health check: Every 5 seconds

- 🔙 **Backend (backend)**
  - Node.js 20 with Express
  - Environment: DATABASE_URL, JWT_SECRET, etc
  - Auto-runs migrations and seed on startup
  - Depends on: database

- 🎨 **Frontend (frontend)**
  - React + Vite
  - Served via 'serve' package
  - Depends on: backend

### 🚀 Running in Production

```bash
# 🔨 Build images
docker-compose build

# 🚀 Start services
docker-compose up -d

# 📊 View logs
docker-compose logs -f

# 🛑 Stop services
docker-compose down
```

### 💚 Health Checks

```bash
# 📊 Database health
docker-compose ps

# 🏥 Backend health (after 10 second startup)
curl http://localhost:5000/health
```

---

## 🐛 Troubleshooting

### ❌ Port Already in Use
```bash
# 🔧 Option 1: Change port in docker-compose.yml or local .env
# 🔧 Option 2: Kill existing process
lsof -i :5000
kill -9 <PID>
```

### ❌ Database Connection Error
```bash
# ✅ Ensure PostgreSQL container is running
docker-compose ps

# ✅ Check connection string in .env or docker-compose.yml

# ✅ Run migrations
npm run prisma:push
```

### ❌ Frontend Can't Connect to Backend
```bash
# ✅ Verify CORS settings in backend/src/app.js
# ✅ Check FRONTEND_URL matches frontend actual URL
# ✅ Ensure backend is running on correct port
```

### ❌ Module Not Found Errors
```bash
# 🔧 Clear node_modules
rm -rf node_modules && npm install

# 🔧 Clear npm cache
npm cache clean --force

# 🔧 Rebuild Docker images
docker-compose build --no-cache
```

---

## 🔄 Development Workflow

### 1️⃣ Create Feature Branch
```bash
git checkout -b feature/your-feature
```

### 2️⃣ Make Changes & Test
```bash
docker-compose up -d
# Test in browser: http://localhost:3000
```

### 3️⃣ Commit with Conventional Format
```bash
git commit -m "feat(module): description of changes"
```

### 4️⃣ Push & Create PR
```bash
git push origin feature/your-feature
# Create pull request for review
```

### 📋 Conventional Commit Format
| Type | Usage |
|------|-------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation |
| `style:` | Formatting |
| `refactor:` | Code restructuring |
| `chore:` | Build, dependencies |

---

## ⚡ Performance Optimization

✅ **Database:** Indices on frequently queried columns (`tenant_id`, `email`)  
✅ **Connection:** Connection pooling via Prisma  
✅ **Auth:** JWT tokens for stateless authentication (no session table)  
✅ **Frontend:** Code splitting with Vite  
✅ **Styles:** CSS optimization in production build  
✅ **API:** Environment-based URLs

---

## 🔐 Security Best Practices

| ✅ Practice | Implementation |
|----------|-----------------|
| 🔑 **Secrets** | Never commit .env files |
| 🔐 **JWT Secret** | Use strong, random secret (min 32 chars) |
| 🌍 **CORS** | Whitelist specific frontend URL only |
| 💉 **SQL Injection** | Prisma parameterizes all queries |
| 🔒 **Passwords** | Hashed with bcrypt, never stored plain text |
| 📝 **Audit** | All changes tracked and immutable |
| 🚦 **Rate Limiting** | Consider adding in production |
| 🔗 **HTTPS** | Use in production deployment |

---

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit changes (`git commit -m 'Add AmazingFeature'`)
4. 📤 Push to branch (`git push origin feature/AmazingFeature`)
5. 📋 Open a Pull Request

---

## 📄 License

This project is **private and confidential**. All rights reserved.

---

## 💬 Support

For issues, questions, or suggestions:

| Channel | Link |
|---------|------|
| 🐛 **Issues** | Create an issue in the repository |
| 👥 **Team** | Contact the development team |
| 📚 **API Docs** | Review [docs/API.md](docs/API.md) |
| 🔧 **Help** | Check troubleshooting section above |

---

<div align="center">

### ✨ Built with ❤️ by the Development Team

**Last Updated:** December 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

[⬆ Back to top](#-workspace-hub---multi-tenant-saas-platform)

</div>
