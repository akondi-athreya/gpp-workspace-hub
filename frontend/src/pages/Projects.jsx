import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        const load = async () => {
            setError('');
            try {
                const { data } = await api.get('/projects');
                setProjects(data.data.projects || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load projects');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

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
        <div className="card">
            <div className="card-head">
                <h2>Projects</h2>
            </div>
            {error && <div className="error">{error}</div>}
            <ul className="list">
                {projects.map((p) => (
                    <li key={p.id}>
                        <div className="row">
                            <div>
                                <strong>{p.name}</strong>
                                <div className="meta">{p.description || 'No description'}</div>
                                <div className="meta">Status: {p.status} · Tasks: {p.taskCount} · Done: {p.completedTaskCount}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <Link className="link" to={`/projects/${p.id}`}>View</Link>
                                <button 
                                    className="btn-delete" 
                                    onClick={() => handleDelete(p.id)}
                                    disabled={deleting === p.id}
                                    style={{ padding: '5px 10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: deleting === p.id ? 'not-allowed' : 'pointer' }}
                                >
                                    {deleting === p.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
                {projects.length === 0 && <li>No projects found.</li>}
            </ul>
        </div>
    );
}
