# Contributing to Workspace Hub

Thank you for your interest in contributing to Workspace Hub! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on improving the codebase
- Help others learn and grow

## Getting Started

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone <your-fork-url>
   cd workspace-hub
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites
- Docker Desktop (20+)
- Node.js (20+)
- Git
- Code editor (VS Code recommended)

### Local Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npm run seed

# Start development server
npm run dev
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

```
workspace-hub/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Business logic & database queries
│   │   ├── routes/       # API route definitions
│   │   ├── middleware/   # Auth, RBAC, error handling
│   │   ├── utils/        # Helper functions
│   │   └── config/       # Environment configuration
│   ├── prisma/           # Database schema & migrations
│   └── Dockerfile
├── frontend/             # React SPA
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React Context (state)
│   │   └── api/          # API client
│   └── Dockerfile
├── docs/                 # Documentation
└── docker-compose.yml    # Service orchestration
```

## Making Changes

### 1. Code Style

**Backend (JavaScript):**
- Use ES6+ features
- Use `const` and `let` (no `var`)
- Use async/await (no callbacks)
- Comment complex logic
- Keep functions small and focused

**Frontend (React):**
- Use functional components with hooks
- Use arrow functions
- Keep components small and reusable
- Use meaningful variable names
- Comment complex JSX

### 2. Commit Messages

Follow conventional commits:

```
type(scope): subject

body (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add password reset functionality
fix(tasks): correct date filtering bug
docs(api): update endpoint documentation
```

### 3. Testing

Before submitting:

```bash
# Start services
docker-compose up -d

# Test health endpoint
curl http://localhost:5000/api/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "Demo@123",
    "tenantSubdomain": "demo"
  }'

# Verify frontend loads
open http://localhost:3000
```

## Pull Request Process

### 1. Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation updated (if needed)
- [ ] Commit messages are clear
- [ ] No merge conflicts with main branch

### 2. Submit Pull Request

1. Push your branch to your fork
2. Create Pull Request on GitHub
3. Fill out the PR template
4. Link related issues

### 3. PR Title Format

```
[Type] Brief description

Example:
[Feature] Add email verification
[Fix] Resolve task deletion cascade issue
[Docs] Update API examples
```

### 4. PR Description

Include:
- **What:** What changes were made
- **Why:** Why these changes are needed
- **How:** How the changes work
- **Testing:** How to test the changes
- **Screenshots:** If UI changes

### 5. Review Process

- Maintainers will review your PR
- Address feedback promptly
- Keep discussions focused and professional
- Be open to suggestions

## Adding Features

### New API Endpoint

1. **Create controller** in `backend/src/controllers/`
2. **Add route** in `backend/src/routes/`
3. **Add model logic** in `backend/src/models/`
4. **Update documentation** in `docs/API.md`
5. **Add examples** in `docs/API_EXAMPLES.md`

Example structure:
```javascript
// Controller
exports.myNewEndpoint = async (req, res, next) => {
  try {
    const result = await myModel.doSomething();
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

// Route
router.post('/my-endpoint', authenticate, requireRole(['admin']), myController.myNewEndpoint);

// Model
exports.doSomething = async () => {
  return await prisma.myTable.create({ /* ... */ });
};
```

### New Frontend Page

1. **Create page component** in `frontend/src/pages/`
2. **Add route** in `frontend/src/App.jsx`
3. **Add navigation link** (if needed)
4. **Create API functions** in `frontend/src/api/`

## Database Changes

### Adding a New Table

1. **Update Prisma schema** in `backend/prisma/schema.prisma`
2. **Create migration:**
   ```bash
   npx prisma migrate dev --name add_new_table
   ```
3. **Update seed file** if needed
4. **Update documentation**

### Modifying Existing Table

1. **Update Prisma schema**
2. **Create migration:**
   ```bash
   npx prisma migrate dev --name modify_table
   ```
3. **Test thoroughly** - may affect existing data

## Common Tasks

### Adding a New User Role

1. Update `enum Role` in `prisma/schema.prisma`
2. Update `requireRole` middleware usage
3. Update frontend role checks
4. Update documentation

### Adding a New Subscription Plan

1. Update `enum Plan` in `prisma/schema.prisma`
2. Update plan limits in tenant creation
3. Update limit checks in controllers
4. Update documentation

### Adding Audit Logging

Use the `logAudit` utility:

```javascript
const { logAudit } = require('../utils/audit');

await logAudit({
  tenantId: req.user.tenantId,
  userId: req.user.userId,
  action: 'CREATE_PROJECT',
  entityType: 'project',
  entityId: newProject.id,
  ipAddress: req.ip
});
```

## Debugging

### Backend Issues

```bash
# View backend logs
docker-compose logs -f backend

# Access backend container
docker exec -it backend sh

# Check database
docker exec -it database psql -U postgres -d workspace_hub_db
```

### Frontend Issues

```bash
# View frontend logs
docker-compose logs -f frontend

# Access frontend container
docker exec -it frontend sh

# Check browser console
# Open DevTools (F12) and check Console and Network tabs
```

### Database Issues

```bash
# Connect to database
docker exec -it database psql -U postgres -d workspace_hub_db

# List tables
\dt

# Describe table
\d users

# Query data
SELECT * FROM users;

# Exit
\q
```

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev/)
- [Docker Documentation](https://docs.docker.com/)

## Questions?

- Create an issue on GitHub
- Check existing documentation
- Review closed issues and PRs

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

Thank you for contributing to Workspace Hub! 🚀
