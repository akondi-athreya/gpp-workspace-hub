import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Users() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', fullName: '', password: '', role: 'user' });
    const [creating, setCreating] = useState(false);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ fullName: '', role: 'user' });
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(null);

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

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!newUser.email.trim() || !newUser.fullName.trim() || !newUser.password.trim()) {
            setError('Email, full name, and password are required');
            return;
        }
        setCreating(true);
        try {
            const { data } = await api.post(`/tenants/${user.tenant.id}/users`, newUser);
            setUsers([...users, data.data]);
            setNewUser({ email: '', fullName: '', password: '', role: 'user' });
            setShowCreateForm(false);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setCreating(false);
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        if (!editData.fullName.trim()) {
            setError('Full name is required');
            return;
        }
        setUpdating(true);
        try {
            const { data } = await api.put(`/users/${editingId}`, editData);
            setUsers(users.map(u => u.id === editingId ? data.data : u));
            setEditingId(null);
            setEditData({ fullName: '', role: 'user' });
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
        setDeleting(userId);
        try {
            await api.delete(`/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setDeleting(null);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = search === '' || 
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            u.fullName.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === '' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) return <div className="card">Loading users...</div>;

    const isAdmin = user?.role === 'tenant_admin' || user?.role === 'super_admin';

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2>Users</h2>
                {isAdmin && (
                    <button 
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        style={{ padding: '8px 15px', background: '#9b59b6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        {showCreateForm ? 'Cancel' : '+ Add User'}
                    </button>
                )}
            </div>
            {error && <div className="error">{error}</div>}

            {/* Search and Filter Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <input 
                    type="text" 
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                />
                <select 
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="tenant_admin">Admin</option>
                </select>
            </div>
            
            {showCreateForm && isAdmin && (
                <form onSubmit={handleCreateUser} className="form" style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
                    <label>Email
                        <input 
                            type="email" 
                            value={newUser.email} 
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            required
                        />
                    </label>
                    <label>Full Name
                        <input 
                            type="text" 
                            value={newUser.fullName} 
                            onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                            required
                        />
                    </label>
                    <label>Password
                        <input 
                            type="password" 
                            value={newUser.password} 
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            required
                        />
                    </label>
                    <label>Role
                        <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                            <option value="user">User</option>
                            <option value="tenant_admin">Admin</option>
                        </select>
                    </label>
                    <button type="submit" disabled={creating}>
                        {creating ? 'Adding...' : 'Add User'}
                    </button>
                </form>
            )}

            {/* Edit Modal */}
            {editingId && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <form onSubmit={handleEditUser} className="form" style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
                        <h3>Edit User</h3>
                        <label>Full Name
                            <input 
                                type="text" 
                                value={editData.fullName} 
                                onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                                required
                            />
                        </label>
                        <label>Role
                            <select value={editData.role} onChange={(e) => setEditData({ ...editData, role: e.target.value })}>
                                <option value="user">User</option>
                                <option value="tenant_admin">Admin</option>
                            </select>
                        </label>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setEditingId(null)} style={{ padding: '8px 15px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={updating} style={{ padding: '8px 15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                {updating ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {filteredUsers.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ background: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
                                <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Name</th>
                                <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Email</th>
                                <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Role</th>
                                <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Created</th>
                                {isAdmin && <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #eee', hover: { background: '#f9f9f9' } }}>
                                    <td style={{ padding: '10px' }}>{u.fullName}</td>
                                    <td style={{ padding: '10px' }}>{u.email}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{ padding: '4px 8px', background: u.role === 'tenant_admin' ? '#3498db' : '#95a5a6', color: 'white', borderRadius: '4px', fontSize: '12px' }}>
                                            {u.role === 'tenant_admin' ? 'Admin' : 'User'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    {isAdmin && (
                                        <td style={{ padding: '10px', display: 'flex', gap: '8px' }}>
                                            <button 
                                                onClick={() => {
                                                    setEditingId(u.id);
                                                    setEditData({ fullName: u.fullName, role: u.role });
                                                }}
                                                style={{ padding: '4px 10px', background: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(u.id, u.fullName)}
                                                disabled={deleting === u.id}
                                                style={{ padding: '4px 10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                            >
                                                {deleting === u.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                    {search || roleFilter ? 'No users match your filters.' : 'No users yet.'}
                </div>
            )}
        </div>
    );
}
