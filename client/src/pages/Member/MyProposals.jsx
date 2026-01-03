import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, MessageSquare, MapPin, Calendar, Users, Plus, Trash2 } from 'lucide-react';

const MyProposals = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        const token = localStorage.getItem('token');
        try {
            // Use the dedicated 'my-proposals' endpoint which returns all events (pending, approved, declined)
            // for the current user only. This satisfies the requirement "all their proposals ... of themselves only".
            const res = await fetch('http://localhost:5000/api/events/my-proposals', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setEvents(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleVote = async (eventId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/events/${eventId}/vote`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                // Refresh events to show updated vote count
                fetchEvents();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to vote');
            }
        } catch (error) {
            console.error(error);
            alert('Error voting');
        }
    };

    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

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
                alert('Failed to delete event');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting event');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading proposals...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Community Proposals</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Vote on events you want to see happen!</p>
                </div>
                <Link to="/member/propose" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={20} /> Propose Event
                </Link>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {events.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No pending proposals at the moment.</p>}
                {events.map(event => (
                    <div key={event._id} className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{event.title}</h3>
                                    <span style={{
                                        background: event.status === 'approved' ? 'var(--color-green)' : event.status === 'declined' ? 'var(--color-red)' : '#FBBC04',
                                        color: event.status === 'pending' ? 'black' : 'white',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        textTransform: 'capitalize'
                                    }}>
                                        {event.status === 'pending' ? 'Needs Votes' : event.status}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{event.description}</p>

                                <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <MapPin size={16} /> <span>{event.venue || 'TBD'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={16} /> <span>{event.suggestedDate ? new Date(event.suggestedDate).toLocaleDateString() : 'Date TBD'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Users size={16} /> <span>Max {event.expectedParticipants || '100'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <MessageSquare size={16} /> <span>{event.discussion?.length || 0} comments</span>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Proposed by: {event.proposedBy?.username}</p>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginLeft: '2rem' }}>
                                <button
                                    onClick={() => handleVote(event._id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '8px 16px', borderRadius: '8px',
                                        border: '1px solid #34A853', background: 'transparent', color: '#34A853',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    className="hover-scale"
                                >
                                    <ThumbsUp size={18} /> {event.votes?.length || 0} Vote
                                </button>

                                {(currentUser.role === 'admin' || (event.proposedBy && event.proposedBy._id === currentUser.id) || (event.proposedBy && event.proposedBy.username === currentUser.username)) && (
                                    <button
                                        onClick={() => handleDelete(event._id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '8px', borderRadius: '8px',
                                            border: '1px solid var(--color-red)', background: 'transparent', color: 'var(--color-red)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hover-scale"
                                        title="Delete Event"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyProposals;
