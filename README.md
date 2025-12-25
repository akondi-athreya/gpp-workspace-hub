# Workspace Hub - Multi-Tenant SaaS Platform

A comprehensive multi-tenant SaaS application for project and task management with role-based access control, built with Node.js, React, and PostgreSQL.

## Features

- **Multi-Tenancy Support**: Isolated workspaces for different organizations with complete data segregation
- **Role-Based Access Control (RBAC)**: Three user roles with granular permissions (Super Admin, Tenant Admin, User)
- **JWT Authentication**: Secure stateless authentication with 24-hour token expiry
- **Project Management**: Create, organize, and manage projects with team collaboration
- **Task Management**: Comprehensive task tracking with priority levels, assignments, and status tracking
- **Subscription Management**: Flexible subscription tiers with configurable user and project limits
- **Audit Logging**: Complete audit trail for compliance and security monitoring
- **Docker Containerization**: Production-ready Docker setup with PostgreSQL and hot-reload support
- **RESTful API**: 20 well-documented API endpoints with comprehensive error handling
- **Responsive UI**: Modern React-based frontend with intuitive navigation and role-based pages

## Technology Stack

### Backend
- **Node.js 20** - JavaScript runtime
- **Express.js 4.21** - Web framework
- **Prisma 5.22** - ORM and database toolkit
- **PostgreSQL 16** - Relational database
- **bcrypt 5.1** - Password hashing
- **jsonwebtoken 9.0** - JWT authentication
- **Zod 3.23** - Schema validation
- **CORS 2.8** - Cross-origin resource sharing
- **uuid 9.0** - Unique identifier generation

### Frontend
- **React 18.x** - UI library
- **Vite 5.x** - Build tool and dev server
- **React Router 6.x** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management

### DevOps
- **Docker 20+** - Container platform
- **Docker Compose 2.x** - Multi-container orchestration
- **PostgreSQL Docker Image** - Database container

## System Architecture

See detailed architecture diagram: [System Architecture](docs/images/system-architecture.svg)

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  (React SPA: Login, Dashboard, Projects, Tasks, Users)      │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST + JWT
┌────────────────────▼────────────────────────────────────────┐
│                  API Layer                                  │
│  ┌─────────────┬───────────────┬────────────────────────┐  │
│  │ Auth Routes │ Project Routes│ Task Routes            │  │
│  │ Tenant Routes│ User Routes  │ All with RBAC & Tenant │  │
│  └─────────────┴───────────────┴────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ Middleware Stack
┌────────────────────▼────────────────────────────────────────┐
│                Middleware Layer                             │
│  CORS → Body Parser → Auth → RBAC → Error Handler           │
└────────────────────┬────────────────────────────────────────┘
                     │ Database Queries
┌────────────────────▼────────────────────────────────────────┐
│                  Data Layer                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Prisma ORM                                           │  │
│  │ ├─ Tenants Table (with subscription limits)         │  │
│  │ ├─ Users Table (with role-based access)             │  │
│  │ ├─ Projects Table (with ownership tracking)          │  │
│  │ ├─ Tasks Table (with assignments & priority)         │  │
│  │ └─ Audit Logs Table (immutable trail)                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  PostgreSQL 16 Database                                    │
└──────────────────────────────────────────────────────────────┘
```

See detailed database ERD: [Database Entity Relationship Diagram](docs/images/database-erd.svg)

## Installation

### Prerequisites
- Docker and Docker Compose (recommended)
- Node.js 20+ (for local development)
- PostgreSQL 16+ (for local development)

### Quick Start with Docker

```bash
# Navigate to project directory
cd workspace-hub

# Start all services
docker-compose up -d

