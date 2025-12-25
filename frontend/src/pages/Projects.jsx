import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Projects() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });
    const [creating, setCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [editingProject, setEditingProject] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', description: '', status: 'active' });

    useEffect(() => {
        const load = async () => {
            setError('');
            try {
                const { data } = await api.get('/projects');
                setProjects(data.data.projects || []);
                setFilteredProjects(data.data.projects || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load projects');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        let filtered = projects;
        if (searchTerm) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => p.status === statusFilter);
        }
        setFilteredProjects(filtered);
    }, [searchTerm, statusFilter, projects]);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newProject.name.trim()) {
            setError('Project name is required');
            return;
        }
        setCreating(true);
        try {
            const { data } = await api.post('/projects', newProject);
            setProjects([...projects, data.data]);
            setNewProject({ name: '', description: '' });
            setShowCreateForm(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create project');
        } finally {
            setCreating(false);
        }
    };

    const handleEditProject = async (e) => {
        e.preventDefault();
        if (!editForm.name.trim()) {
            setError('Project name is required');
            return;
        }
        try {
            const { data } = await api.put(`/projects/${editingProject}`, editForm);
            setProjects(projects.map(p => p.id === editingProject ? { ...p, ...data.data } : p));
            setEditingProject(null);
            setEditForm({ name: '', description: '', status: 'active' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update project');
        }
    };

    const startEdit = (project) => {
        setEditingProject(project.id);
        setEditForm({ name: project.name, description: project.description || '', status: project.status });
    };

    const handleDelete = async (projectId) => {
        if (!window.confirm('Are you sure you want to delete this project? All tasks will be deleted.')) {
            return;
        }
        setDeleting(projectId);
        try {
            await api.delete(`/projects/${projectId}`);
            setProjects(projects.filter(p => p.id !== projectId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete project');
        } finally {
            setDeleting(null);
        }
    };

    if (loading) return <div className="card">Loading projects...</div>;

    return (
        <>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '2.5rem', color: '#2d3748' }}>Projects</h1>
                <p style={{ margin: 0, color: '#718096', fontSize: '1.1rem' }}>Manage all your workspace projects</p>
            </div>
            <div className="card">
            <div className="card-head">
                <h2 style={{ margin: 0 }}>All Projects</h2>
                <button 
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    style={{ 
                        padding: '10px 20px', 
                        background: showCreateForm ? '#cbd5e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '10px', 
                        cursor: 'pointer',
                        fontWeight: '600',
                        boxShadow: showCreateForm ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {showCreateForm ? '❌ Cancel' : '➕ New Project'}
                </button>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input 
                    type="text" 
                    placeholder="🔍 Search by project name..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                        flex: 1, 
                        padding: '12px 16px', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        minWidth: '200px'
                    }}
                />
                <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)} 
                    style={{ 
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '2px solid #e2e8f0',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '0.95rem'
                    }}
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
            
            {error && <div className="error" style={{ marginBottom: '20px' }}>{error}</div>}
            
            {showCreateForm && (
                <form onSubmit={handleCreateProject} className="form" style={{ 
                    marginBottom: '24px', 
                    padding: '24px', 
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)', 
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0'
                }}>
                    <h4 style={{ marginTop: 0, marginBottom: '16px', color: '#2d3748', fontSize: '1.2rem' }}>✨ Create New Project</h4>
                    <label>Project Name
                        <input 
                            type="text" 
                            value={newProject.name} 
                            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                            required
                        />
                    </label>
                    <label>Description
                        <textarea 
                            value={newProject.description} 
                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                            style={{ minHeight: '60px' }}
                        />
                    </label>
                    <button type="submit" disabled={creating}>
                        {creating ? 'Creating...' : 'Create Project'}
                    </button>
                </form>
            )}
            
            {editingProject && (
                <form onSubmit={handleEditProject} className="form" style={{ 
                    marginBottom: '24px', 
                    padding: '24px', 
                    background: 'linear-gradient(135deg, rgba(77, 171, 247, 0.05) 0%, rgba(0, 242, 254, 0.05) 100%)', 
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0'
                }}>
                    <h4 style={{ marginTop: 0, marginBottom: '16px', color: '#2d3748', fontSize: '1.2rem' }}>✏️ Edit Project</h4>
                    <label>Project Name
                        <input 
                            type="text" 
                            value={editForm.name} 
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            required
                        />
                    </label>
                    <label>Description
                        <textarea 
                            value={editForm.description} 
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            style={{ minHeight: '60px' }}
                        />
                    </label>
                    <label>Status
                        <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                            <option value="completed">Completed</option>
                        </select>
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="submit" style={{ flex: 1 }}>Update Project</button>
                        <button 
                            type="button" 
                            onClick={() => setEditingProject(null)} 
                            style={{ 
                                flex: 1,
                                background: '#718096',
                                boxShadow: '0 4px 12px rgba(113, 128, 150, 0.3)'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
            
            <ul className="list">
                {filteredProjects.map((p) => (
                    <li key={p.id}>
                        <div className="row">
                            <div>
                                <strong>{p.name}</strong>
                                <div className="meta">{p.description || 'No description'}</div>
                                <div className="meta">Status: {p.status} · Tasks: {p.taskCount} · Done: {p.completedTaskCount}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <Link 
                                    className="link" 
                                    to={`/projects/${p.id}`}
                                    style={{ 
                                        padding: '8px 16px',
                                        background: '#667eea',
                                        color: 'white',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    👁️ View
                                </Link>
                                <button 
                                    onClick={() => startEdit(p)}
                                    style={{ 
                                        padding: '8px 16px', 
                                        background: '#4facfe', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '8px', 
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    ✏️ Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(p.id)}
                                    disabled={deleting === p.id}
                                    style={{ 
                                        padding: '8px 16px', 
                                        background: deleting === p.id ? '#cbd5e0' : '#f5576c', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '8px', 
                                        cursor: deleting === p.id ? 'not-allowed' : 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {deleting === p.id ? '⏳ Deleting...' : '🗑️ Delete'}
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
                {filteredProjects.length === 0 && <li style={{ textAlign: 'center', padding: '40px', color: '#718096', fontSize: '1.1rem' }}>📭 No projects found. Create your first project!</li>}
            </ul>
        </div>
        </>
    );
}
