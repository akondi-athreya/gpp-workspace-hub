import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: '', password: '', tenantSubdomain: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form);
            const redirectTo = location.state?.from?.pathname || '/dashboard';
            navigate(redirectTo, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card narrow">
            <h2>Login</h2>
            <form onSubmit={handleSubmit} className="form">
                <label>Email
                    <input name="email" type="email" value={form.email} onChange={onChange} required />
                </label>
                <label>Password
                    <input name="password" type="password" value={form.password} onChange={onChange} required />
                </label>
                <label>Tenant Subdomain
                    <input name="tenantSubdomain" value={form.tenantSubdomain} onChange={onChange} placeholder="demo" required />
                </label>
                {error && <div className="error">{error}</div>}
                <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
            </form>
            <p>Need an account? <Link to="/register">Register tenant</Link></p>
        </div>
    );
}
