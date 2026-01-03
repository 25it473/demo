import { useEffect, useState } from 'react';
import { Calendar, Users, UserPlus, CheckCircle, PlusCircle, X, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ pendingUsers: 0, pendingEvents: 0, totalUsers: 0, totalEvents: 0, tasksPending: 0, tasksCompleted: 0, activeEvents: 0 });
    const [users, setUsers] = useState([]);
    const [pendingTasks, setPendingTasks] = useState([]);
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [loading, setLoading] = useState(true);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'member' });

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        try {
            const [eventsRes, usersRes] = await Promise.all([
                fetch('http://localhost:5000/api/events', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('http://localhost:5000/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const eventsData = await eventsRes.json();
            const usersData = await usersRes.json();

            // Calculate Stats
            const pendingUsersCount = usersData.filter(u => u.status === 'pending').length;
            const pendingEventsCount = eventsData.filter(e => e.status === 'pending').length;
            const activeEventsCount = eventsData.filter(e => e.status === 'approved').length;

            setUsers(usersData); // Store all users for the sidebar list

            // Filter tasks assigned to current admin
            const pendingTasksList = [];
            let completedTasksCount = 0;

            eventsData.forEach(event => {
                if (event.tasks && event.status === 'approved') {
                    event.tasks.forEach(task => {
                        const assignedToArray = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
                        const isAssigned = assignedToArray.some(u => u && (u._id === currentUser.id || u.username === currentUser.username));

                        if (isAssigned) {
                            // Status check: if task is 'completed', it's done for everyone.
                            // If 'pending', check if THIS user has done it.
                            const isCompletedByUser = task.completedBy?.includes(currentUser.id) || task.completedBy?.includes(currentUser._id);

                            if (task.status === 'completed' || isCompletedByUser) {
                                completedTasksCount++;
                            } else {
                                pendingTasksList.push({ ...task, eventId: event._id, eventTitle: event.title });
                            }
                        }
                    });
                }
            });
            setPendingTasks(pendingTasksList);

            setStats({
                totalUsers: usersData.length,
                pendingUsers: pendingUsersCount,
                activeEvents: activeEventsCount,
                pendingEvents: pendingEventsCount,
                tasksPending: pendingTasksList.length,
                tasksCompleted: completedTasksCount
            });

            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTaskCompletion = async (eventId, taskId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/events/${eventId}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'completed' })
            });
            if (res.ok) {
                setPendingTasks(prev => prev.filter(t => t._id !== taskId));
                setStats(prev => ({ ...prev, tasksPending: prev.tasksPending - 1, tasksCompleted: prev.tasksCompleted + 1 }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        // Basic creation logic - strictly speaking we might need a specific route or use register 
        // For now let's assume valid route or just alert
        alert("Add User functionality to be connected to backend explicitly if needed. For now, users register themselves.");
        setShowAddUserModal(false);
    };

    const handleInputChange = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    const StatCard = ({ title, count, icon: Icon, color, bgColor }) => (
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</p>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{count}</h2>
            </div>
            <div style={{ background: bgColor, padding: '10px', borderRadius: '12px' }}>
                <Icon size={24} color={color} />
            </div>
        </div>
    );

    if (loading) return <div className="text-center p-8">Loading...</div>;

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 'bold' }}>Admin Dashboard</h1>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <Link to="/admin/users" style={{ textDecoration: 'none' }}>
                    <StatCard
                        title="Pending Users"
                        count={stats.pendingUsers}
                        icon={UserPlus}
                        color="#FBBC04"
                        bgColor="rgba(251, 188, 4, 0.1)"
                    />
                </Link>
                <Link to="/admin/requests" style={{ textDecoration: 'none' }}>
                    <StatCard
                        title="Event Requests"
                        count={stats.pendingEvents}
                        icon={Calendar}
                        color="#EA4335"
                        bgColor="rgba(234, 67, 53, 0.1)"
                    />
                </Link>
                <StatCard
                    title="Total Members"
                    count={stats.totalUsers}
                    icon={Users}
                    color="#4285F4"
                    bgColor="rgba(66, 133, 244, 0.1)"
                />
                <StatCard
                    title="Active Events"
                    count={stats.activeEvents}
                    icon={Calendar}
                    color="#34A853"
                    bgColor="rgba(52, 168, 83, 0.1)"
                />
                {/* Row 3 */}
                <StatCard
                    title="My Pending Tasks"
                    count={stats.tasksPending}
                    icon={CheckCircle}
                    color="#FBBC04"
                    bgColor="rgba(251, 188, 4, 0.1)"
                />
                <StatCard
                    title="Tasks Completed"
                    count={stats.tasksCompleted}
                    icon={CheckCircle}
                    color="#34A853"
                    bgColor="rgba(52, 168, 83, 0.1)"
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* My Pending Tasks Section (Admin's assigned tasks) */}
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>My Pending Tasks</h2>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        {pendingTasks.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>No pending tasks assigned to you.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {pendingTasks.map(task => (
                                    <div key={task._id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '1rem', borderBottom: '1px solid var(--border-light)'
                                    }}>
                                        <div>
                                            <h4 style={{ fontWeight: 'bold' }}>{task.title}</h4>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Event: {task.eventTitle}</p>
                                        </div>
                                        <button
                                            onClick={() => handleTaskCompletion(task.eventId, task._id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                background: 'rgba(52, 168, 83, 0.1)',
                                                border: '1px solid var(--color-green)',
                                                color: 'var(--color-green)',
                                                padding: '6px 16px',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: '500',
                                                transition: 'all 0.2s',
                                                whiteSpace: 'nowrap'
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--color-green)'; e.currentTarget.style.color = 'white'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(52, 168, 83, 0.1)'; e.currentTarget.style.color = 'var(--color-green)'; }}
                                        >
                                            <CheckCircle size={16} />
                                            Mark Done
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {
                showAddUserModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div className="glass-card" style={{ padding: '2rem', width: '400px', position: 'relative' }}>
                            <button
                                onClick={() => setShowAddUserModal(false)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Add New Member</h2>
                            <form onSubmit={handleAddUser}>
                                <div className="form-group">
                                    <label>Username</label>
                                    <input type="text" name="username" className="input-field" required onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" className="input-field" required onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input type="password" name="password" className="input-field" required onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select name="role" className="input-field" onChange={handleInputChange}>
                                        <option value="member">Member</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Create User</button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminDashboard;
