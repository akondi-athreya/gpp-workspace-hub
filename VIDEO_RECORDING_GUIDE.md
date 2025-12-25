# Video Demo Recording Checklist & Guide

## 📹 **Video Demo Requirements**

**Duration**: 5-10 minutes  
**Format**: Screen recording with narration  
**Platform**: YouTube (unlisted or public)  
**Audio**: Clear microphone (not required to be professional, but must be audible)

---

## 🎬 **PART 1: Introduction (30 seconds)**

### Script:
```
"Hi, I'm [Your Name]. This is a demonstration of Workspace Hub, 
a production-ready multi-tenant SaaS platform for project and task management.

Today, I'll show you:
- The system architecture
- How the application starts with Docker
- Multi-tenancy and data isolation in action
- Role-based access control
- Complete CRUD operations on projects and tasks
- Code walkthrough of key components"
```

### Action Items:
- [ ] State your name clearly
- [ ] Show the project repository (optional)
- [ ] Mention the key technologies

---

## 🎬 **PART 2: Environment Setup (1 minute)**

### Action Items:
- [ ] Open terminal
- [ ] Navigate to workspace-hub directory
- [ ] Show file structure:
  ```bash
  ls -la
  # Should show: docker-compose.yml, backend/, frontend/, docs/, README.md
  ```
- [ ] Run docker-compose:
  ```bash
  docker-compose up -d
  ```
- [ ] Wait 30-60 seconds for services to start
- [ ] Verify all services are healthy:
  ```bash
  docker-compose ps
  # All three services should show "Up"
  ```
- [ ] Check health endpoint:
  ```bash
  curl http://localhost:5000/api/health
  # Should return: {"status":"ok","database":"connected"}
  ```

### Script:
```
"I have three services running in Docker: PostgreSQL database on port 5432,
Node.js backend API on port 5000, and React frontend on port 3000.
All services are already initialized with seed data including a super admin,
demo tenant, and sample projects and tasks."
```

---

## 🎬 **PART 3: Frontend Access (30 seconds)**

### Action Items:
- [ ] Open browser at http://localhost:3000
- [ ] Show login page
- [ ] Show register link

### Script:
```
"Here's the login page. Users can either register a new tenant 
or login with existing credentials."
```

---

## 🎬 **PART 4: Tenant Registration (1 minute)**

### Action Items:
- [ ] Click "Register" link
- [ ] Fill in form with test data:
  ```
  Organization Name: Test Company Beta
  Subdomain: testbeta
  Admin Email: admin@testbeta.com
  Admin Full Name: Beta Admin
  Password: TestBeta@123
  Confirm Password: TestBeta@123
  ```
- [ ] Submit form
- [ ] Show success message
- [ ] Show redirect to login page

### Script:
```
"Each organization registers with a unique subdomain. This subdomain 
is used during login to identify which tenant the user belongs to.
The system creates the tenant and the admin user in a single database transaction,
ensuring data consistency."
```

---

## 🎬 **PART 5: User Login - Tenant Admin (1 minute)**

### Action Items:
- [ ] Login with Demo Tenant Admin:
  ```
  Email: admin@demo.com
  Password: Demo@123
  Tenant Subdomain: demo
  ```
- [ ] Show successful login
- [ ] Show redirect to dashboard

### Script:
```
"Now I'm logging in as the tenant admin for the Demo Company.
The JWT token is stored in localStorage and sent with every API request.
The token contains the user's ID, tenant ID, and role."
```

---

## 🎬 **PART 6: Dashboard Overview (1 minute)**

### Action Items:
- [ ] Show Dashboard page
- [ ] Point out statistics cards:
  - [ ] Total Projects count
  - [ ] Total Tasks count
  - [ ] Completed Tasks count
  - [ ] Pending Tasks count
- [ ] Show Recent Projects section
- [ ] Show My Tasks section (tasks assigned to current user)

