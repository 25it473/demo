import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import MultiSelect from '../../components/MultiSelect';

const MemberEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

    const [allUsers, setAllUsers] = useState([]);
    const [newTask, setNewTask] = useState({ title: '', assignedTo: [] });
    const [expandedEventId, setExpandedEventId] = useState(null);

    const fetchEvents = async () => {
        const token = localStorage.getItem('token');
        try {
            // Fetch only approved events
            const res = await fetch('http://localhost:5000/api/events?status=approved', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(await res.json());

            // If admin, fetch all users for task assignment
            if (currentUser.role === 'admin') {
                const usersRes = await fetch('http://localhost:5000/api/admin/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAllUsers(await usersRes.json());
            }

            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/events/${eventId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                fetchEvents();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete event');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting event: ' + error.message);
        }
    };

    const handleAddTask = async (eventId) => {
        if (!newTask.title || newTask.assignedTo.length === 0) return alert('Please fill all fields');
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/events/${eventId}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newTask)
            });
            if (res.ok) {
                setNewTask({ title: '', assignedTo: [] });
                fetchEvents();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to add task');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred: ' + error.message);
        }
    };

    const handleTaskStatus = async (eventId, taskId, currentStatus) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/events/${eventId}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchEvents();
            } else {
                alert('Failed to update task');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Events</h1>
                <p style={{ color: 'var(--text-muted)' }}>View events, manage tasks, and discuss with your team.</p>
            </div>

            <div className="glass-card" style={{ padding: '2rem', minHeight: '300px' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Upcoming Events</h2>

                {events.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
                        No approved events yet
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        {events.map(event => (
                            <div key={event._id} style={{ border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1.5rem', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                                    <h3 style={{ fontWeight: 'bold', fontSize: '1.2rem', paddingRight: '30px' }}>{event.title}</h3>
                                    {currentUser.role === 'admin' && (
                                        <button
                                            onClick={() => handleDelete(event._id)}
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-red)' }}
                                            title="Delete Event"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0' }}>{event.description}</p>
                                <div style={{ fontSize: '0.9rem', marginTop: '1rem', color: 'var(--color-blue)' }}>
                                    📅 {event.suggestedDate ? new Date(event.suggestedDate).toLocaleDateString() : 'Date TBD'}
                                </div>

                                {/* Tasks Section */}
                                {(event.tasks?.length > 0 || currentUser.role === 'admin') && (
                                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Tasks</h4>
                                            {currentUser.role === 'admin' && (
                                                <button
                                                    onClick={() => setExpandedEventId(expandedEventId === event._id ? null : event._id)}
                                                    style={{ background: 'transparent', border: 'none', color: 'var(--color-blue)', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    {expandedEventId === event._id ? 'Close' : 'Manage Tasks'}
                                                </button>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {event.tasks && event.tasks.map((task, idx) => {
                                                const isAssignedToMe = task.assignedTo && task.assignedTo.some(u =>
                                                    (u._id === currentUser.id || u.username === currentUser.username)
                                                );
                                                const isCompletedByMe = task.completedBy && (task.completedBy.includes(currentUser.id) || task.completedBy.includes(currentUser._id));
                                                const isFullyCompleted = task.status === 'completed';

                                                return (
                                                    <div key={idx} style={{
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '6px',
                                                        opacity: isFullyCompleted ? 0.6 : 1,
                                                        flexWrap: 'wrap', gap: '8px'
                                                    }}>
                                                        <div style={{ flex: 1, minWidth: '200px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                                <span style={{
                                                                    display: 'block', fontSize: '0.9rem',
                                                                    textDecoration: isFullyCompleted ? 'line-through' : 'none',
                                                                    color: isFullyCompleted ? 'var(--text-muted)' : 'white'
                                                                }}>{task.title}</span>
                                                                {task.deadline && (
                                                                    <span style={{ fontSize: '0.75rem', color: '#EA4335', background: 'rgba(234, 67, 53, 0.1)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                                                                        Due: {new Date(task.deadline).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                                                                {task.assignedTo && task.assignedTo.length > 0
                                                                    ? task.assignedTo.map(u => u.username).join(', ')
                                                                    : 'Unassigned'}
                                                                {isAssignedToMe && !isFullyCompleted && isCompletedByMe && (
                                                                    <span style={{ marginLeft: '8px', color: 'var(--color-blue)', fontStyle: 'italic', display: 'inline-block' }}>
                                                                        (You marked done - Waiting for others)
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        {isAssignedToMe ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={isCompletedByMe || isFullyCompleted}
                                                                disabled={isCompletedByMe || isFullyCompleted} // Once marked, can't unmark in this logic effectively without backend changes
                                                                onChange={() => handleTaskStatus(event._id, task._id, 'completed')}
                                                                style={{ cursor: isCompletedByMe ? 'default' : 'pointer', width: '16px', height: '16px', flexShrink: 0 }}
                                                            />
                                                        ) : (
                                                            <span style={{
                                                                fontSize: '0.7rem',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                background: isFullyCompleted ? 'var(--color-green)' : 'rgba(255,255,255,0.1)',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {task.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Admin Add Task Form */}
                                        {currentUser.role === 'admin' && expandedEventId === event._id && (
                                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                                                <input
                                                    className="input-field"
                                                    style={{ marginBottom: '0', padding: '8px', fontSize: '0.9rem' }}
                                                    placeholder="Task Title"
                                                    value={newTask.title}
                                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                                />
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    <div style={{ flex: 1, minWidth: '150px' }}>
                                                        <MultiSelect
                                                            options={allUsers.map(u => ({ value: u._id, label: u.username }))}
                                                            value={newTask.assignedTo}
                                                            onChange={val => setNewTask({ ...newTask, assignedTo: val })}
                                                            placeholder="Assign To..."
                                                        />
                                                    </div>
                                                    <input
                                                        type="date"
                                                        className="input-field"
                                                        style={{ width: 'auto', marginBottom: 0, padding: '8px', fontSize: '0.9rem', flex: 1, minWidth: '120px' }}
                                                        value={newTask.deadline || ''}
                                                        onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                                                    />
                                                    <button
                                                        onClick={() => handleAddTask(event._id)}
                                                        className="btn-primary"
                                                        style={{ padding: '8px 16px', fontSize: '0.9rem', flex: 1, minWidth: '100px' }}
                                                    >
                                                        Add Task
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberEvents;