# Services will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# Database: localhost:5432
```

The database will automatically initialize with migrations and seed data on first run.

### Local Development Setup

#### Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Setup database
npm run prisma:push
npm run seed

# Start development server
npm run dev
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

### Backend (.env)

```
# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend (CORS)
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your_jwt_secret_key_at_least_32_characters_long
JWT_EXPIRES_IN=24h

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/workspace_hub_db
```

## Demo Video

**[📹 Watch Full Demo on YouTube](#)** ← *Update with actual YouTube link after recording*

See detailed recording guide: [VIDEO_RECORDING_GUIDE.md](VIDEO_RECORDING_GUIDE.md)

The demo covers:
- System startup with docker-compose
- Tenant registration and multi-tenancy
- User authentication and role-based access
- Project and task management
- Multi-tenant data isolation verification
- Code walkthrough of key components

---

## Documentation

- **Architecture**: [System Architecture Diagram](docs/images/system-architecture.svg)
- **Database**: [Database ERD](docs/images/database-erd.svg)
- **API Docs**: [Complete API Reference](docs/API.md)
- **Research**: [Multi-tenancy Analysis & Tech Stack](docs/research.md)
- **PRD**: [Product Requirements Document](docs/PRD.md)
- **Tech Spec**: [Technical Specification](docs/technical-spec.md)
- **Video Guide**: [Video Recording Checklist](VIDEO_RECORDING_GUIDE.md)

---

### Authentication (4 endpoints)
- POST /api/auth/register-tenant - Register new tenant
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user profile
- POST /api/auth/logout - Logout

### Tenants (3 endpoints)
- GET /api/tenants/:tenantId - Get tenant details
- PUT /api/tenants/:tenantId - Update tenant
- GET /api/tenants - List all tenants (super_admin only)

### Users (4 endpoints)
- POST /api/users - Add user to tenant
- GET /api/users - List tenant users
- PUT /api/users/:userId - Update user
- DELETE /api/users/:userId - Delete user

### Projects (4 endpoints)
- POST /api/projects - Create project
- GET /api/projects - List projects
- PUT /api/projects/:projectId - Update project
- DELETE /api/projects/:projectId - Delete project

### Tasks (5 endpoints)
- POST /api/projects/:projectId/tasks - Create task
- GET /api/projects/:projectId/tasks - List tasks
- PUT /api/tasks/:taskId - Update task
- PATCH /api/tasks/:taskId/status - Update task status
- DELETE /api/tasks/:taskId - Delete task

## Database Schema

### Tenants Table
```sql
id (UUID, PK) | subdomain (String, Unique) | name (String) | 
maxUsers (Int) | maxProjects (Int) | createdAt | updatedAt
```

### Users Table
```sql
id (UUID, PK) | tenantId (UUID, FK) | email (Unique per tenant) | 
fullName | passwordHash | role (ENUM) | createdAt | updatedAt
```

### Projects Table
```sql
id (UUID, PK) | tenantId (UUID, FK) | name | description | 
status (ENUM) | createdBy (UUID, FK→Users) | createdAt | updatedAt
```

### Tasks Table
```sql
id (UUID, PK) | projectId (UUID, FK) | tenantId (UUID, FK) | 
title | description | status (ENUM) | priority (ENUM) | 
assignedTo (UUID, FK→Users) | dueDate | createdAt | updatedAt
```

### Audit Logs Table
```sql
id (UUID, PK) | tenantId (UUID, FK) | userId (UUID, FK) | 
action (String) | entityType (String) | entityId (UUID) | 
changes (JSON) | timestamp | ipAddress
```

## Data Isolation & Security

### Multi-Tenancy Isolation
- Every database query filters by tenant_id
- Row-level security through explicit WHERE clauses
- Composite unique constraints: (tenant_id, email)
- Super admin exception: tenant_id = NULL for system users
- Foreign key constraints with CASCADE delete for data integrity

### Authentication & Authorization
- JWT tokens with 24-hour expiry
- Password hashing with bcrypt (10 salt rounds)
- Role-based access control (RBAC) middleware
- Protected routes requiring authentication
- Request validation using Zod schemas

### Audit Trail
- Immutable audit log for compliance
- All mutations logged with user, action, and timestamp
- IP address tracking for security
- Complete change history for data recovery

## Subscription Plans

| Plan | Max Users | Max Projects | Features |
|------|-----------|--------------|----------|
| Free | 5 | 3 | Basic project management |
| Pro | 25 | 15 | Advanced features, 50GB storage |
| Enterprise | 100 | 50 | Dedicated support, custom limits |

## Testing with Seed Data

After running `docker-compose up` or seed script, use these credentials:

### Super Admin
- Email: `superadmin@system.com`
- Password: `Admin@123`
- Role: `super_admin`

### Demo Tenant (subdomain: demo)

**Tenant Admin**
- Email: `admin@demo.com`
- Password: `Demo@123`
- Role: `tenant_admin`

**Regular Users**
- Email: `user1@demo.com` / Password: `User@123`
- Email: `user2@demo.com` / Password: `User@123`
- Role: `user`

## File Structure

```
workspace-hub/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers (auth, projects, tasks, etc)
│   │   ├── models/          # Database access layer
│   │   ├── routes/          # Route definitions
│   │   ├── middleware/      # Auth, RBAC, error handling
│   │   ├── utils/           # JWT, crypto, audit logging, responses
│   │   ├── config/          # Environment configuration
│   │   ├── db/              # Prisma client
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server initialization
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema definition
│   │   ├── seed.js          # Seed data script
│   │   └── migrations/      # Database migrations
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # Page components (Login, Projects, etc)
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth context for state
│   │   ├── api/             # Axios client configuration
│   │   ├── App.jsx          # Main app with routes
│   │   ├── main.jsx         # Entry point
│   │   └── styles.css       # Global styles
│   ├── Dockerfile
│   ├── vite.config.js
│   └── package.json
├── docs/
│   ├── API.md               # Complete API documentation
│   ├── SYSTEM_ARCHITECTURE_DETAILED.md  # Architecture diagrams
│   ├── DATABASE_ERD.md      # Database relationships
│   ├── PRD.md               # Product requirements document
│   ├── architecture.md      # Original architecture doc
│   ├── technical-spec.md    # Technical specifications
│   └── research.md          # Research document
├── docker-compose.yml       # Multi-container setup
├── README.md                # This file
└── requirements.txt         # Project requirements specification
```

## Docker Deployment

### Docker Compose Services

1. **PostgreSQL (database)**
   - Image: postgres:16-alpine
   - Port: 5432
   - Volume: db_data for persistence
   - Health check: Every 5 seconds

2. **Backend (backend)**
   - Node.js 20 with Express
   - Port: 5000
   - Environment: DATABASE_URL, JWT_SECRET, etc
   - Auto-runs migrations and seed on startup
   - Depends on: database

3. **Frontend (frontend)**
   - React + Vite
   - Port: 3000
   - Served via 'serve' package
   - Depends on: backend

### Running in Production

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Health Checks

Both backend and database include health check endpoints:

```bash
# Database health
docker-compose ps

