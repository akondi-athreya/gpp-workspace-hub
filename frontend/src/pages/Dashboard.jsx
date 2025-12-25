import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0
    });
    const [recentProjects, setRecentProjects] = useState([]);
    const [myTasks, setMyTasks] = useState([]);
    const [taskFilter, setTaskFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                // Get projects
                const projectsRes = await api.get('/projects?limit=5');
                const projects = projectsRes.data.data.projects || [];
                setRecentProjects(projects);

                // Calculate statistics
                let totalTasks = 0;
                let completedTasks = 0;
                
                // Get tasks for each project to calculate stats
                const taskPromises = projects.map(p => 
                    api.get(`/projects/${p.id}/tasks`).catch(() => ({ data: { data: { tasks: [] } } }))
                );
                const tasksResponses = await Promise.all(taskPromises);
                
                tasksResponses.forEach(res => {
                    const tasks = res.data.data.tasks || [];
                    totalTasks += tasks.length;
                    completedTasks += tasks.filter(t => t.status === 'completed').length;
                });

                setStats({
                    totalProjects: projects.length,
                    totalTasks,
                    completedTasks,
                    pendingTasks: totalTasks - completedTasks
                });

                // Get user's assigned tasks
                if (user && projects.length > 0) {
                    const allMyTasks = [];
                    for (const project of projects) {
                        const res = await api.get(`/projects/${project.id}/tasks?assignedTo=${user.id}`).catch(() => ({ data: { data: { tasks: [] } } }));
                        allMyTasks.push(...(res.data.data.tasks || []));
                    }
                    setMyTasks(allMyTasks.slice(0, 5));
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ marginBottom: '8px' }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '2.5rem', color: '#1f2937' }}>Dashboard</h1>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '1.1rem' }}>Welcome back, {user?.fullName}! Here's your workspace overview.</p>
            </div>
            
            {/* Statistics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div className="card" style={{ 
                    textAlign: 'center', 
                    padding: '28px 20px',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none'
                }}>
                    
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '2.5rem', fontWeight: '700' }}>{stats.totalProjects}</h2>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>Total Projects</p>
                </div>
                <div className="card" style={{ 
                    textAlign: 'center', 
                    padding: '28px 20px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none'
                }}>
                    
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '2.5rem', fontWeight: '700' }}>{stats.totalTasks}</h2>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>Total Tasks</p>
                </div>
                <div className="card" style={{ 
                    textAlign: 'center', 
                    padding: '28px 20px',
                    background: '#059669',
                    color: 'white',
                    border: 'none'
                }}>
                    
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '2.5rem', fontWeight: '700' }}>{stats.completedTasks}</h2>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>Completed Tasks</p>
                </div>
                <div className="card" style={{ 
                    textAlign: 'center', 
                    padding: '28px 20px',
                    background: '#ea580c',
                    color: 'white',
                    border: 'none'
                }}>
                    
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '2.5rem', fontWeight: '700' }}>{stats.pendingTasks}</h2>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>Pending Tasks</p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid">
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1f2937' }}>Recent Projects</h3>
                        <Link to="/projects" className="link" style={{ fontSize: '0.9rem' }}>View All →</Link>
                    </div>
                    <ul className="list">
                        {recentProjects.map((p) => (
                            <li key={p.id}>
                                <Link to={`/projects/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <strong>{p.name}</strong>
                                    <div className="meta">{p.status} · {p.taskCount || 0} tasks · {p.completedTaskCount || 0} done</div>
                                </Link>
                            </li>
                        ))}
                        {recentProjects.length === 0 && <li>No projects yet.</li>}
                    </ul>
                </div>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1f2937' }}>My Tasks</h3>
                        <select 
                            value={taskFilter} 
                            onChange={(e) => setTaskFilter(e.target.value)} 
                            style={{ 
                                padding: '8px 16px', 
                                borderRadius: '8px',
                                border: '2px solid #e2e8f0',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >                            <option value="all">All</option>
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    <ul className="list">
                        {myTasks.filter(t => taskFilter === 'all' || t.status === taskFilter).map((t) => (
                            <li key={t.id}>
                                <strong>{t.title}</strong>
                                <div className="meta">
                                    {t.status} · {t.priority}
                                    {t.dueDate && <span> · Due: {new Date(t.dueDate).toLocaleDateString()}</span>}
                                </div>
                            </li>
                        ))}
                        {myTasks.filter(t => taskFilter === 'all' || t.status === taskFilter).length === 0 && <li>No tasks found.</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
}
