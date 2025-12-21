import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Users() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            if (!user?.tenant?.id) return setLoading(false);
            setError('');
            try {
                const { data } = await api.get(`/tenants/${user.tenant.id}/users`);
                setUsers(data.data.users || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load users');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    if (loading) return <div className="card">Loading users...</div>;

    return (
        <div className="card">
            <h2>Users</h2>
            {error && <div className="error">{error}</div>}
            <ul className="list">
                {users.map((u) => (
                    <li key={u.id}>
                        <div className="row">
                            <div>
                                <strong>{u.fullName}</strong>
                                <div className="meta">{u.email}</div>
                            </div>
                            <div className="tag">{u.role}</div>
                        </div>
                    </li>
                ))}
                {users.length === 0 && <li>No users yet.</li>}
            </ul>
        </div>
    );
}
