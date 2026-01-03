import { useEffect, useState } from 'react';
import { User, Check, X } from 'lucide-react';

const PendingUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/admin/users/pending', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setUsers(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleApprove = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`http://localhost:5000/api/admin/users/${id}/approve`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="text-center p-8">Loading...</div>;

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Pending User Approvals</h1>

            <div className="glass-card" style={{ padding: '2rem' }}>
                {users.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No pending user requests.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {users.map(user => (
                            <div key={user._id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '8px',
                                border: '1px solid var(--border-light)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px', height: '40px',
                                        borderRadius: '50%',
                                        background: 'var(--color-blue)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: 'bold' }}>{user.username}</h3>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{user.email} • {user.role}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleApprove(user._id)}
                                        className="btn-primary"
                                        style={{ background: 'var(--color-green)', padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <Check size={16} /> Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingUsers;
