import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';

export default function ProjectDetails() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        const load = async () => {
            setError('');
            try {
                const [projRes, tasksRes] = await Promise.all([
                    api.get('/projects', { params: { search: '' } }),
                    api.get(`/projects/${projectId}/tasks`),
                ]);
                const found = projRes.data.data.projects?.find((p) => p.id === projectId) || null;
                setProject(found);
                setTasks(tasksRes.data.data.tasks || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load project');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [projectId]);

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) {
            return;
        }
        setDeleting(taskId);
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(tasks.filter(t => t.id !== taskId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete task');
        } finally {
            setDeleting(null);
        }
    };

    if (loading) return <div className="card">Loading project...</div>;
    if (error) return <div className="card error">{error}</div>;
    if (!project) return <div className="card">Project not found.</div>;

    return (
        <div className="grid">
            <div className="card">
                <h2>{project.name}</h2>
                <p>{project.description || 'No description provided.'}</p>
                <div className="meta">Status: {project.status}</div>
                <div className="meta">Created By: {project.createdBy?.fullName || 'N/A'}</div>
            </div>
            <div className="card">
                <h3>Tasks</h3>
                <ul className="list">
                    {tasks.map((t) => (
                        <li key={t.id}>
                            <div className="row">
                                <div>
                                    <strong>{t.title}</strong>
                                    <div className="meta">{t.status} · {t.priority}</div>
                                    {t.assignedTo && <div className="meta">Assigned: {t.assignedTo.fullName}</div>}
                                </div>
                                <button 
                                    className="btn-delete" 
                                    onClick={() => handleDeleteTask(t.id)}
                                    disabled={deleting === t.id}
                                    style={{ padding: '5px 10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: deleting === t.id ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                                >
                                    {deleting === t.id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </li>
                    ))}
                    {tasks.length === 0 && <li>No tasks yet.</li>}
                </ul>
            </div>
        </div>
    );
}
