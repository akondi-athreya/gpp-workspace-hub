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
        confirmPassword: '',
        adminFullName: '',
        acceptedTerms: false,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (form.adminPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (form.adminPassword !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!form.acceptedTerms) {
            setError('You must accept the terms and conditions');
            return;
        }

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
        <div className="card narrow" style={{ boxShadow: '0 20px 60px rgba(37, 99, 235, 0.15)' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: '#1f2937' }}>Create Workspace</h2>
                <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Set up your organization's workspace</p>
            </div>
            <form onSubmit={handleSubmit} className="form">
                <label>
                    Organization Name
                    <input name="tenantName" value={form.tenantName} onChange={onChange} placeholder="Acme Corp" required />
                </label>
                <label>Subdomain
                    <input name="subdomain" value={form.subdomain} onChange={onChange} placeholder="yourteam" required />
                    {form.subdomain && <small style={{ color: '#666', fontSize: '0.85em', marginTop: '4px', display: 'block' }}>Your URL: {form.subdomain}.workspacehub.com</small>}
                </label>
                <label>
                    Admin Full Name
                    <input name="adminFullName" value={form.adminFullName} onChange={onChange} placeholder="John Doe" required />
                </label>
                <label>
                    Admin Email
                    <input type="email" name="adminEmail" value={form.adminEmail} onChange={onChange} placeholder="admin@acme.com" required />
                </label>
                <label>
                    Password (min 8 characters)
                    <div style={{ position: 'relative' }}>
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            name="adminPassword" 
                            value={form.adminPassword} 
                            onChange={onChange} 
                            required 
                            minLength={8} 
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
                    Confirm Password
                    <div style={{ position: 'relative' }}>
                        <input 
                            type={showConfirmPassword ? 'text' : 'password'} 
                            name="confirmPassword" 
                            value={form.confirmPassword} 
                            onChange={onChange} 
                            required 
                            style={{ paddingRight: '80px' }}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                            {showConfirmPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                        type="checkbox" 
                        name="acceptedTerms" 
                        checked={form.acceptedTerms} 
                        onChange={onChange} 
                        required 
                        style={{ width: 'auto', margin: 0 }}
                    />
                    <span>I accept the Terms & Conditions</span>
                </label>
                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}
                <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                <p style={{ color: '#6b7280' }}>Already have an account? <Link to="/login" style={{ fontWeight: '600', color: '#2563eb' }}>Login</Link></p>
            </div>
        </div>
    );
}
