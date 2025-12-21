import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [projectsRes] = await Promise.all([
                    api.get('/projects?limit=5'),
                ]);
                setProjects(projectsRes.data.data.projects || []);

                if (user) {
                    const tasksRes = await api.get(`/projects/${projectsRes.data.data.projects?.[0]?.id}/tasks`, {
                        params: { assignedTo: user.id, limit: 5 },
                    }).catch(() => ({ data: { data: { tasks: [] } } }));
                    setMyTasks(tasksRes.data.data.tasks || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    if (loading) return <div className="card">Loading dashboard...</div>;

    return (
        <div className="grid">
            <div className="card">
                <h3>Projects</h3>
                <ul className="list">
                    {projects.map((p) => (
                        <li key={p.id}>
                            <strong>{p.name}</strong>
                            <div className="meta">{p.status} · tasks: {p.taskCount}</div>
                        </li>
                    ))}
                    {projects.length === 0 && <li>No projects yet.</li>}
                </ul>
            </div>
            <div className="card">
                <h3>My Tasks</h3>
                <ul className="list">
                    {myTasks.map((t) => (
                        <li key={t.id}>
                            <strong>{t.title}</strong>
                            <div className="meta">{t.status} · {t.priority}</div>
                        </li>
                    ))}
                    {myTasks.length === 0 && <li>No assigned tasks.</li>}
                </ul>
            </div>
        </div>
    );
}
