import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetails from './pages/ProjectDetails.jsx';
import Users from './pages/Users.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

function Layout({ children }) {
    const { user, logout } = useAuth();

    return (
        <div className="app-shell">
            <header className="topbar">
                <div className="brand">Workspace Hub</div>
                {user ? (
                    <div className="user-meta">
                        <span>{user.fullName} · {user.role}</span>
                        <button onClick={logout}>Logout</button>
                    </div>
                ) : (
                    <div className="user-meta">
                        <Link to="/login">Login</Link>
                    </div>
                )}
            </header>
            {user && (
                <nav className="nav">
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/projects">Projects</Link>
                    <Link to="/users">Users</Link>
                </nav>
            )}
            <main className="content">{children}</main>
        </div>
    );
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Dashboard />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/projects"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Projects />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/projects/:projectId"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <ProjectDetails />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/users"
                element={
                    <ProtectedRoute requiredRole="tenant_admin">
                        <Layout>
                            <Users />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