### Script:
```
"The dashboard provides an overview with key metrics:
- Total projects in the tenant
- Task status breakdown
- Recent projects with their details
- Your assigned tasks for quick access

The API automatically filters all data by the user's tenant ID,
so users only see their own tenant's data."
```

---

## 🎬 **PART 7: Projects Management (2 minutes)**

### Action Items:
- [ ] Navigate to Projects page
- [ ] Show existing projects (Website Redesign, Mobile App Development)
- [ ] Click on a project to show details
- [ ] Create new project:
  ```
  Name: Mobile Dashboard
  Description: Build mobile dashboard for analytics
  Status: active
  ```
- [ ] Show project created in list
- [ ] Show task count updated
- [ ] Demonstrate update project:
  - [ ] Click edit
  - [ ] Change name to "Mobile Dashboard UI"
  - [ ] Show updated in list

### Script:
```
"Here's the projects list. Each project shows the name, description, 
status, task count, and creator. Tenant admins and project creators 
can edit or delete projects.

I'll create a new project. The system checks the subscription limit 
before allowing creation. If the tenant reaches their max_projects limit,
the creation is blocked with a 403 error."
```

---

## 🎬 **PART 8: Task Management (2 minutes)**

### Action Items:
- [ ] Click on a project to show tasks
- [ ] Show existing tasks with:
  - [ ] Title, description
  - [ ] Status (todo, in_progress, completed)
  - [ ] Priority (low, medium, high)
  - [ ] Assigned user
  - [ ] Due date
- [ ] Create a new task:
  ```
  Title: Implement user authentication
  Description: Add JWT-based login
  Assigned To: [Select a user]
  Priority: High
  Due Date: 2025-01-15
  ```
- [ ] Show task created
- [ ] Update task status:
  - [ ] Click on task
  - [ ] Change status to "in_progress"
  - [ ] Show status updated
- [ ] Assign task to another user

### Script:
```
"Tasks are organized within projects. Each task has a status, priority,
optional assignment, and due date. Users can quickly update task status
with a single click, and tenant admins can assign tasks to team members.

The system enforces tenant isolation, so a task assigned to user from 
another tenant will be rejected."
```

---

## 🎬 **PART 9: User Management (1 minute)**

### Action Items:
- [ ] Navigate to Users page
- [ ] Show list of users with:
  - [ ] Full name
  - [ ] Email
  - [ ] Role (user, tenant_admin)
  - [ ] Status (Active/Inactive)
- [ ] Add a new user:
  ```
  Email: newuser@demo.com
  Full Name: New Developer
  Role: user
  Password: NewPass@123
  ```
- [ ] Show user added to list
- [ ] Show subscription limit message if trying to exceed max_users

### Script:
```
"The Users page allows tenant admins to manage team members.
You can invite new users, assign roles, and deactivate accounts.
The system enforces subscription limits - this tenant on the 'pro' plan
can have up to 25 users."
```

---

## 🎬 **PART 10: Multi-Tenancy & Data Isolation Demo (1.5 minutes)**

### Action Items:
- [ ] Logout from Demo tenant
- [ ] Login with newly created tenant (testbeta/admin@testbeta.com / TestBeta@123)
- [ ] Show empty dashboard (no projects, no tasks from Demo tenant)
- [ ] Show Users page (only has the admin, no other users)
- [ ] Create a project in this tenant
- [ ] Logout again
- [ ] Login back to Demo tenant (admin@demo.com)
- [ ] Show Demo tenant's projects are still there
- [ ] Show the new project from Test Beta tenant is NOT visible

### Script:
```
"This is the core multi-tenancy feature. Each tenant's data is completely isolated.

I'm now logged into the Test Beta tenant we just created.
Notice there are no projects or tasks here - it's a separate workspace.

After creating a project here and switching back to the Demo tenant,
the Demo tenant's data is unchanged and the new project is not visible.

Every API query is automatically filtered by the user's tenant ID from the JWT token.
This is enforced in the database layer and middleware to prevent accidental data leaks."
```

