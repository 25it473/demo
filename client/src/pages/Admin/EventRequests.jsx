import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Check, X, Edit2, Save, Plus, ThumbsUp, ThumbsDown, MessageSquare, Send } from 'lucide-react';

const EventRequests = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingEvent, setEditingEvent] = useState(null);
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [commentText, setCommentText] = useState({});
    const [activeCommentSection, setActiveCommentSection] = useState(null);

    const fetchEvents = async () => {
        const token = localStorage.getItem('token');
        try {
            // Remove ?status=pending to get ALL events (Admin sees all by default in backend)
            const res = await fetch('http://localhost:5000/api/events', {
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

    const handleVote = async (eventId, type) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/events/${eventId}/vote`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ type })
            });
            if (res.ok) fetchEvents();
        } catch (error) {
            console.error(error);
        }
    };

    const handleComment = async (eventId) => {
        const text = commentText[eventId];
        if (!text?.trim()) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/events/${eventId}/discussion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ text })
            });
            if (res.ok) {
                setCommentText(prev => ({ ...prev, [eventId]: '' }));
                fetchEvents();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateAndApprove = async (event) => {
        // If editing, use the edited values, otherwise use original
        const eventData = editingEvent && editingEvent._id === event._id ? editingEvent : event;

        const token = localStorage.getItem('token');
        try {
            const updateRes = await fetch(`http://localhost:5000/api/events/${event._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ ...eventData, status: 'approved' }) // Update data AND approve
            });

            if (updateRes.ok) {
                setEditingEvent(null);
                fetchEvents();
            } else {
                alert('Failed to update/approve event');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDecline = async (id) => {
        if (!window.confirm('Are you sure you want to decline this event?')) return;
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/events/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status: 'declined' })
        });
        fetchEvents();
    };

    const handleInputChange = (e, field) => {
        setEditingEvent(prev => ({ ...prev, [field]: e.target.value }));
    };

    const startEditing = (event) => {
        setEditingEvent({ ...event });
    };

    const cancelEditing = () => {
        setEditingEvent(null);
    };

    if (loading) return <div className="text-center p-8">Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Event Proposals</h1>
                <Link to="/member/propose" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={20} /> Propose New Event
                </Link>
            </div>

            <div className="glass-card" style={{ padding: '2rem' }}>
                {events.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No event proposals found.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '2rem' }}>
                        {events.map(event => {
                            const isEditing = editingEvent && editingEvent._id === event._id;
                            const displayEvent = isEditing ? editingEvent : event;
                            const isUpvoted = event.upvotes?.includes(currentUser.id) || event.upvotes?.includes(currentUser._id);
                            const isDownvoted = event.downvotes?.includes(currentUser.id) || event.downvotes?.includes(currentUser._id);

                            return (
                                <div key={event._id} style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-light)',
                                    padding: '1.5rem',
                                    position: 'relative'
                                }}>
                                    {/* Status Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        textTransform: 'capitalize',
                                        background: event.status === 'approved' ? 'rgba(52, 168, 83, 0.2)' : event.status === 'declined' ? 'rgba(234, 67, 53, 0.2)' : 'rgba(251, 188, 4, 0.2)',
                                        color: event.status === 'approved' ? '#34A853' : event.status === 'declined' ? '#EA4335' : '#FBBC04',
                                        border: `1px solid ${event.status === 'approved' ? '#34A853' : event.status === 'declined' ? '#EA4335' : '#FBBC04'}`
                                    }}>
                                        {event.status}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '1rem' }}>
                                            <div style={{ flex: 1, minWidth: '280px' }}>
                                                {isEditing ? (
                                                    <div style={{ display: 'grid', gap: '1rem', width: '100%' }}>
                                                        <input
                                                            className="input-field"
                                                            value={displayEvent.title}
                                                            onChange={(e) => handleInputChange(e, 'title')}
                                                            placeholder="Event Title"
                                                        />
                                                        <textarea
                                                            className="input-field"
                                                            value={displayEvent.description}
                                                            onChange={(e) => handleInputChange(e, 'description')}
                                                            placeholder="Description"
                                                            rows={3}
                                                        />
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                                            <input
                                                                className="input-field"
                                                                value={displayEvent.venue || ''}
                                                                onChange={(e) => handleInputChange(e, 'venue')}
                                                                placeholder="Venue"
                                                            />
                                                            <input
                                                                type="date"
                                                                className="input-field"
                                                                value={displayEvent.suggestedDate ? new Date(displayEvent.suggestedDate).toISOString().split('T')[0] : ''}
                                                                onChange={(e) => handleInputChange(e, 'suggestedDate')}
                                                            />
                                                        </div>
                                                        <input
                                                            type="number"
                                                            className="input-field"
                                                            value={displayEvent.expectedParticipants || ''}
                                                            onChange={(e) => handleInputChange(e, 'expectedParticipants')}
                                                            placeholder="Exp. Participants"
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', paddingRight: '10px' }}>{event.title}</h3>
                                                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', wordBreak: 'break-word' }}>{event.description}</p>
                                                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--color-blue)' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {event.suggestedDate ? new Date(event.suggestedDate).toLocaleDateString() : 'TBD'}</span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {event.venue || 'TBD'}</span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={16} /> {event.expectedParticipants || 0}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', maxWidth: '400px', justifyContent: 'flex-start' }}>
                                                {!isEditing && (
                                                    <button
                                                        onClick={() => startEditing(event)}
                                                        className="btn-primary"
                                                        style={{ background: 'var(--color-blue)', padding: '8px 16px', fontSize: '0.9rem', flex: 1, minWidth: '120px' }}
                                                    >
                                                        <Edit2 size={16} style={{ marginRight: '6px' }} /> Edit
                                                    </button>
                                                )}

                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateAndApprove(event)}
                                                            className="btn-primary"
                                                            style={{ background: 'var(--color-green)', padding: '8px 16px', fontSize: '0.9rem', flex: 1, minWidth: '140px' }}
                                                        >
                                                            <Save size={16} style={{ marginRight: '6px' }} /> Save
                                                        </button>
                                                        <button
                                                            onClick={cancelEditing}
                                                            className="btn-primary"
                                                            style={{ background: 'transparent', border: '1px solid var(--border-light)', padding: '8px 16px', fontSize: '0.9rem', flex: 1, minWidth: '100px' }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {event.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateAndApprove(event)}
                                                                    className="btn-primary"
                                                                    style={{ background: 'var(--color-green)', padding: '8px 16px', fontSize: '0.9rem', flex: 1, minWidth: '120px' }}
                                                                >
                                                                    <Check size={16} style={{ marginRight: '6px' }} /> Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDecline(event._id)}
                                                                    className="btn-primary"
                                                                    style={{ background: 'var(--color-red)', padding: '8px 16px', fontSize: '0.9rem', flex: 1, minWidth: '120px' }}
                                                                >
                                                                    <X size={16} style={{ marginRight: '6px' }} /> Decline
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footers: Voting & Comments */}
                                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Proposed by: <strong style={{ color: 'white' }}>{event.proposedBy?.username}</strong>
                                        </div>

                                        <div style={{ display: 'flex', gap: '2rem' }}>
                                            {/* Voting */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <button onClick={() => handleVote(event._id, 'up')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isUpvoted ? '#34A853' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <ThumbsUp size={20} fill={isUpvoted ? '#34A853' : 'none'} />
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{event.upvotes?.length || 0}</span>
                                                </button>
                                                <button onClick={() => handleVote(event._id, 'down')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isDownvoted ? '#EA4335' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <ThumbsDown size={20} fill={isDownvoted ? '#EA4335' : 'none'} />
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{event.downvotes?.length || 0}</span>
                                                </button>
                                            </div>

                                            {/* Comments Toggle */}
                                            <button onClick={() => setActiveCommentSection(activeCommentSection === event._id ? null : event._id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                                                <MessageSquare size={16} /> {event.discussion?.length || 0} Comments
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Comments Section */}
                                    {activeCommentSection === event._id && (
                                        <div style={{ animation: 'fadeIn 0.3s', marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                                            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {event.discussion?.map((comment, idx) => (
                                                    <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px' }}>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                                            <strong>{comment.user ? comment.user.username : 'Anonymous'}</strong>
                                                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p style={{ fontSize: '0.9rem' }}>{comment.text}</p>
                                                    </div>
                                                ))}
                                                {event.discussion?.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No comments yet.</p>}
                                            </div>

                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input className="input-field" style={{ marginBottom: 0 }} placeholder="Add a comment..." value={commentText[event._id] || ''} onChange={(e) => setCommentText({ ...commentText, [event._id]: e.target.value })} />
                                                <button onClick={() => handleComment(event._id)} className="btn-primary" style={{ width: 'auto', padding: '0 1rem' }}><Send size={18} /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
export default EventRequests;
