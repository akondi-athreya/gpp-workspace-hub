import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: '', password: '', tenantSubdomain: '' });
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card narrow" style={{ boxShadow: '0 20px 60px rgba(37, 99, 235, 0.15)' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: '#1f2937' }}>Welcome Back</h2>
                <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Sign in to your workspace</p>
            </div>
            <form onSubmit={handleSubmit} className="form">
                <label>
                    Email
                    <input name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" required />
                </label>
                <label>
                    Password
                    <div style={{ position: 'relative' }}>
                        <input 
                            name="password" 
                            type={showPassword ? 'text' : 'password'} 
                            value={form.password} 
                            onChange={onChange} 
                            placeholder="Enter your password"
                            required 
                            style={{ paddingRight: '80px' }}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ 
                                position: 'absolute', 
                                right: '8px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                background: 'transparent', 
                                border: 'none', 
                                color: '#2563eb', 
                                cursor: 'pointer',
                                fontSize: '1.1em',
                                padding: '4px 8px',
                                fontWeight: '600'
                            }}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </label>
                <label>
                    Tenant Subdomain
                    <input name="tenantSubdomain" value={form.tenantSubdomain} onChange={onChange} placeholder="demo" />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                        type="checkbox" 
                        checked={rememberMe} 
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ width: 'auto', margin: 0 }}
                    />
                    <span>Remember me</span>
                </label>
                {error && <div className="error">{error}</div>}
                <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                <p style={{ color: '#6b7280' }}>Need an account? <Link to="/register" style={{ fontWeight: '600', color: '#2563eb' }}>Register tenant</Link></p>
            </div>
        </div>
    );
}