---

## 🎬 **PART 11: Authorization & Role-Based Access (1 minute)**

### Action Items:
- [ ] Show navigation menu items visible to tenant_admin:
  - [ ] Dashboard ✅
  - [ ] Projects ✅
  - [ ] Users ✅
  - [ ] Tenants (Only for super_admin) ❌ Not visible
- [ ] Logout and login as a regular User:
  - [ ] Email: user1@demo.com
  - [ ] Password: User@123
  - [ ] Subdomain: demo
- [ ] Show navigation menu items visible to regular user:
  - [ ] Dashboard ✅
  - [ ] Projects ✅
  - [ ] Users ❌ Not visible (only tenant_admin)
  - [ ] Tenants ❌ Not visible (only super_admin)
- [ ] Show user cannot create projects, add users, or update tenant settings

### Script:
```
"The application implements role-based access control.

Tenant admins can manage users, projects, and tasks within their tenant.
Regular users can view projects and tasks, and can update task status for their assignments.

Super admins can access all tenants and manage system-wide settings like subscription plans.

The frontend shows/hides UI elements based on the user's role.
The backend enforces authorization on every API endpoint,
so direct API calls without proper permissions are rejected with a 403 Forbidden error."
```

---

## 🎬 **PART 12: API Testing in Terminal (1 minute)**

### Action Items:
- [ ] Open terminal
- [ ] Show API request to create a task with invalid data:
  ```bash
  curl -X POST http://localhost:5000/api/projects/invalid-id/tasks \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer [valid-token]" \
    -d '{"title": "Invalid Task"}'
  # Should return: {"success":false,"message":"Invalid project ID format","statusCode":400}
  ```
- [ ] Show attempt to access another tenant's project (should get 403)
- [ ] Show database is being queried with tenant isolation

### Script:
```
"The API includes comprehensive validation and error handling.
Invalid requests return appropriate HTTP status codes and error messages.
The backend validates input, checks authorization, and enforces business rules
like subscription limits and tenant isolation."
```

---

## 🎬 **PART 13: Code Walkthrough (2 minutes)**

### Open and Show Key Files:

#### 1. Database Schema (30 seconds)
- [ ] Open `backend/prisma/schema.prisma`
- [ ] Show Tenant model
- [ ] Show User model with tenant_id
- [ ] Show Task model with tenant_id and project_id
- [ ] Point out CASCADE delete relationships

**Script**:
```
"Here's the Prisma schema that defines our database structure.
Notice the tenant_id field on users, projects, and tasks.
This is how we enforce data isolation - every record belongs to a tenant.

Super admin users have tenant_id = NULL, so they can access any tenant's data."
```

#### 2. Authentication Middleware (30 seconds)
- [ ] Open `backend/src/middleware/auth.js`
- [ ] Show JWT verification
- [ ] Show token payload extraction

**Script**:
```
"The authentication middleware verifies the JWT token and extracts the user's
ID, tenant ID, and role. This information is attached to the request and used
by subsequent middleware and controllers to enforce authorization and tenant isolation."
```

#### 3. RBAC Middleware (30 seconds)
- [ ] Open `backend/src/middleware/rbac.js`
- [ ] Show requireRole function
- [ ] Show how it checks user roles

**Script**:
```
"The RBAC middleware enforces role-based access control.
Each API endpoint is protected with this middleware to ensure only authorized
users can perform certain actions. For example, only tenant admins can create users."
```

#### 4. API Controller Example (30 seconds)
- [ ] Open `backend/src/controllers/projects.controller.js`
- [ ] Show createProject function
- [ ] Highlight:
  - [ ] Input validation
  - [ ] Tenant isolation check
  - [ ] Subscription limit check
  - [ ] Audit logging
  - [ ] Error handling

**Script**:
```
"Here's a project creation endpoint. It validates the input, checks if the
tenant has reached their subscription limit, creates the project with the
user's tenant ID, logs the action in audit_logs, and returns the result.

Every endpoint follows this pattern of validation, authorization, business logic,
and audit logging."
```

