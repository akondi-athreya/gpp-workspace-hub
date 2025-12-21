import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        tenantName: '',
        subdomain: '',
        adminEmail: '',
        adminPassword: '',
        adminFullName: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await api.post('/auth/register-tenant', form);
            setSuccess('Tenant registered. Redirecting to login...');
            setTimeout(() => navigate('/login'), 1200);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card narrow">
            <h2>Register Tenant</h2>
            <form onSubmit={handleSubmit} className="form">
                <label>Organization Name
                    <input name="tenantName" value={form.tenantName} onChange={onChange} required />
                </label>
                <label>Subdomain
                    <input name="subdomain" value={form.subdomain} onChange={onChange} placeholder="yourteam" required />
                </label>
                <label>Admin Full Name
                    <input name="adminFullName" value={form.adminFullName} onChange={onChange} required />
                </label>
                <label>Admin Email
                    <input type="email" name="adminEmail" value={form.adminEmail} onChange={onChange} required />
                </label>
                <label>Password
                    <input type="password" name="adminPassword" value={form.adminPassword} onChange={onChange} required />
                </label>
                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}
                <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
            </form>
            <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    );
}
