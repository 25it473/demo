import { useEffect, useState } from 'react';
import { Calendar, MessageSquare, CheckCircle, Users } from 'lucide-react';

const MemberDashboard = () => {
    const [stats, setStats] = useState({ upcomingEvents: 0, myProposals: 0, tasksCompleted: 0, tasksPending: 0 });
    const [loading, setLoading] = useState(true);
    const [myPendingTasks, setMyPendingTasks] = useState([]);
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        try {
            const [statsRes, eventsRes] = await Promise.all([
                fetch('http://localhost:5000/api/stats/member-stats', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('http://localhost:5000/api/events?status=approved', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const statsData = await statsRes.json();
            const eventsData = await eventsRes.json();

            setStats(statsData);

            // Filter tasks assigned to current user that are NOT completed
            const tasks = [];
            eventsData.forEach(event => {
                if (event.tasks) {
                    event.tasks.forEach(task => {
                        const assignedToArray = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
                        const isAssigned = assignedToArray.some(u => u && (u._id === currentUser.id || u.username === currentUser.username));
                        if (isAssigned && task.status !== 'completed') {
                            tasks.push({ ...task, eventId: event._id, eventTitle: event.title });
                        }
                    });
                }
            });
            setMyPendingTasks(tasks);
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
                // Remove from local state to "vanish" it immediately
                setMyPendingTasks(prev => prev.filter(t => t._id !== taskId));
                // Update stats locally (optional, but good for consistency)
                setStats(prev => ({
                    ...prev,
                    tasksPending: prev.tasksPending - 1,
                    tasksCompleted: prev.tasksCompleted + 1
                }));
            }
        } catch (error) {
            console.error(error);
        }
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
            {/* Header / Top Bar would go here if not in Layout */}

            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Member Dashboard</h1>

            {/* Welcome Banner - Top */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome to GDGC BVM</h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    Explore events, submit proposals, and collaborate with your team!
                </p>
            </div>

            {/* Stats Grid - 2x2 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard
                    title="Upcoming Events"
                    count={stats.upcomingEvents}
                    icon={Calendar}
                    color="#4285F4"
                    bgColor="rgba(66, 133, 244, 0.1)"
                />
                <StatCard
                    title="My Proposals"
                    count={stats.myProposals}
                    icon={MessageSquare}
                    color="#34A853"
                    bgColor="rgba(52, 168, 83, 0.1)"
                />
                <StatCard
                    title="Tasks Pending"
                    count={stats.tasksPending}
                    icon={CheckCircle}
                    color="#FBBC04"
                    bgColor="rgba(251, 188, 4, 0.1)"
                />
                <StatCard
                    title="Tasks Completed"
                    count={stats.tasksCompleted}
                    icon={CheckCircle}
                    color="#EA4335"
                    bgColor="rgba(234, 67, 53, 0.1)"
                />
            </div>

            {/* My Pending Tasks Section - Bottom Full Width */}
            <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>My Pending Tasks</h2>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    {myPendingTasks.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No pending tasks assigned to you. Great job!</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {myPendingTasks.map(task => (
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
                                            background: 'transparent',
                                            border: '1px solid var(--color-green)',
                                            color: 'var(--color-green)',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid currentColor' }}></div>
                                        Mark Done
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;
