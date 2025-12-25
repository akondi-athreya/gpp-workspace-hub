import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';

export default function ProjectDetails() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', status: 'todo', assignedTo: '' });
    const [creating, setCreating] = useState(false);
    const [editingProject, setEditingProject] = useState(false);
    const [editProjectForm, setEditProjectForm] = useState({ name: '', description: '', status: 'active' });
    const [editingTask, setEditingTask] = useState(null);
    const [editTaskForm, setEditTaskForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo', assignedTo: '' });
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [assignedFilter, setAssignedFilter] = useState('all');

    useEffect(() => {
        const load = async () => {
            setError('');
            try {
                const [projRes, tasksRes, usersRes] = await Promise.all([
                    api.get('/projects', { params: { search: '' } }),
                    api.get(`/projects/${projectId}/tasks`),
                    api.get('/auth/me').then(res => 
                        api.get(`/tenants/${res.data.data.tenant.id}/users`)
                    ).catch(() => ({ data: { data: { users: [] } } }))
                ]);
                const found = projRes.data.data.projects?.find((p) => p.id === projectId) || null;
                setProject(found);
                setTasks(tasksRes.data.data.tasks || []);
                setUsers(usersRes.data.data.users || []);
                if (found) {
                    setEditProjectForm({ name: found.name, description: found.description || '', status: found.status });
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load project');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [projectId]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) {
            setError('Task title is required');
            return;
        }
        setCreating(true);
        try {
            const payload = { ...newTask };
            if (!payload.assignedTo) delete payload.assignedTo;
            const { data } = await api.post(`/projects/${projectId}/tasks`, payload);
            setTasks([...tasks, data.data]);
            setNewTask({ title: '', description: '', priority: 'medium', status: 'todo', assignedTo: '' });
            setShowCreateForm(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create task');
        } finally {
            setCreating(false);
        }
    };

    const handleEditProject = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/projects/${projectId}`, editProjectForm);
            setProject({ ...project, ...data.data });
            setEditingProject(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update project');
        }
    };

    const handleUpdateTaskStatus = async (taskId, newStatus) => {
        try {
            await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update task status');
        }
    };

    const handleEditTask = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...editTaskForm };
            if (!payload.assignedTo) payload.assignedTo = null;
            const { data } = await api.put(`/tasks/${editingTask}`, payload);
            setTasks(tasks.map(t => t.id === editingTask ? data.data : t));
            setEditingTask(null);
            setEditTaskForm({ title: '', description: '', priority: 'medium', status: 'todo', assignedTo: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update task');
        }
    };

    const startEditTask = (task) => {
        setEditingTask(task.id);
        setEditTaskForm({
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            assignedTo: task.assignedTo?.id || ''
        });
    };

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

    const filteredTasks = tasks.filter(t => {
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
        if (assignedFilter !== 'all') {
            if (assignedFilter === 'unassigned' && t.assignedTo) return false;
            if (assignedFilter !== 'unassigned' && t.assignedTo?.id !== assignedFilter) return false;
        }
        return true;
    });

    if (loading) return <div className="card">Loading project...</div>;
    if (error && !project) return <div className="card error">{error}</div>;
    if (!project) return <div className="card">Project not found.</div>;

    return (
        <div className="grid">
            <div className="card">
                {editingProject ? (
                    <form onSubmit={handleEditProject} className="form">
                        <h3>Edit Project</h3>
                        <label>Project Name
                            <input value={editProjectForm.name} onChange={(e) => setEditProjectForm({ ...editProjectForm, name: e.target.value })} required />
                        </label>
                        <label>Description
                            <textarea value={editProjectForm.description} onChange={(e) => setEditProjectForm({ ...editProjectForm, description: e.target.value })} style={{ minHeight: '60px' }} />
                        </label>
                        <label>Status
                            <select value={editProjectForm.status} onChange={(e) => setEditProjectForm({ ...editProjectForm, status: e.target.value })}>
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                                <option value="completed">Completed</option>
                            </select>
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit">Save Changes</button>
                            <button type="button" onClick={() => setEditingProject(false)} style={{ background: '#666' }}>Cancel</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div>
                                <h2>{project.name}</h2>
                                <p>{project.description || 'No description provided.'}</p>
                                <div className="meta">Status: {project.status}</div>
                                <div className="meta">Created By: {project.createdBy?.fullName || 'N/A'}</div>
                            </div>
                            <button onClick={() => setEditingProject(true)} style={{ padding: '8px 15px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                Edit Project
                            </button>
                        </div>
                    </>
                )}
            </div>
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3>Tasks ({filteredTasks.length})</h3>
                    <button 
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        style={{ padding: '8px 15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        {showCreateForm ? 'Cancel' : '+ New Task'}
                    </button>
                </div>
                
                {error && <div className="error" style={{ marginBottom: '10px' }}>{error}</div>}
                
                {/* Filters */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '6px' }}>
                        <option value="all">All Status</option>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                    <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ padding: '6px' }}>
                        <option value="all">All Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <select value={assignedFilter} onChange={(e) => setAssignedFilter(e.target.value)} style={{ padding: '6px' }}>
                        <option value="all">All Assigned</option>
                        <option value="unassigned">Unassigned</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                    </select>
                </div>
                
                {showCreateForm && (
                    <form onSubmit={handleCreateTask} className="form" style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
                        <h4 style={{ marginTop: 0 }}>Create New Task</h4>
                        <label>Task Title
                            <input 
                                type="text" 
                                value={newTask.title} 
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                required
                            />
                        </label>
                        <label>Description
                            <textarea 
                                value={newTask.description} 
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                style={{ minHeight: '60px' }}
                            />
                        </label>
                        <label>Priority
                            <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </label>
                        <label>Assign To
                            <select value={newTask.assignedTo} onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}>
                                <option value="">Unassigned</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                            </select>
                        </label>
                        <button type="submit" disabled={creating}>
                            {creating ? 'Creating...' : 'Create Task'}
                        </button>
                    </form>
                )}
                
                {editingTask && (
                    <form onSubmit={handleEditTask} className="form" style={{ marginBottom: '20px', padding: '15px', background: '#f0f8ff', borderRadius: '4px' }}>
                        <h4 style={{ marginTop: 0 }}>Edit Task</h4>
                        <label>Task Title
                            <input value={editTaskForm.title} onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })} required />
                        </label>
                        <label>Description
                            <textarea value={editTaskForm.description} onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })} style={{ minHeight: '60px' }} />
                        </label>
                        <label>Status
                            <select value={editTaskForm.status} onChange={(e) => setEditTaskForm({ ...editTaskForm, status: e.target.value })}>
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </label>
                        <label>Priority
                            <select value={editTaskForm.priority} onChange={(e) => setEditTaskForm({ ...editTaskForm, priority: e.target.value })}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </label>
                        <label>Assign To
                            <select value={editTaskForm.assignedTo} onChange={(e) => setEditTaskForm({ ...editTaskForm, assignedTo: e.target.value })}>
                                <option value="">Unassigned</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                            </select>
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit">Update Task</button>
                            <button type="button" onClick={() => setEditingTask(null)} style={{ background: '#666' }}>Cancel</button>
                        </div>
                    </form>
                )}
                
                <ul className="list">
                    {filteredTasks.map((t) => (
                        <li key={t.id}>
                            <div className="row">
                                <div style={{ flex: 1 }}>
                                    <strong>{t.title}</strong>
                                    <div className="meta">{t.description || 'No description'}</div>
                                    <div className="meta">
                                        <select 
                                            value={t.status} 
                                            onChange={(e) => handleUpdateTaskStatus(t.id, e.target.value)}
                                            style={{ padding: '2px 6px', fontSize: '0.85em', marginRight: '8px' }}
                                        >
                                            <option value="todo">To Do</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                        · Priority: {t.priority}
                                    </div>
                                    {t.assignedTo && <div className="meta">Assigned: {t.assignedTo.fullName}</div>}
                                    {!t.assignedTo && <div className="meta" style={{ color: '#999' }}>Unassigned</div>}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <button 
                                        onClick={() => startEditTask(t)}
                                        style={{ padding: '5px 10px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="btn-delete" 
                                        onClick={() => handleDeleteTask(t.id)}
                                        disabled={deleting === t.id}
                                        style={{ padding: '5px 10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: deleting === t.id ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                                    >
                                        {deleting === t.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                    {filteredTasks.length === 0 && tasks.length > 0 && <li>No tasks match your filters.</li>}
                    {tasks.length === 0 && <li>No tasks yet. Create your first task to get started!</li>}
                </ul>
            </div>
        </div>
    );
}