# Backend health (after 10 second startup)
curl http://localhost:5000/health
```

## Common Issues

### Port Already in Use
- Change port in docker-compose.yml or local .env
- Or kill process: `lsof -i :5000` then `kill -9 <PID>`

### Database Connection Error
- Ensure PostgreSQL container is running: `docker-compose ps`
- Check connection string in .env or docker-compose.yml
- Run migrations: `npm run prisma:push`

### Frontend Can't Connect to Backend
- Verify CORS settings in backend/src/app.js
- Check FRONTEND_URL matches frontend actual URL
- Ensure backend is running on correct port

### Module Not Found Errors
- Clear node_modules: `rm -rf node_modules` && `npm install`
- Clear npm cache: `npm cache clean --force`
- Rebuild Docker images: `docker-compose build --no-cache`

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and test locally**
   ```bash
   docker-compose up -d
   # Test in browser: http://localhost:3000
   ```

3. **Commit with descriptive messages**
   ```bash
   git commit -m "feat(module): description of changes"
   ```

4. **Push to remote**
   ```bash
   git push origin feature/your-feature
   ```

5. **Create pull request for review**

### Conventional Commit Format
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `chore:` Build, dependencies, etc

## Performance Optimization

- Database indices on frequently queried columns (tenant_id, email)
- Connection pooling via Prisma
- JWT tokens for stateless authentication (no session table)
- Frontend code splitting with Vite
- CSS optimization in production build
- Environment-based API URLs

## Security Best Practices

1. **Environment Variables**: Never commit .env files
2. **JWT Secret**: Use strong, random secret (min 32 chars)
3. **CORS**: Whitelist specific frontend URL only
4. **SQL Injection**: Prisma parameterizes all queries
5. **Password**: Hashed with bcrypt, never stored plain text
6. **Audit Logging**: All changes tracked and immutable
7. **Rate Limiting**: Consider adding in production
8. **HTTPS**: Use in production deployment

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and confidential. All rights reserved.

## Support

For issues, questions, or suggestions:
- Create an issue in the repository
- Contact the development team
- Review API documentation in `docs/API.md`
- Check troubleshooting section above

---

**Last Updated**: December 2025
**Version**: 1.0.0
**Status**: Production Ready