---

## 🎬 **PART 14: Database & Docker (1 minute)**

### Action Items:
- [ ] Show docker-compose.yml:
  ```bash
  cat docker-compose.yml | head -50
  ```
- [ ] Point out:
  - [ ] Service names: database, backend, frontend
  - [ ] Port mappings: 5432, 5000, 3000
  - [ ] Health checks
  - [ ] Environment variables
  - [ ] Volume for database persistence

### Script:
```
"The entire application is containerized with Docker. Three services run together:

1. Database: PostgreSQL with persistent volume and health check
2. Backend: Node.js API with automatic migrations and seeding
3. Frontend: React application served by the 'serve' package

The docker-entrypoint.sh script automatically runs migrations and seeds the database
when the backend starts, so there are no manual setup steps needed."
```

---

## 🎬 **PART 15: Conclusion (30 seconds)**

### Script:
```
"That's a complete walkthrough of Workspace Hub!

Key features demonstrated:
✓ Multi-tenancy with complete data isolation
✓ Role-based access control
✓ JWT authentication with 24-hour expiry
✓ Project and task management
✓ Subscription plan limits
✓ Audit logging for compliance
✓ Docker containerization for easy deployment
✓ 19 RESTful API endpoints
✓ Responsive React frontend

The code is open source and production-ready. 
Thank you for watching!"
```

### Action Items:
- [ ] Mention GitHub repository link (optional)
- [ ] Thank viewers

---

## 📋 **Recording Equipment Checklist**

- [ ] Screen recording software installed (OBS, Screenflare, built-in Mac screen record)
- [ ] Microphone working and tested
- [ ] Background noise minimized
- [ ] High resolution (1280x720 minimum, 1920x1080 preferred)
- [ ] Clear, audible audio
- [ ] Sufficient disk space for recording (500MB - 2GB)

---

## 🎥 **Recording Tips**

1. **Do a Dry Run**: Record a short test to check audio and video quality
2. **Slow Down**: Speak slowly and clearly, pause between sections
3. **Take Breaks**: You can edit/combine multiple recordings or do it in one take
4. **Show Don't Tell**: Let the screen do the talking - show every action
5. **No Editing Required**: Single take is fine, no fancy effects needed
6. **Audio Matters More**: Bad video but good audio is acceptable. Bad audio is not.
7. **Narrator Tone**: Be confident and clear, like explaining to a colleague

---

## 🚀 **After Recording**

1. Save video file locally
2. Upload to YouTube:
   - Go to youtube.com
   - Click "Create" → "Upload video"
   - Select your video file
   - Add title: "Workspace Hub - Multi-Tenant SaaS Demo"
   - Set to "Unlisted" (not public by default)
   - Add description with:
     - Link to GitHub repo
     - Key features list
     - Technologies used
3. Copy YouTube URL
4. Add YouTube link to README.md:
   ```markdown
   ## Demo Video
   [Watch Demo on YouTube](https://www.youtube.com/watch?v=xxxxx)
   ```
5. Submit YouTube link in submission form

---

## 📝 **Final Checklist Before Submission**

- [ ] Video recorded and uploaded to YouTube
- [ ] YouTube link added to README.md
- [ ] Diagrams created in docs/images/:
  - [ ] system-architecture.svg (or .png)
  - [ ] database-erd.svg (or .png)
- [ ] All code is committed to Git
- [ ] submission.json has correct test credentials
- [ ] Docker setup verified working with `docker-compose up -d`
- [ ] All 3 services healthy (docker-compose ps)
- [ ] Health check responding (curl /api/health)
- [ ] Frontend accessible at http://localhost:3000
- [ ] Can login with test credentials from submission.json
- [ ] All 19 API endpoints working
- [ ] .env file committed (not in .gitignore)

---

**You're all set! The video is the final piece. Good luck! 🎉**
