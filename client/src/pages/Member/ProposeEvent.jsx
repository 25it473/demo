import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProposeEvent = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        venue: '',
        suggestedDate: '',
        expectedParticipants: ''
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        await fetch('http://localhost:5000/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        navigate('/member/proposals');
    };

    return (
        <div style={{ width: '100%' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 'bold' }}>Submit New Proposal</h1>
            <div className="glass-card" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>Title *</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Event title"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>Description</label>
                        <textarea
                            className="input-field"
                            rows="4"
                            placeholder="Describe your event idea"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                        ></textarea>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>Venue</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Suggested venue"
                            value={formData.venue}
                            onChange={e => setFormData({ ...formData, venue: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>Suggested Date</label>
                        <input
                            type="date"
                            className="input-field"
                            value={formData.suggestedDate}
                            onChange={e => setFormData({ ...formData, suggestedDate: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>Expected Participants</label>
                        <input
                            type="number"
                            className="input-field"
                            placeholder="Estimated number"
                            value={formData.expectedParticipants}
                            onChange={e => setFormData({ ...formData, expectedParticipants: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', background: '#34A853' }}>Submit Proposal</button>
                </form>
            </div>
        </div>
    );
};

export default ProposeEvent;
