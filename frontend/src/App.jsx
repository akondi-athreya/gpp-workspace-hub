import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState } from 'react';
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="app-shell">
            <header className="topbar">
                <div className="brand">Workspace Hub</div>
                {user && (
                    <button 
                        className="hamburger" 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{ 
                            display: 'none',
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '8px'
                        }}
                    >
                        ☰
                    </button>
                )}
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
                <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                    <Link to="/projects" onClick={() => setMobileMenuOpen(false)}>Projects</Link>
                    <Link to="/users" onClick={() => setMobileMenuOpen(false)}>Users</Link>
                </nav>
            )}
            <main className="content">{children}</main>
            <style>{`
                @media (max-width: 768px) {
                    .hamburger {
                        display: block !important;
                    }
                    .user-meta > span {
                        display: none;
                    }
                    .nav {
                        display: none;
                        position: fixed;
                        top: 60px;
                        left: 0;
                        right: 0;
                        background: #2c3e50;
                        flex-direction: column;
                        padding: 10px;
                        z-index: 1000;
                    }
                    .nav.mobile-open {
                        display: flex;
                    }
                }
            `}</style>
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
                    <ProtectedRoute requiredRole={['tenant_admin', 'super_admin']}>
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
