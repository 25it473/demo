import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, MessageSquare, Send, Calendar, MapPin, User, Plus, Edit2, Trash2 } from 'lucide-react';

const CommunityProposals = () => {
    const [activeTab, setActiveTab] = useState('community'); // 'community' or 'my_proposals'
    const [events, setEvents] = useState([]); // Community events
    const [myEvents, setMyEvents] = useState([]); // User's own events
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [commentText, setCommentText] = useState({});
    const [activeCommentSection, setActiveCommentSection] = useState(null);

    const fetchCommunityEvents = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/events?status=pending', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setEvents(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMyEvents = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/events/my-proposals', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setMyEvents(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (activeTab === 'community') fetchCommunityEvents();
        else fetchMyEvents();
    }, [activeTab]);

    const handleVote = async (eventId, type) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/events/${eventId}/vote`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ type })
            });
            if (res.ok) fetchCommunityEvents();
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
                fetchCommunityEvents();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/events/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchMyEvents(); // Refetch my events
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Proposals</h1>
                <Link to="/member/propose" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={20} /> Propose New Event
                </Link>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-light)' }}>
                <button
                    onClick={() => setActiveTab('community')}
                    style={{
                        padding: '10px 20px', background: 'transparent', border: 'none',
                        color: activeTab === 'community' ? 'var(--color-blue)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'community' ? '2px solid var(--color-blue)' : 'none',
                        cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    Community Voting
                </button>
                <button
                    onClick={() => setActiveTab('my_proposals')}
                    style={{
                        padding: '10px 20px', background: 'transparent', border: 'none',
                        color: activeTab === 'my_proposals' ? 'var(--color-blue)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'my_proposals' ? '2px solid var(--color-blue)' : 'none',
                        cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    My Proposals
                </button>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {activeTab === 'community' ? (
                    /* COMMUNITY TAB CONTENT */
                    events.length === 0 ? <p>No pending proposals.</p> : events.map(event => {
                        const isUpvoted = event.upvotes?.includes(currentUser.id) || event.upvotes?.includes(currentUser._id);
                        const isDownvoted = event.downvotes?.includes(currentUser.id) || event.downvotes?.includes(currentUser._id);
                        return (
                            <div key={event._id} className="glass-card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{event.title}</h3>
                                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{event.description}</p>
                                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--color-blue)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16} /> {event.proposedBy?.username}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {event.suggestedDate ? new Date(event.suggestedDate).toLocaleDateString() : 'TBD'}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>
                                        <button onClick={() => handleVote(event._id, 'up')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isUpvoted ? '#34A853' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <ThumbsUp size={24} fill={isUpvoted ? '#34A853' : 'none'} />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{event.upvotes?.length || 0}</span>
                                        </button>
                                        <button onClick={() => handleVote(event._id, 'down')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isDownvoted ? '#EA4335' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <ThumbsDown size={24} fill={isDownvoted ? '#EA4335' : 'none'} />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{event.downvotes?.length || 0}</span>
                                        </button>
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '1rem' }}>
                                    <button onClick={() => setActiveCommentSection(activeCommentSection === event._id ? null : event._id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                        <MessageSquare size={16} /> {event.discussion?.length || 0} Comments
                                    </button>
                                    {activeCommentSection === event._id && (
                                        <div style={{ animation: 'fadeIn 0.3s' }}>
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
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input className="input-field" style={{ marginBottom: 0 }} placeholder="Add a comment..." value={commentText[event._id] || ''} onChange={(e) => setCommentText({ ...commentText, [event._id]: e.target.value })} />
                                                <button onClick={() => handleComment(event._id)} className="btn-primary" style={{ width: 'auto', padding: '0 1rem' }}><Send size={18} /></button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    /* MY PROPOSALS TAB CONTENT */
                    myEvents.length === 0 ? <p>You haven't proposed any events yet.</p> : myEvents.map(event => (
                        <div key={event._id} className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
                            <div style={{
                                position: 'absolute', top: '1rem', right: '1rem', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'capitalize',
                                background: event.status === 'approved' ? 'rgba(52, 168, 83, 0.2)' : event.status === 'declined' ? 'rgba(234, 67, 53, 0.2)' : 'rgba(251, 188, 4, 0.2)',
                                color: event.status === 'approved' ? '#34A853' : event.status === 'declined' ? '#EA4335' : '#FBBC04',
                                border: `1px solid ${event.status === 'approved' ? '#34A853' : event.status === 'declined' ? '#EA4335' : '#FBBC04'}`
                            }}>
                                {event.status}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', paddingRight: '100px' }}>{event.title}</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{event.description}</p>
                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--color-blue)', marginBottom: '1rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {event.suggestedDate ? new Date(event.suggestedDate).toLocaleDateString() : 'TBD'}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {event.venue || 'TBD'}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34A853' }}><ThumbsUp size={16} /> {event.upvotes?.length || 0} Votes</span>
                            </div>
                            {event.status === 'pending' && (
                                <button onClick={() => handleDelete(event._id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                                    <Trash2 size={16} /> Withdrawal Proposal
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
export default CommunityProposals;
